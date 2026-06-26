const express = require("express");
const db = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        f.*,
        ROUND(AVG(fr.rating), 1) AS avg_rating,
        COUNT(fr.id)             AS reviews_count
       FROM fields f
       LEFT JOIN field_reviews fr ON fr.field_id = f.id
       GROUP BY f.id
       ORDER BY f.id ASC`,
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ mesaj: "Eroare la citirea terenurilor din baza de date" });
  }
});

router.get("/:id", async (req, res) => {
  const fieldId = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM fields WHERE id = ?", [
      fieldId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ mesaj: "Terenul nu a fost găsit" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la citirea terenului" });
  }
});

router.get("/:id/slots", async (req, res) => {
  const fieldId = req.params.id;
  const { date } = req.query;

  if (!date) {
    return res
      .status(400)
      .json({ mesaj: "Parametrul ?date=YYYY-MM-DD este obligatoriu" });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res
      .status(400)
      .json({ mesaj: "Formatul datei trebuie să fie YYYY-MM-DD" });
  }

  try {
    const [fields] = await db.query("SELECT id FROM fields WHERE id = ?", [
      fieldId,
    ]);
    if (fields.length === 0) {
      return res.status(404).json({ mesaj: "Terenul nu a fost găsit" });
    }

    const [bookings] = await db.query(
      `SELECT start_time, end_time FROM bookings
       WHERE field_id = ? AND booking_date = ? AND status IN ('pending', 'confirmed')`,
      [fieldId, date],
    );

    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = date === todayStr;
    const now = new Date();
    const currentHHMM =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");

    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      const startTime = String(hour).padStart(2, "0") + ":00";
      const endTime = String(hour + 1).padStart(2, "0") + ":00";

      const isOccupied = bookings.some((b) => {
        const bStart = String(b.start_time).substring(0, 5);
        const bEnd = String(b.end_time).substring(0, 5);
        return startTime < bEnd && endTime > bStart;
      });

      const isPastSlot = isToday && startTime <= currentHHMM;

      slots.push({
        start_time: startTime,
        end_time: endTime,
        available: !isOccupied && !isPastSlot,
      });
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la citirea sloturilor disponibile" });
  }
});

module.exports = router;
