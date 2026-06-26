const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
 host: 'smtp.gmail.com',
 port: 587,
 secure: false,
 auth: {
 user: (process.env.EMAIL_USER || '').trim(),
 pass: (process.env.EMAIL_PASSWORD || '').trim()
 }
});

async function sendEmail(to, subject, html) {
 try {
 const info = await transporter.sendMail({
 from: `"fotrez" <${(process.env.EMAIL_USER || '').trim()}>`,
 to: to,
 subject: subject,
 html: html
 });
 } catch (error) {
 }
}

function wrapHtml(content) {
 return `
 <!DOCTYPE html>
 <html lang="ro">
 <head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 </head>
 <body style="margin:0;padding:0;background:#f5f5f7;font-family:'Segoe UI',Arial,sans-serif;">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 0;">
 <tr>
 <td align="center">
 <table width="560" cellpadding="0" cellspacing="0"
 style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

 <tr>
 <td style="background:#22c55e;padding:24px 32px;">
 <h1 style="margin:0;color:white;font-size:20px;font-weight:700;">
 fotrez
 </h1>
 </td>
 </tr>

 <tr>
 <td style="padding:32px;">
 ${content}
 </td>
 </tr>

 <tr>
 <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
 <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
 © 2026 fotrez. Toate drepturile rezervate.
 </p>
 </td>
 </tr>
 </table>
 </td>
 </tr>
 </table>
 </body>
 </html>
 `;
}

async function sendWelcomeEmail(user) {
 const html = wrapHtml(`
 <h2 style="margin:0 0 16px;color:#111827;font-size:22px;">
 Bine ai venit, ${user.name}!
 </h2>
 <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
 Contul tău a fost creat cu succes. Acum poți rezerva terenuri de fotbal
 direct din aplicație, rapid și simplu.
 </p>
 <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
 Explorează terenurile disponibile și fă prima ta rezervare!
 </p>
 <a href="http://localhost:5173"
 style="display:inline-block;background:#22c55e;color:white;padding:12px 28px;
 border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
 Explorează terenurile
 </a>
 `);

 await sendEmail(user.email, 'Bine ai venit la fotrez!', html);
}

async function sendBookingCreatedEmail(user, booking, field) {
 const html = wrapHtml(`
 <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">
 Rezervare creată
 </h2>
 <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
 Rezervarea ta a fost înregistrată. Completează plata pentru a o confirma.
 </p>

 <table width="100%" cellpadding="0" cellspacing="0"
 style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;">Teren</td>
 <td style="padding:12px 16px;font-size:15px;color:#111827;font-weight:600;">
 ${field.name}
 </td>
 </tr>
 <tr>
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Locație
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${field.location}
 </td>
 </tr>
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Data
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${new Date(booking.booking_date).toLocaleDateString('ro-RO', {
 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
 })}
 </td>
 </tr>
 <tr>
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Interval orar
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${booking.start_time} – ${booking.end_time}
 </td>
 </tr>
 <tr style="background:#f0fdf4;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Total de plată
 </td>
 <td style="padding:12px 16px;font-size:18px;color:#16a34a;font-weight:800;
 border-top:1px solid #e5e7eb;">
 ${booking.total_price} lei
 </td>
 </tr>
 </table>

 <p style="color:#374151;font-size:14px;margin:0 0 20px;">
 Rezervarea are statusul <strong style="color:#92400e;">În așteptare</strong>
 până când plata este finalizată.
 </p>

 <a href="http://localhost:5173/my-bookings"
 style="display:inline-block;background:#22c55e;color:white;padding:12px 28px;
 border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
 Plătește acum
 </a>
 `);

 await sendEmail(user.email, `Rezervare creată - ${field.name}`, html);
}

async function sendPaymentConfirmedEmail(user, booking, field, amount) {
 const html = wrapHtml(`
 <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">
 Plată confirmată!
 </h2>
 <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
 Rezervarea ta este acum <strong style="color:#16a34a;">confirmată</strong>.
 </p>

 <table width="100%" cellpadding="0" cellspacing="0"
 style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;">Teren</td>
 <td style="padding:12px 16px;font-size:15px;color:#111827;font-weight:600;">
 ${field.name}
 </td>
 </tr>
 <tr>
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Data
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${new Date(booking.booking_date).toLocaleDateString('ro-RO', {
 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
 })}
 </td>
 </tr>
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Interval orar
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${booking.start_time} – ${booking.end_time}
 </td>
 </tr>
 <tr style="background:#f0fdf4;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Sumă achitată
 </td>
 <td style="padding:12px 16px;font-size:18px;color:#16a34a;font-weight:800;
 border-top:1px solid #e5e7eb;">
 ${amount} lei
 </td>
 </tr>
 </table>

 <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;
 padding:16px;margin-bottom:24px;">
 <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">
 Rezervarea ta este confirmată. Te așteptăm pe teren!
 </p>
 </div>

 <a href="http://localhost:5173/my-bookings"
 style="display:inline-block;background:#22c55e;color:white;padding:12px 28px;
 border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
 Vezi rezervările mele
 </a>
 `);

 await sendEmail(user.email, `Plată confirmată - ${field.name}`, html);
}

