const express = require("express");
const db = require("../database");
const verifyToken = require("../middleware/auth");
const { sendTournamentRegistrationEmail } = require("../services/emailService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        t.*,
        u.name AS created_by_name,
        f.name AS field_name,
        f.image_url AS field_image_url,
        f.location AS field_location_text,
        f.latitude AS field_latitude,
        f.longitude AS field_longitude,
        (SELECT COUNT(*) FROM tournament_registrations tr WHERE tr.tournament_id = t.id AND tr.status = 'approved') AS registrations_count
       FROM tournaments t
       JOIN users u ON t.created_by = u.id
       LEFT JOIN fields f ON t.field_id = f.id
       ORDER BY t.start_date ASC`,
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la citirea turneelor" });
  }
});

router.get("/:id", async (req, res) => {
  const tournamentId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT
        t.*,
        u.name AS created_by_name,
        f.name AS field_name,
        f.image_url AS field_image_url,
        f.location AS field_location_text,
        f.latitude AS field_latitude,
        f.longitude AS field_longitude,
        (SELECT COUNT(*) FROM tournament_registrations tr WHERE tr.tournament_id = t.id AND tr.status = 'approved') AS registrations_count,
        (SELECT COUNT(*) FROM tournament_registrations tr WHERE tr.tournament_id = t.id AND tr.status != 'rejected') AS pending_approved_count
       FROM tournaments t
       JOIN users u ON t.created_by = u.id
       LEFT JOIN fields f ON t.field_id = f.id
       WHERE t.id = ?`,
      [tournamentId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ mesaj: "Turneul nu a fost găsit" });
    }

    const tournament = rows[0];

    const [teams] = await db.query(
      `SELECT team_name FROM tournament_registrations
       WHERE tournament_id = ? AND status = 'approved'
       ORDER BY created_at ASC`,
      [tournamentId],
    );
    tournament.enrolled_teams = teams.map((t) => t.team_name);

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la citirea turneului" });
  }
});

router.post("/:id/register", verifyToken, async (req, res) => {
  const tournamentId = req.params.id;
  const userId = req.user.userId;
  const { team_name, captain_name, captain_phone, notes, players } = req.body;

  if (!team_name || !team_name.trim()) {
    return res.status(400).json({ mesaj: "Numele echipei este obligatoriu" });
  }

  if (!players || !Array.isArray(players) || players.length === 0) {
    return res
      .status(400)
      .json({ mesaj: "Trebuie să adaugi cel puțin un jucător" });
  }

  try {
    const [tournaments] = await db.query(
      "SELECT * FROM tournaments WHERE id = ? AND status IN ('upcoming', 'active')",
      [tournamentId],
    );

    if (tournaments.length === 0) {
      return res
        .status(404)
        .json({ mesaj: "Turneul nu există sau nu mai acceptă înscrieri" });
    }

    const tournament = tournaments[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(tournament.registration_deadline);
    if (today > deadline) {
      return res.status(400).json({ mesaj: "Termenul de înscriere a expirat" });
    }

    const [countRows] = await db.query(
      "SELECT COUNT(*) AS cnt FROM tournament_registrations WHERE tournament_id = ? AND status != 'rejected'",
      [tournamentId],
    );
    if (countRows[0].cnt >= tournament.max_teams) {
      return res
        .status(400)
        .json({
          mesaj: "Turneul este complet. Nu mai sunt locuri disponibile.",
        });
    }

    const [existing] = await db.query(
      "SELECT id FROM tournament_registrations WHERE tournament_id = ? AND user_id = ? AND status != 'rejected'",
      [tournamentId, userId],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ mesaj: "Ești deja înscris la acest turneu" });
    }

    await db.query(
      "DELETE FROM tournament_registrations WHERE tournament_id = ? AND user_id = ? AND status = 'rejected'",
      [tournamentId, userId],
    );

    if (players.length !== tournament.team_size) {
      return res.status(400).json({
        mesaj: `Echipa trebuie să aibă exact ${tournament.team_size} jucători`,
      });
    }

    const invalidPlayers = players.filter((p) => !p || !p.trim());
    if (invalidPlayers.length > 0) {
      return res
        .status(400)
        .json({ mesaj: "Toate numele jucătorilor sunt obligatorii" });
    }

    const [result] = await db.query(
      `INSERT INTO tournament_registrations (tournament_id, user_id, team_name, captain_name, captain_phone, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tournamentId,
        userId,
        team_name.trim(),
        captain_name ? captain_name.trim() : null,
        captain_phone || null,
        notes || null,
      ],
    );
    const registrationId = result.insertId;

    for (const playerName of players) {
      await db.query(
        "INSERT INTO tournament_players (registration_id, player_name) VALUES (?, ?)",
        [registrationId, playerName.trim()],
      );
    }

    res.status(201).json({
      mesaj: "Echipa ta a fost înscrisă! Vei primi confirmare după aprobare.",
      registrationId,
    });

    try {
      const [userRows] = await db.query(
        "SELECT name, email FROM users WHERE id = ?",
        [userId],
      );
      if (userRows.length > 0) {
        const playerObjs = players.map((p) => ({ player_name: p }));
        sendTournamentRegistrationEmail(
          userRows[0],
          tournament,
          { team_name: team_name.trim() },
          playerObjs,
        );
      }
    } catch (emailErr) {}
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la înscrierea la turneu" });
  }
});

router.get("/my/registrations", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [registrations] = await db.query(
      `SELECT
        tr.*,
        t.name AS tournament_name,
        t.start_date,
        t.end_date,
        t.location AS tournament_location,
        t.status AS tournament_status,
        t.team_size
       FROM tournament_registrations tr
       JOIN tournaments t ON tr.tournament_id = t.id
       WHERE tr.user_id = ?
       ORDER BY tr.created_at DESC`,
      [userId],
    );

    for (const reg of registrations) {
      const [players] = await db.query(
        "SELECT player_name FROM tournament_players WHERE registration_id = ?",
        [reg.id],
      );
      reg.players = players.map((p) => p.player_name);
    }

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la citirea înscrierilor" });
  }
});

router.delete("/registrations/:id", verifyToken, async (req, res) => {
  const regId = req.params.id;
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      "SELECT * FROM tournament_registrations WHERE id = ?",
      [regId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ mesaj: "Înscrierea nu a fost găsită" });
    }

    if (rows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ mesaj: "Nu poți anula înscrierea altui utilizator" });
    }

    if (rows[0].status === "approved") {
      return res
        .status(400)
        .json({
          mesaj:
            "Înscrierea aprobată nu poate fi anulată. Contactează organizatorii.",
        });
    }

    await db.query("DELETE FROM tournament_registrations WHERE id = ?", [
      regId,
    ]);
    res.json({ mesaj: "Înscriere anulată cu succes!" });
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la anularea înscrierii" });
  }
});

module.exports = router;
