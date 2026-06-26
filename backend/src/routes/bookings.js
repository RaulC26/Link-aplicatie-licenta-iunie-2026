const express = require('express');
const db = require('../database');
const verifyToken = require('../middleware/auth');
const { sendBookingCreatedEmail, sendBookingCancelledEmail } = require('../services/emailService');

const router = express.Router();


router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [bookings] = await db.query(
      `SELECT
        bookings.id,
        bookings.booking_date,
        bookings.start_time,
        bookings.end_time,
        bookings.status,
        bookings.total_price,
        bookings.created_at,
        fields.name     AS field_name,
        fields.location AS field_location
       FROM bookings
       JOIN fields ON bookings.field_id = fields.id
       WHERE bookings.user_id = ?
       ORDER BY bookings.booking_date DESC, bookings.start_time DESC`,
      [userId]
    );

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la citirea rezervărilor' });
  }
});


router.post('/', verifyToken, async (req, res) => {
  const { field_id, booking_date, start_time } = req.body;

  const userId = req.user.userId;

  if (!field_id || !booking_date || !start_time) {
    return res.status(400).json({ mesaj: 'field_id, booking_date și start_time sunt obligatorii' });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(start_time)) {
    return res.status(400).json({ mesaj: 'start_time trebuie să fie în formatul HH:MM (ex: 10:00)' });
  }

  const [startH, startM] = start_time.split(':').map(Number);
  if (startM !== 0) {
    return res.status(400).json({ mesaj: 'Rezervările se fac pe ore fixe (ex: 10:00, 11:00, etc.)' });
  }

  if (startH < 8 || startH > 21) {
    return res.status(400).json({ mesaj: 'Rezervările se pot face între 08:00 și 21:00' });
  }

  const endH = startH + 1;
  const end_time = String(endH).padStart(2, '0') + ':00';

  try {
    const [fields] = await db.query(
      'SELECT id, price_per_hour FROM fields WHERE id = ?',
      [field_id]
    );
    if (fields.length === 0) {
      return res.status(404).json({ mesaj: 'Terenul nu a fost găsit' });
    }

    const pricePerHour = parseFloat(fields[0].price_per_hour);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking_date);
    if (bookingDate < today) {
      return res.status(400).json({ mesaj: 'Nu poți face rezervări pentru date trecute' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (booking_date === todayStr) {
      const nowHHMM = String(new Date().getHours()).padStart(2, '0') + ':00';
      if (start_time <= nowHHMM) {
        return res.status(400).json({ mesaj: 'Nu poți rezerva un slot orar care a trecut deja. Alege o oră viitoare.' });
      }
    }

    const [conflict] = await db.query(
      `SELECT id FROM bookings
       WHERE field_id = ?
         AND booking_date = ?
         AND status IN ('pending', 'confirmed')
         AND start_time < ? AND end_time > ?`,
      [field_id, booking_date, end_time, start_time]
    );

    if (conflict.length > 0) {
      return res.status(400).json({ mesaj: 'Slotul este deja rezervat. Alege alt interval orar.' });
    }

    const totalPrice = pricePerHour;

    const [result] = await db.query(
      `INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, field_id, booking_date, start_time, end_time, totalPrice]
    );

    res.status(201).json({
      mesaj: 'Rezervare creată cu succes!',
      bookingId: result.insertId,
      start_time: start_time,
      end_time: end_time,
      totalPrice: totalPrice
    });

    try {
      const [userRows] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
      const [fieldRows] = await db.query('SELECT id, name, location FROM fields WHERE id = ?', [field_id]);
      if (userRows.length > 0 && fieldRows.length > 0) {
        sendBookingCreatedEmail(
          userRows[0],
          { booking_date, start_time, end_time, total_price: totalPrice },
          fieldRows[0]
        );
      }
    } catch (emailErr) {
    }

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la crearea rezervării' });
  }
});


router.delete('/:id', verifyToken, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.userId;

  try {
    const [bookings] = await db.query(
      'SELECT id, status, user_id, booking_date, field_id, start_time, end_time FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ mesaj: 'Rezervarea nu a fost găsită' });
    }

    const booking = bookings[0];

    if (booking.user_id !== userId) {
      return res.status(403).json({ mesaj: 'Nu poți anula rezervări care nu îți aparțin' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ mesaj: 'Această rezervare nu poate fi anulată' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking.booking_date);
    if (bookingDate < today) {
      return res.status(400).json({ mesaj: 'Nu poți anula rezervări trecute' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const bookingDateStr = String(booking.booking_date).substring(0, 10);
    if (bookingDateStr === todayStr) {
      const nowHHMM = String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
      const bookingStart = String(booking.start_time).substring(0, 5);
      if (bookingStart <= nowHHMM) {
        return res.status(400).json({ mesaj: 'Nu poți anula o rezervare care a început deja sau a trecut.' });
      }
    }

    await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [bookingId]
    );

    res.json({ mesaj: 'Rezervare anulată cu succes!' });

    try {
      const [userRows] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
      const [fieldRows] = await db.query('SELECT name, location FROM fields WHERE id = ?', [booking.field_id]);
      if (userRows.length > 0 && fieldRows.length > 0) {
        sendBookingCancelledEmail(userRows[0], booking, fieldRows[0]);
      }
    } catch (emailErr) {
    }

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la anularea rezervării' });
  }
});


router.post('/multi', verifyToken, async (req, res) => {
  const { field_id, booking_date, start_times } = req.body;
  const userId = req.user.userId;

  if (!field_id || !booking_date || !start_times || !Array.isArray(start_times) || start_times.length === 0) {
    return res.status(400).json({ mesaj: 'field_id, booking_date și start_times (array) sunt obligatorii' });
  }

  if (start_times.length > 4) {
    return res.status(400).json({ mesaj: 'Poți rezerva maxim 4 sloturi consecutive (4 ore)' });
  }

  const sortedTimes = [...start_times].sort();
  for (let i = 0; i < sortedTimes.length - 1; i++) {
    const currentH = parseInt(sortedTimes[i].split(':')[0]);
    const nextH = parseInt(sortedTimes[i + 1].split(':')[0]);
    if (nextH - currentH !== 1) {
      return res.status(400).json({ mesaj: 'Sloturile trebuie să fie consecutive (ore consecutive)' });
    }
  }

  try {
    const [fields] = await db.query('SELECT id, price_per_hour, name, location FROM fields WHERE id = ?', [field_id]);
    if (fields.length === 0) return res.status(404).json({ mesaj: 'Terenul nu a fost găsit' });

    const field = fields[0];
    const pricePerHour = parseFloat(field.price_per_hour);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(booking_date) < today) {
      return res.status(400).json({ mesaj: 'Nu poți rezerva date trecute' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (booking_date === todayStr) {
      const nowHHMM = String(new Date().getHours()).padStart(2, '0') + ':00';
      if (sortedTimes[0] <= nowHHMM) {
        return res.status(400).json({ mesaj: 'Nu poți rezerva sloturi care au trecut deja. Alege ore viitoare.' });
      }
    }

    const firstSlot = sortedTimes[0];
    const lastH = parseInt(sortedTimes[sortedTimes.length - 1].split(':')[0]) + 1;
    const lastSlot = String(lastH).padStart(2, '0') + ':00';
    const totalPrice = pricePerHour * sortedTimes.length;

    const [conflict] = await db.query(
      `SELECT id FROM bookings
       WHERE field_id = ? AND booking_date = ? AND status IN ('pending','confirmed')
         AND start_time < ? AND end_time > ?`,
      [field_id, booking_date, lastSlot, firstSlot]
    );
    if (conflict.length > 0) {
      return res.status(400).json({ mesaj: `Unul sau mai multe sloturi din intervalul ${firstSlot}–${lastSlot} sunt deja rezervate. Alege alte ore.` });
    }

    const [result] = await db.query(
      `INSERT INTO bookings (user_id, field_id, booking_date, start_time, end_time, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, field_id, booking_date, firstSlot, lastSlot, totalPrice]
    );
    const bookingId = result.insertId;

    res.status(201).json({
      mesaj: `${sortedTimes.length} ore rezervate cu succes! (${firstSlot}–${lastSlot})`,
      bookingIds: [bookingId],
      bookingId,
      start_time: firstSlot,
      end_time: lastSlot,
      totalPrice,
      slots: sortedTimes.length
    });

    try {
      const [userRows] = await db.query('SELECT name, email FROM users WHERE id = ?', [userId]);
      if (userRows.length > 0) {
        sendBookingCreatedEmail(
          userRows[0],
          { booking_date, start_time: firstSlot, end_time: lastSlot, total_price: totalPrice },
          field
        );
      }
    } catch (emailErr) {
    }

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la crearea rezervărilor' });
  }
});


module.exports = router;
