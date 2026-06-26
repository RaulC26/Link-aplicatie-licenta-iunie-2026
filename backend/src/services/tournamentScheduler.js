const cron = require('node-cron');
const db = require('../database');

const BOOKING_EXPIRATION_MINUTES = 10;

async function updateTournamentStatuses() {
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const [startResult] = await db.query(
      `UPDATE tournaments
       SET status = 'active'
       WHERE status = 'upcoming'
         AND start_date <= ?`,
      [todayStr]
    );

    const [endResult] = await db.query(
      `UPDATE tournaments
       SET status = 'completed'
       WHERE status = 'active'
         AND end_date < ?`,
      [todayStr]
    );

  } catch (error) {
  }
}

async function expirePendingBookings() {
  try {
    const [result] = await db.query(
      `UPDATE bookings
       SET status = 'cancelled'
       WHERE status = 'pending'
         AND created_at < (NOW() - INTERVAL ? MINUTE)`,
      [BOOKING_EXPIRATION_MINUTES]
    );

  } catch (error) {
  }
}

async function completePastBookings() {
  try {
    const [result] = await db.query(
      `UPDATE bookings
       SET status = 'completed'
       WHERE status = 'confirmed'
         AND CONCAT(booking_date, ' ', end_time) <= NOW()`
    );

  } catch (error) {
  }
}

function startTournamentScheduler() {
  updateTournamentStatuses();
  expirePendingBookings();
  completePastBookings();

  cron.schedule('1 0 * * *', () => {
    updateTournamentStatuses();
  });

  cron.schedule('* * * * *', () => {
    expirePendingBookings();
  });

  cron.schedule('*/5 * * * *', () => {
    completePastBookings();
  });
}

module.exports = { startTournamentScheduler };