async function sendBookingCancelledEmail(user, booking, field) {
 const html = wrapHtml(`
 <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">
 Rezervare anulată
 </h2>
 <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
 Rezervarea ta a fost anulată la cererea ta.
 </p>

 <table width="100%" cellpadding="0" cellspacing="0"
 style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;">Teren</td>
 <td style="padding:12px 16px;font-size:15px;color:#111827;font-weight:600;">
 ${field.name}
 </td>
 </tr>
 <tr>
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Data rezervată
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${new Date(booking.booking_date).toLocaleDateString('ro-RO', {
 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
 })}
 </td>
 </tr>
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;
 text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #e5e7eb;">
 Interval orar
 </td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${booking.start_time} – ${booking.end_time}
 </td>
 </tr>
 </table>

 <p style="color:#374151;font-size:14px;margin:0 0 20px;">
 Dacă ai anulat din greșeală sau vrei să faci o nouă rezervare,
 accesează aplicația oricând.
 </p>

 <a href="http://localhost:5173"
 style="display:inline-block;background:#22c55e;color:white;padding:12px 28px;
 border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
 Rezervă din nou
 </a>
 `);

 await sendEmail(user.email, `Rezervare anulată - ${field.name}`, html);
}

async function sendTournamentRegistrationEmail(user, tournament, registration, players) {
 const playersHtml = players.map((p, i) =>
 `<tr ${i % 2 === 0 ? 'style="background:#f9fafb;"' : ''}>
 <td style="padding:8px 16px;font-size:14px;color:#374151;">${i + 1}. ${p.player_name}</td>
 </tr>`
 ).join('')

 const html = wrapHtml(`
 <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">
 Echipa ta a fost înscrisă!
 </h2>
 <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
 Înscrierea este în așteptarea aprobării de către organizatori.
 </p>

 <table width="100%" cellpadding="0" cellspacing="0"
 style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;">Turneu</td>
 <td style="padding:12px 16px;font-size:15px;color:#111827;font-weight:600;">${tournament.name}</td>
 </tr>
 <tr>
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e7eb;">Echipa ta</td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">${registration.team_name}</td>
 </tr>
 <tr style="background:#f9fafb;">
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e7eb;">Data turneului</td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">
 ${new Date(tournament.start_date).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
 </td>
 </tr>
 <tr>
 <td style="padding:12px 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;border-top:1px solid #e5e7eb;">Locație</td>
 <td style="padding:12px 16px;font-size:15px;color:#374151;border-top:1px solid #e5e7eb;">${tournament.location || '—'}</td>
 </tr>
 </table>

 <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 8px;">Jucătorii echipei:</p>
 <table width="100%" cellpadding="0" cellspacing="0"
 style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
 ${playersHtml}
 </table>

 <div style="background:#fef3c7;border:2px solid #fbbf24;border-radius:8px;padding:16px;margin-bottom:24px;">
 <p style="margin:0;color:#92400e;font-size:14px;">
 Înscrierea ta este <strong>în așteptare</strong>. Vei primi un email de confirmare după aprobare.
 </p>
 </div>

 <a href="http://localhost:5173/tournaments"
 style="display:inline-block;background:#22c55e;color:white;padding:12px 28px;
 border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
 Vezi turneele
 </a>
 `);

 await sendEmail(user.email, `Înscriere turneu - ${tournament.name}`, html);
}

async function sendPasswordResetEmail(user, resetUrl) {
 const html = wrapHtml(`
 <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Resetare parolă</h2>
 <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
 Salut ${user.name},
 </p>
 <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
 Am primit o cerere de resetare a parolei pentru contul tău de pe fotrez.
 Apasă butonul de mai jos pentru a-ți seta o parolă nouă:
 </p>
 <p style="margin:0 0 28px;">
 <a href="${resetUrl}"
 style="display:inline-block;background:#22c55e;color:white;padding:14px 32px;
 border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
 Resetează parola
 </a>
 </p>
 <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 14px;">
 <strong>Important:</strong> Acest link este valid timp de <strong>o oră</strong>.
 Dacă nu tu ai cerut resetarea parolei, ignoră acest email — contul tău rămâne în siguranță.
 </p>
 <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:20px 0 0;
 padding-top:16px;border-top:1px solid #e5e7eb;">
 Dacă butonul nu funcționează, copiază acest link în browser:<br/>
 <span style="word-break:break-all;color:#16a34a;">${resetUrl}</span>
 </p>
 `);
 await sendEmail(user.email, 'Resetare parolă - fotrez', html);
}

module.exports = {
 sendWelcomeEmail,
 sendBookingCreatedEmail,
 sendPaymentConfirmedEmail,
 sendBookingCancelledEmail,
 sendTournamentRegistrationEmail,
 sendPasswordResetEmail
};
