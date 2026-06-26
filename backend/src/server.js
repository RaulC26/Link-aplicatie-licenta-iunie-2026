require('dotenv').config();

const express = require('express');
const cors = require('cors');

const db = require('./database');

const fieldsRouter = require('./routes/fields');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');
const paymentsRouter = require('./routes/payments');
const tournamentsRouter = require('./routes/tournaments');
const reviewsRouter = require('./routes/reviews');
const { startTournamentScheduler } = require('./services/tournamentScheduler');

async function ensureSchemaUpToDate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);
  } catch (error) {
  }
}

const app = express();

app.use(cors());

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend funcționează!');
});

app.use('/api/fields', fieldsRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/reviews', reviewsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await ensureSchemaUpToDate();
  startTournamentScheduler();
});
