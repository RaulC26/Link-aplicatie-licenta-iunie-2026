const express = require('express');
const crypto = require('crypto');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const db = require('../database');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

router.post('/register', async (req, res) => {

  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ mesaj: 'Numele, emailul și parola sunt obligatorii' });
  }

  const trimmedName  = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    return res.status(400).json({ mesaj: 'Numele nu poate fi doar spații goale' });
  }

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return res.status(400).json({ mesaj: 'Numele trebuie să aibă între 2 și 100 de caractere' });
  }
  if (trimmedEmail.length > 150) {
    return res.status(400).json({ mesaj: 'Adresa de email este prea lungă (max 150 caractere)' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ mesaj: 'Format email invalid' });
  }

  if (password.length < 8) {
    return res.status(400).json({ mesaj: 'Parola trebuie să aibă minim 8 caractere' });
  }
  if (password.length > 72) {
    return res.status(400).json({ mesaj: 'Parola este prea lungă (max 72 caractere)' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin o literă mare' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin o cifră' });
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin un simbol special (!@#$ etc.)' });
  }

  const trimmedPhone = phone ? String(phone).trim() : '';
  if (trimmedPhone && !/^07[0-9]{8}$/.test(trimmedPhone)) {
    return res.status(400).json({ mesaj: 'Numărul de telefon trebuie să aibă 10 cifre și să înceapă cu 07 (ex: 0712345678)' });
  }

  try {
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ mesaj: 'Există deja un cont cu acest email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, trimmedEmail, passwordHash, trimmedPhone || null, 'user']
    );

    res.status(201).json({ mesaj: 'Cont creat cu succes!' });

    sendWelcomeEmail({ name, email });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la crearea contului' });
  }
});

router.post('/login', async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mesaj: 'Emailul și parola sunt obligatorii' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ mesaj: 'Email sau parolă greșită' });
    }

    const user = users[0];

    const passwordCorect = await bcrypt.compare(password, user.password_hash);

    if (!passwordCorect) {
      return res.status(401).json({ mesaj: 'Email sau parolă greșită' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mesaj: 'Autentificare reușită!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la autentificare' });
  }
});


const verifyToken = require('../middleware/auth');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit' });
    }

    res.json(users[0]);

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la citirea profilului' });
  }
});


router.put('/profile', verifyToken, async (req, res) => {
  const { name, phone } = req.body;
  const userId = req.user.userId;

  if (!name || !name.trim()) {
    return res.status(400).json({ mesaj: 'Numele nu poate fi gol' });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ mesaj: 'Numele trebuie să aibă minim 2 caractere' });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({ mesaj: 'Numele este prea lung (max 100 caractere)' });
  }

  const trimmedPhone = phone ? String(phone).trim() : '';
  if (trimmedPhone && !/^07[0-9]{8}$/.test(trimmedPhone)) {
    return res.status(400).json({ mesaj: 'Numărul de telefon trebuie să aibă 10 cifre și să înceapă cu 07 (ex: 0712345678)' });
  }

  try {
    await db.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name.trim(), trimmedPhone || null, userId]
    );

    const [users] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = users[0];
    const newToken = jwt.sign(
      { userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ mesaj: 'Profil actualizat cu succes!', user: updatedUser, token: newToken });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la actualizarea profilului' });
  }
});


router.put('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ mesaj: 'Toate câmpurile sunt obligatorii' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ mesaj: 'Noua parolă și confirmarea nu coincid' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ mesaj: 'Noua parolă trebuie să aibă minim 8 caractere' });
  }
  if (newPassword.length > 72) {
    return res.status(400).json({ mesaj: 'Parola este prea lungă (max 72 caractere)' });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin o literă mare' });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin o cifră' });
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin un simbol special (!@#$ etc.)' });
  }

  try {
    const [users] = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ mesaj: 'Utilizatorul nu a fost găsit' });
    }

    const passwordCorrect = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!passwordCorrect) {
      return res.status(400).json({ mesaj: 'Parola curentă este incorectă' });
    }

    const sameAsOld = await bcrypt.compare(newPassword, users[0].password_hash);
    if (sameAsOld) {
      return res.status(400).json({ mesaj: 'Noua parolă trebuie să fie diferită de cea actuală' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ mesaj: 'Parola a fost schimbată cu succes!' });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la schimbarea parolei' });
  }
});


