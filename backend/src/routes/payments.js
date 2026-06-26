const express = require("express");
const db = require("../database");
const verifyToken = require("../middleware/auth");
const stripe = require("../services/stripeService");
const { sendPaymentConfirmedEmail } = require("../services/emailService");

const router = express.Router();

router.post("/create-checkout-session", verifyToken, async (req, res) => {
  const { booking_id } = req.body;
  const userId = req.user.userId;

  if (!booking_id) {
    return res.status(400).json({ mesaj: "booking_id este obligatoriu" });
  }

  try {
    const [bookings] = await db.query(
      `SELECT
        bookings.id,
        bookings.user_id,
        bookings.field_id,
        bookings.booking_date,
        bookings.start_time,
        bookings.end_time,
        bookings.total_price,
        bookings.status,
        fields.name AS field_name,
        fields.location AS field_location,
        users.email AS user_email,
        users.name AS user_name
       FROM bookings
       JOIN fields ON bookings.field_id = fields.id
       JOIN users ON bookings.user_id = users.id
       WHERE bookings.id = ?`,
      [booking_id],
    );

    if (bookings.length === 0) {
      return res.status(404).json({ mesaj: "Rezervarea nu a fost găsită" });
    }

    const booking = bookings[0];

    if (booking.user_id !== userId) {
      return res
        .status(403)
        .json({ mesaj: "Nu poți plăti rezervări care nu îți aparțin" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        mesaj: `Rezervarea are statusul "${booking.status}" și nu poate fi plătită`,
      });
    }

    const [existingPayments] = await db.query(
      "SELECT id FROM payments WHERE booking_id = ? AND status = 'success'",
      [booking_id],
    );
    if (existingPayments.length > 0) {
      return res
        .status(400)
        .json({ mesaj: "Această rezervare a fost deja plătită" });
    }

    const bookingDateStr = String(booking.booking_date).substring(0, 10);
    const todayStr = new Date().toISOString().split("T")[0];
    if (bookingDateStr < todayStr) {
      return res
        .status(400)
        .json({ mesaj: "Nu poți plăti o rezervare trecută." });
    }
    if (bookingDateStr === todayStr) {
      const nowHHMM =
        String(new Date().getHours()).padStart(2, "0") +
        ":" +
        String(new Date().getMinutes()).padStart(2, "0");
      const bookingStart = String(booking.start_time).substring(0, 5);
      if (bookingStart <= nowHHMM) {
        return res
          .status(400)
          .json({
            mesaj:
              "Nu poți plăti o rezervare care a început deja sau a trecut.",
          });
      }
    }

    const bookingDateFormatted = new Date(
      booking.booking_date,
    ).toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "ron",
            product_data: {
              name: "Rezervare " + booking.field_name,
              description: `${bookingDateFormatted} · ${booking.start_time}–${booking.end_time} · ${booking.field_location}`,
            },
            unit_amount: Math.round(parseFloat(booking.total_price) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/payment-success?booking_id=${booking_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment-cancelled?booking_id=${booking_id}`,
      metadata: {
        booking_id: booking_id.toString(),
        user_id: userId.toString(),
      },
      customer_email: booking.user_email,
    });

    await db.query(
      "DELETE FROM payments WHERE booking_id = ? AND status = 'pending'",
      [booking_id],
    );

    await db.query(
      `INSERT INTO payments (booking_id, stripe_payment_id, amount, status)
       VALUES (?, ?, ?, 'pending')`,
      [booking_id, session.id, booking.total_price],
    );

    res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mesaj: "Eroare la inițierea plății. Încearcă din nou." });
  }
});

router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    return res.status(400).json({ mesaj: "Semnătură webhook invalidă" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.booking_id;
    const amountPaid = session.amount_total / 100;

    try {
      await db.query(
        "UPDATE payments SET status = 'success', amount = ? WHERE booking_id = ? AND stripe_payment_id = ?",
        [amountPaid, bookingId, session.id],
      );

      await db.query("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [
        bookingId,
      ]);

      const [bookings] = await db.query(
        `SELECT bookings.*, fields.name AS field_name, fields.location AS field_location,
                users.email AS user_email, users.name AS user_name
         FROM bookings
         JOIN fields ON bookings.field_id = fields.id
         JOIN users ON bookings.user_id = users.id
         WHERE bookings.id = ?`,
        [bookingId],
      );

      if (bookings.length > 0) {
        const b = bookings[0];
        sendPaymentConfirmedEmail(
          { email: b.user_email, name: b.user_name },
          {
            booking_date: b.booking_date,
            start_time: b.start_time,
            end_time: b.end_time,
          },
          { name: b.field_name, location: b.field_location },
          amountPaid,
        );
      }
    } catch (error) {
      return res.status(200).json({ received: true });
    }
  }

  res.status(200).json({ received: true });
});

router.get("/verify/:session_id", verifyToken, async (req, res) => {
  const { session_id } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const bookingId = session.metadata ? session.metadata.booking_id : null;
    const amountPaid = session.amount_total / 100;

    if (session.payment_status === "paid" && bookingId) {
      const [bookingCheck] = await db.query(
        "SELECT status FROM bookings WHERE id = ?",
        [bookingId],
      );

      if (bookingCheck.length > 0 && bookingCheck[0].status !== "confirmed") {
        await db.query(
          "UPDATE payments SET status = 'success', amount = ? WHERE booking_id = ? AND stripe_payment_id = ?",
          [amountPaid, bookingId, session_id],
        );

        await db.query(
          "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
          [bookingId],
        );

        const [bookings] = await db.query(
          `SELECT bookings.*, fields.name AS field_name, fields.location AS field_location,
                  users.email AS user_email, users.name AS user_name
           FROM bookings
           JOIN fields ON bookings.field_id = fields.id
           JOIN users ON bookings.user_id = users.id
           WHERE bookings.id = ?`,
          [bookingId],
        );

        if (bookings.length > 0) {
          const b = bookings[0];
          sendPaymentConfirmedEmail(
            { email: b.user_email, name: b.user_name },
            {
              booking_date: b.booking_date,
              start_time: b.start_time,
              end_time: b.end_time,
            },
            { name: b.field_name, location: b.field_location },
            amountPaid,
          );
        }
      }
    }

    res.json({
      status: session.payment_status,
      sessionId: session.id,
      amountTotal: amountPaid,
      bookingId: bookingId,
    });
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la verificarea plății" });
  }
});

router.get("/my", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [payments] = await db.query(
      `SELECT
        payments.id,
        payments.stripe_payment_id,
        payments.amount,
        payments.status,
        payments.created_at,
        bookings.booking_date,
        bookings.start_time,
        bookings.end_time,
        fields.name AS field_name
       FROM payments
       JOIN bookings ON payments.booking_id = bookings.id
       JOIN fields ON bookings.field_id = fields.id
       WHERE bookings.user_id = ?
       ORDER BY payments.created_at DESC`,
      [userId],
    );

    res.json(payments);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la citirea istoricului plăților" });
  }
});

module.exports = router;
