require("dotenv").config();
const db = require("./src/database");

async function migrate() {
  try {
    const [cols] = await db.query(
      `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tournament_registrations' AND COLUMN_NAME = 'captain_name'
    `,
      [process.env.DB_NAME],
    );

    if (cols.length === 0) {
      await db.query(`
        ALTER TABLE tournament_registrations
        ADD COLUMN captain_name VARCHAR(255) NULL AFTER team_name
      `);
    }

    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

migrate();
