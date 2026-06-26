const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

const router = express.Router();

router.use(verifyToken);
router.use(adminCheck);


router.get('/fields', async (req, res) => {
  try {
    const [fields] = await db.query('SELECT * FROM fields ORDER BY id ASC');
    res.json(fields);
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la citirea terenurilor' });
  }
});


router.post('/fields', async (req, res) => {
  const { name, location, description, price_per_hour, image_url, latitude, longitude } = req.body;

  if (!name || !location || !price_per_hour) {
    return res.status(400).json({ mesaj: 'Numele, locația și prețul sunt obligatorii' });
  }

  if (name.trim().length < 3) {
    return res.status(400).json({ mesaj: 'Numele trebuie să aibă minim 3 caractere' });
  }

  const price = parseFloat(price_per_hour);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ mesaj: 'Prețul trebuie să fie un număr pozitiv' });
  }

  if (image_url && image_url.trim() !== '') {
    if (!image_url.startsWith('http://') && !image_url.startsWith('https://')) {
      return res.status(400).json({ mesaj: 'URL-ul imaginii trebuie să înceapă cu http:// sau https://' });
    }
  }

  const lat = latitude != null && latitude !== '' ? parseFloat(latitude) : null;
  const lng = longitude != null && longitude !== '' ? parseFloat(longitude) : null;
  if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
    return res.status(400).json({ mesaj: 'Latitudinea trebuie să fie între -90 și 90' });
  }
  if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
    return res.status(400).json({ mesaj: 'Longitudinea trebuie să fie între -180 și 180' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO fields (name, location, description, price_per_hour, image_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), location.trim(), description || null, price, image_url || null, lat, lng]
    );

    const [newField] = await db.query('SELECT * FROM fields WHERE id = ?', [result.insertId]);
    res.status(201).json(newField[0]);

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la crearea terenului' });
  }
});


router.put('/fields/:id', async (req, res) => {
  const fieldId = req.params.id;
  const { name, location, description, price_per_hour, image_url, latitude, longitude } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM fields WHERE id = ?', [fieldId]);
    if (existing.length === 0) {
      return res.status(404).json({ mesaj: 'Terenul nu a fost găsit' });
    }
  } catch (error) {
    return res.status(500).json({ mesaj: 'Eroare la verificarea terenului' });
  }

  if (!name || !location || !price_per_hour) {
    return res.status(400).json({ mesaj: 'Numele, locația și prețul sunt obligatorii' });
  }

  if (name.trim().length < 3) {
    return res.status(400).json({ mesaj: 'Numele trebuie să aibă minim 3 caractere' });
  }

  const price = parseFloat(price_per_hour);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ mesaj: 'Prețul trebuie să fie un număr pozitiv' });
  }

  if (image_url && image_url.trim() !== '') {
    if (!image_url.startsWith('http://') && !image_url.startsWith('https://')) {
      return res.status(400).json({ mesaj: 'URL-ul imaginii trebuie să înceapă cu http:// sau https://' });
    }
  }

  const lat = latitude != null && latitude !== '' ? parseFloat(latitude) : null;
  const lng = longitude != null && longitude !== '' ? parseFloat(longitude) : null;
  if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
    return res.status(400).json({ mesaj: 'Latitudinea trebuie să fie între -90 și 90' });
  }
  if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
    return res.status(400).json({ mesaj: 'Longitudinea trebuie să fie între -180 și 180' });
  }

  try {
    await db.query(
      'UPDATE fields SET name=?, location=?, description=?, price_per_hour=?, image_url=?, latitude=?, longitude=? WHERE id=?',
      [name.trim(), location.trim(), description || null, price, image_url || null, lat, lng, fieldId]
    );

    const [updated] = await db.query('SELECT * FROM fields WHERE id = ?', [fieldId]);
    res.json(updated[0]);

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la modificarea terenului' });
  }
});


router.delete('/fields/:id', async (req, res) => {
  const fieldId = req.params.id;

  try {
    const [existing] = await db.query('SELECT id FROM fields WHERE id = ?', [fieldId]);
    if (existing.length === 0) {
      return res.status(404).json({ mesaj: 'Terenul nu a fost găsit' });
    }

    const [activeBookings] = await db.query(
      "SELECT id FROM bookings WHERE field_id = ? AND status IN ('pending', 'confirmed')",
      [fieldId]
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        mesaj: `Nu poți șterge terenul. Are ${activeBookings.length} rezervare(i) activă(e).`
      });
    }

    await db.query('DELETE FROM fields WHERE id = ?', [fieldId]);
    res.json({ mesaj: 'Teren șters cu succes!' });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la ștergerea terenului' });
  }
});


