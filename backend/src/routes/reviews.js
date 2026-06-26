const express = require("express");
const db = require("../database");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.get("/field/:fieldId", async (req, res) => {
  const { fieldId } = req.params;
  try {
    const [reviews] = await db.query(
      `SELECT
        fr.id, fr.user_id, fr.rating, fr.comment, fr.created_at,
        u.name AS user_name
       FROM field_reviews fr
       JOIN users u ON fr.user_id = u.id
       WHERE fr.field_id = ?
       ORDER BY fr.created_at DESC`,
      [fieldId],
    );

    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
        : null;

    res.json({ reviews, avg_rating: avg, total_reviews: total });
  } catch (e) {
    res.status(500).json({ mesaj: "Eroare la citirea recenziilor" });
  }
});

router.post("/field/:fieldId", verifyToken, async (req, res) => {
  const { fieldId } = req.params;
  const userId = req.user.userId;
  const { rating, comment } = req.body;

  const ratingNum = parseInt(rating, 10);
  if (!rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res
      .status(400)
      .json({ mesaj: "Rating-ul trebuie să fie un număr întreg între 1 și 5" });
  }

  if (comment && comment.length > 1000) {
    return res
      .status(400)
      .json({ mesaj: "Comentariul este prea lung (max 1000 caractere)" });
  }

  try {
    const [bookings] = await db.query(
      `SELECT id FROM bookings
       WHERE field_id = ? AND user_id = ? AND status IN ('confirmed', 'completed')
       LIMIT 1`,
      [fieldId, userId],
    );
    if (bookings.length === 0) {
      return res
        .status(403)
        .json({
          mesaj: "Poți recenza doar terenuri pe care le-ai rezervat și plătit.",
        });
    }

    await db.query(
      `INSERT INTO field_reviews (field_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [fieldId, userId, ratingNum, comment ? comment.trim() : null],
    );

    res.status(201).json({ mesaj: "Recenzie salvată cu succes!" });
  } catch (e) {
    res.status(500).json({ mesaj: "Eroare la salvarea recenziei" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const [rows] = await db.query(
      "SELECT user_id FROM field_reviews WHERE id = ?",
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ mesaj: "Recenzia nu există" });

    const [user] = await db.query("SELECT role FROM users WHERE id = ?", [
      userId,
    ]);
    if (rows[0].user_id !== userId && user[0]?.role !== "admin") {
      return res
        .status(403)
        .json({ mesaj: "Nu ai permisiunea să ștergi această recenzie" });
    }

    await db.query("DELETE FROM field_reviews WHERE id = ?", [id]);
    res.json({ mesaj: "Recenzie ștearsă!" });
  } catch (e) {
    res.status(500).json({ mesaj: "Eroare la ștergerea recenziei" });
  }
});

module.exports = router;