router.delete('/me', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [activeBookings] = await db.query(
      `SELECT id FROM bookings
       WHERE user_id = ? AND status IN ('pending','confirmed') AND booking_date >= CURDATE()`,
      [userId]
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        mesaj: `Nu poți șterge contul. Ai ${activeBookings.length} rezervare(i) activă(e). Anulează-le sau așteaptă să se finalizeze.`
      });
    }

    const [me] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
    if (me.length === 0) return res.status(404).json({ mesaj: 'Cont inexistent' });

    if (me[0].role === 'admin') {
      const [admins] = await db.query("SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin'");
      if (admins[0].cnt <= 1) {
        return res.status(400).json({ mesaj: 'Ești singurul administrator. Nu poți șterge contul.' });
      }
    }

    const [createdTournaments] = await db.query(
      'SELECT id FROM tournaments WHERE created_by = ?',
      [userId]
    );
    if (createdTournaments.length > 0) {
      return res.status(400).json({
        mesaj: `Nu poți șterge contul. Ai creat ${createdTournaments.length} turneu/turnee. Contactează un administrator.`
      });
    }


    const [myRegs] = await db.query(
      'SELECT id FROM tournament_registrations WHERE user_id = ?',
      [userId]
    );
    for (const reg of myRegs) {
      await db.query('DELETE FROM tournament_players WHERE registration_id = ?', [reg.id]);
    }

    await db.query('DELETE FROM tournament_registrations WHERE user_id = ?', [userId]);

    await db.query('DELETE FROM field_reviews WHERE user_id = ?', [userId]);

    const [myBookings] = await db.query('SELECT id FROM bookings WHERE user_id = ?', [userId]);
    for (const b of myBookings) {
      await db.query('DELETE FROM payments WHERE booking_id = ?', [b.id]);
    }

    await db.query('DELETE FROM bookings WHERE user_id = ?', [userId]);

    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ mesaj: 'Contul tău a fost șters definitiv.' });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la ștergerea contului: ' + error.message });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ mesaj: 'Email-ul este obligatoriu' });

  const trimmedEmail = String(email).trim().toLowerCase();

  try {
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.json({
        mesaj: 'Dacă există un cont cu acest email, vei primi un link de resetare.'
      });
    }

    const user = users[0];

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

    const tokenHash = await bcrypt.hash(token, 10);
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(trimmedEmail)}`;
    sendPasswordResetEmail(user, resetUrl);

    res.json({
      mesaj: 'Dacă există un cont cu acest email, vei primi un link de resetare.'
    });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la procesarea cererii' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ mesaj: 'Email, token și parola sunt obligatorii' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ mesaj: 'Parola trebuie să aibă minim 8 caractere' });
  }
  if (newPassword.length > 72) {
    return res.status(400).json({ mesaj: 'Parola este prea lungă (max 72 caractere)' });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin o literă mare' });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin o cifră' });
  }
  if (!/[^A-Za-z0-9]/.test(newPassword)) {
    return res.status(400).json({ mesaj: 'Parola trebuie să conțină cel puțin un simbol special' });
  }

  const trimmedEmail = String(email).trim().toLowerCase();

  try {
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({ mesaj: 'Link invalid sau expirat' });
    }

    const userId = users[0].id;

    const [tokens] = await db.query(
      'SELECT id, token_hash, expires_at FROM password_reset_tokens WHERE user_id = ?',
      [userId]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ mesaj: 'Link invalid sau expirat' });
    }

    let validTokenId = null;
    for (const t of tokens) {
      const expired = new Date(t.expires_at) < new Date();
      if (expired) continue;
      const match = await bcrypt.compare(token, t.token_hash);
      if (match) {
        validTokenId = t.id;
        break;
      }
    }

    if (!validTokenId) {
      return res.status(400).json({ mesaj: 'Link invalid sau expirat' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);

    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);

    res.json({ mesaj: 'Parola a fost resetată cu succes! Te poți autentifica.' });

  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la resetarea parolei' });
  }
});


module.exports = router;