router.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT
        bookings.id,
        bookings.booking_date,
        bookings.start_time,
        bookings.end_time,
        bookings.status,
        bookings.total_price,
        bookings.created_at,
        users.email    AS user_email,
        users.name     AS user_name,
        fields.name    AS field_name
       FROM bookings
       JOIN users  ON bookings.user_id  = users.id
       JOIN fields ON bookings.field_id = fields.id
       ORDER BY bookings.created_at DESC`
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la citirea rezervărilor' });
  }
});


router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la citirea utilizatorilor' });
  }
});


router.put('/users/:id', async (req, res) => {
  const userId  = req.params.id;
  const adminId = req.user.userId;
  const { name, phone, role } = req.body;

  if (parseInt(userId) === adminId && role && role !== 'admin') {
    return res.status(400).json({ mesaj: 'Nu îți poți schimba propriul rol de admin (te-ai bloca afară).' });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ mesaj: 'Numele este obligatoriu (minim 2 caractere).' });
  }

  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ mesaj: 'Rolul trebuie să fie "user" sau "admin".' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });
    }

    await db.query(
      'UPDATE users SET name = ?, phone = ?, role = COALESCE(?, role) WHERE id = ?',
      [name.trim(), phone ? phone.trim() : null, role || null, userId]
    );
    res.json({ mesaj: 'Utilizator actualizat cu succes!' });
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la modificarea utilizatorului.' });
  }
});


router.delete('/users/:id', async (req, res) => {
  const userId  = req.params.id;
  const adminId = req.user.userId;

  if (parseInt(userId) === adminId) {
    return res.status(400).json({ mesaj: 'Nu te poți șterge pe tine însuți.' });
  }

  try {
    const [existing] = await db.query('SELECT id, name FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit.' });
    }

    const [activeBookings] = await db.query(
      "SELECT id FROM bookings WHERE user_id = ? AND status IN ('pending', 'confirmed')",
      [userId]
    );
    if (activeBookings.length > 0) {
      return res.status(400).json({
        mesaj: `Nu poți șterge utilizatorul. Are ${activeBookings.length} rezervare(i) activă(e). Anulează-le mai întâi.`
      });
    }

    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ mesaj: `Utilizatorul "${existing[0].name}" a fost șters!` });
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la ștergerea utilizatorului.' });
  }
});


router.get('/tournaments', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM tournament_registrations tr WHERE tr.tournament_id = t.id) AS registrations_count
       FROM tournaments t ORDER BY t.created_at DESC`
    );

    for (const t of rows) {
      const [teams] = await db.query(
        `SELECT team_name FROM tournament_registrations
         WHERE tournament_id = ? AND status = 'approved' ORDER BY created_at ASC`,
        [t.id]
      );
      t.approved_team_names = teams.map(x => x.team_name);
    }

    res.json(rows);
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la citirea turneelor' });
  }
});

router.post('/tournaments', async (req, res) => {
  const { name, description, start_date, end_date, registration_deadline, max_teams, team_size, prize_info, status, field_id, format } = req.body;
  const adminId = req.user.userId;

  if (!name || !start_date || !end_date || !registration_deadline || !max_teams || !team_size) {
    return res.status(400).json({ mesaj: 'Câmpurile obligatorii: name, start_date, end_date, registration_deadline, max_teams, team_size' });
  }

  const todayStrCreate = new Date().toISOString().split('T')[0];
  if (start_date < todayStrCreate) {
    return res.status(400).json({ mesaj: 'Data de start nu poate fi în trecut' });
  }
  if (registration_deadline < todayStrCreate) {
    return res.status(400).json({ mesaj: 'Termenul limită de înscriere nu poate fi în trecut' });
  }
  if (end_date < start_date) {
    return res.status(400).json({ mesaj: 'Data de final trebuie să fie după data de start' });
  }
  if (registration_deadline > start_date) {
    return res.status(400).json({ mesaj: 'Termenul limită trebuie să fie înainte de data de start' });
  }

  const fieldId = field_id ? parseInt(field_id) : null;
  const validFormats = ['knockout', 'groups_knockout', 'league'];
  const tournamentFormat = validFormats.includes(format) ? format : 'knockout';

  try {
    const [result] = await db.query(
      `INSERT INTO tournaments (name, description, start_date, end_date, registration_deadline, max_teams, team_size, prize_info, status, created_by, field_id, format)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, start_date, end_date, registration_deadline, max_teams, team_size, prize_info || null, status || 'upcoming', adminId, fieldId, tournamentFormat]
    );
    res.status(201).json({ mesaj: 'Turneu creat cu succes!', tournamentId: result.insertId });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la crearea turneului' });
  }
});

router.put('/tournaments/:id', async (req, res) => {
  const { name, description, start_date, end_date, registration_deadline, max_teams, team_size, prize_info, status, field_id, format } = req.body;
  const tournamentId = req.params.id;

  if (!name || !start_date || !end_date || !registration_deadline) {
    return res.status(400).json({ mesaj: 'Câmpuri obligatorii lipsă' });
  }

  const fieldId = field_id ? parseInt(field_id) : null;
  const validFormats = ['knockout', 'groups_knockout', 'league'];
  const tournamentFormat = validFormats.includes(format) ? format : 'knockout';

  try {
    const [check] = await db.query('SELECT start_date, end_date, registration_deadline, status FROM tournaments WHERE id = ?', [tournamentId]);
    if (check.length === 0) return res.status(404).json({ mesaj: 'Turneul nu a fost găsit' });

    const existingStart    = check[0].start_date ? String(check[0].start_date).substring(0, 10) : null;
    const existingEnd      = check[0].end_date ? String(check[0].end_date).substring(0, 10) : null;
    const existingDeadline = check[0].registration_deadline ? String(check[0].registration_deadline).substring(0, 10) : null;
    const todayStr         = new Date().toISOString().split('T')[0];
    if (existingEnd && existingEnd < todayStr && (status === 'upcoming' || status === 'active')) {
      return res.status(400).json({
        mesaj: `Nu poți schimba statusul în "${status}" — data turneului a trecut (${existingEnd}). Statusurile permise sunt: completed (finalizat) sau cancelled (anulat).`
      });
    }

    if (start_date < todayStr && start_date !== existingStart) {
      return res.status(400).json({ mesaj: 'Data de start nu poate fi schimbată la o dată în trecut' });
    }
    if (registration_deadline < todayStr && registration_deadline !== existingDeadline) {
      return res.status(400).json({ mesaj: 'Termenul limită nu poate fi schimbat la o dată în trecut' });
    }
    if (end_date < start_date) {
      return res.status(400).json({ mesaj: 'Data de final trebuie să fie după data de start' });
    }
    if (registration_deadline > start_date) {
      return res.status(400).json({ mesaj: 'Termenul limită trebuie să fie înainte de data de start' });
    }

    await db.query(
      `UPDATE tournaments SET name=?, description=?, start_date=?, end_date=?, registration_deadline=?,
       max_teams=?, team_size=?, prize_info=?, status=?, field_id=?, format=? WHERE id=?`,
      [name, description || null, start_date, end_date, registration_deadline, max_teams, team_size, prize_info || null, status, fieldId, tournamentFormat, tournamentId]
    );
    res.json({ mesaj: 'Turneu actualizat cu succes!' });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la actualizarea turneului' });
  }
});

router.delete('/tournaments/:id', async (req, res) => {
  const tournamentId = req.params.id;
  try {
    const [check] = await db.query('SELECT id FROM tournaments WHERE id = ?', [tournamentId]);
    if (check.length === 0) return res.status(404).json({ mesaj: 'Turneul nu a fost găsit' });

    await db.query('DELETE FROM tournaments WHERE id = ?', [tournamentId]);
    res.json({ mesaj: 'Turneu șters cu succes!' });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la ștergerea turneului' });
  }
});

router.get('/tournaments/:id/registrations', async (req, res) => {
  const tournamentId = req.params.id;
  try {
    const [registrations] = await db.query(
      `SELECT tr.*, u.name AS user_name, u.email AS user_email
       FROM tournament_registrations tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.tournament_id = ?
       ORDER BY tr.created_at ASC`,
      [tournamentId]
    );

    for (const reg of registrations) {
      const [players] = await db.query(
        'SELECT id, player_name FROM tournament_players WHERE registration_id = ? ORDER BY id ASC',
        [reg.id]
      );
      reg.players = players.map(p => p.player_name);
    }

    res.json(registrations);
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la citirea înscrierilor' });
  }
});

router.put('/tournaments/registrations/:id/status', async (req, res) => {
  const { status } = req.body;
  const regId = req.params.id;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ mesaj: 'Status invalid. Folosiți: approved, rejected, pending' });
  }

  try {
    const [checkRows] = await db.query(
      `SELECT tr.id, tr.user_id, tr.team_name, t.name AS tournament_name, t.id AS tournament_id, t.status AS tournament_status
       FROM tournament_registrations tr
       JOIN tournaments t ON tr.tournament_id = t.id
       WHERE tr.id = ?`,
      [regId]
    );
    if (checkRows.length === 0) return res.status(404).json({ mesaj: 'Înscrierea nu a fost găsită' });

    const reg = checkRows[0];
    if (reg.tournament_status === 'completed' || reg.tournament_status === 'cancelled') {
      return res.status(400).json({
        mesaj: `Nu poți modifica înscrierile unui turneu cu statusul "${reg.tournament_status}"`
      });
    }

    await db.query('UPDATE tournament_registrations SET status = ? WHERE id = ?', [status, regId]);

    res.json({ mesaj: `Înregistrare ${status === 'approved' ? 'aprobată' : status === 'rejected' ? 'respinsă' : 'resetată'}!` });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la actualizarea statusului' });
  }
});

router.put('/tournaments/registrations/:id', async (req, res) => {
  const regId = req.params.id;
  const { team_name, captain_name, captain_phone, notes, players, status } = req.body;

  if (!team_name || !team_name.trim()) {
    return res.status(400).json({ mesaj: 'Numele echipei este obligatoriu' });
  }

  try {
    const [check] = await db.query('SELECT id FROM tournament_registrations WHERE id = ?', [regId]);
    if (check.length === 0) return res.status(404).json({ mesaj: 'Înscrierea nu a fost găsită' });

    await db.query(
      `UPDATE tournament_registrations
       SET team_name=?, captain_name=?, captain_phone=?, notes=?, status=COALESCE(?, status)
       WHERE id=?`,
      [
        team_name.trim(),
        captain_name ? captain_name.trim() : null,
        captain_phone ? captain_phone.trim() : null,
        notes ? notes.trim() : null,
        status || null,
        regId
      ]
    );

    if (players && Array.isArray(players) && players.length > 0) {
      await db.query('DELETE FROM tournament_players WHERE registration_id = ?', [regId]);

      for (const playerName of players) {
        if (playerName && playerName.trim()) {
          await db.query(
            'INSERT INTO tournament_players (registration_id, player_name) VALUES (?, ?)',
            [regId, playerName.trim()]
          );
        }
      }
    }

    res.json({ mesaj: 'Echipa a fost actualizată cu succes!' });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la actualizarea echipei' });
  }
});

router.delete('/tournaments/registrations/:id', async (req, res) => {
  const regId = req.params.id;
  try {
    const [check] = await db.query('SELECT id, team_name FROM tournament_registrations WHERE id = ?', [regId]);
    if (check.length === 0) return res.status(404).json({ mesaj: 'Înscrierea nu a fost găsită' });

    await db.query('DELETE FROM tournament_registrations WHERE id = ?', [regId]);
    res.json({ mesaj: `Echipa "${check[0].team_name}" a fost eliminată din turneu!` });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la eliminarea echipei' });
  }
});


router.put('/tournaments/:id/winners', async (req, res) => {
  const tournamentId = req.params.id;
  const { winner_first, winner_second, winner_third } = req.body;

  try {
    const [check] = await db.query('SELECT id FROM tournaments WHERE id = ?', [tournamentId]);
    if (check.length === 0) return res.status(404).json({ mesaj: 'Turneul nu a fost găsit' });

    const first  = winner_first  && winner_first.trim()  ? winner_first.trim()  : null;
    const second = winner_second && winner_second.trim() ? winner_second.trim() : null;
    const third  = winner_third  && winner_third.trim()  ? winner_third.trim()  : null;

    await db.query(
      'UPDATE tournaments SET winner_first = ?, winner_second = ?, winner_third = ? WHERE id = ?',
      [first, second, third, tournamentId]
    );

    res.json({ mesaj: 'Câștigătorii au fost salvați!' });
  } catch (e) {
    res.status(500).json({ mesaj: 'Eroare la salvarea câștigătorilor' });
  }
});


module.exports = router;
