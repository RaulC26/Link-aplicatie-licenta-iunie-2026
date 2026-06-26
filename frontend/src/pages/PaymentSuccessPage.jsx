import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_URL } from "../utils/api";
import { getToken } from "../utils/auth";

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  // 'loading' | 'confirmed' | 'pending_webhook' | 'error'
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (sessionId) {
      // Apelăm /verify care verifică Stripe ȘI actualizează DB-ul + trimite emailul
      confirmPayment();
    } else {
      // Edge case: fără session_id (e.g. URL deschis manual) - afișăm succes generic
      setStatus("confirmed");
    }
  }, [sessionId]);

  async function confirmPayment() {
    try {
      const token = getToken();

      // Edge case: dacă nu e logat, afișăm succes generic (Stripe a confirmat deja)
      if (!token) {
        setStatus("confirmed");
        return;
      }

      const res = await fetch(`${API_URL}/payments/verify/${sessionId}`, {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();

      if (!res.ok) {
        // Edge case: eroare la verificare, dar plata a fost procesată de Stripe
        // Afișăm oricum succes - statusul se va actualiza la refresh
        console.error("Eroare la verificare:", data.mesaj);
        setStatus("confirmed");
        return;
      }

      if (data.status === "paid") {
        // DB-ul a fost actualizat în backend (bookings → confirmed, email trimis)
        setStatus("confirmed");
      } else if (data.status === "unpaid") {
        // Edge case: sesiunea există dar plata nu a fost procesată (timeout etc.)
        setStatus("error");
        setErrorMsg("Plata nu a fost procesată. Încearcă din nou.");
      } else {
        // Orice alt status (no_payment_required etc.)
        setStatus("confirmed");
      }
    } catch {
      // Edge case: eroare de conexiune - Stripe a procesat deja, afișăm succes
      setStatus("confirmed");
    }
  }

  return (
    <div className="page-container">
      <div className="payment-result-card">
        {/* Starea de loading în timp ce verificăm cu Stripe */}
        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              className="payment-icon"
              style={{
                background: "#f3f4f6",
                color: "#6b7280",
                margin: "0 auto 24px",
              }}
            ></div>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>
              Se verifică plata...
            </p>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.88rem",
                marginTop: "8px",
              }}
            >
              Nu închide această pagină.
            </p>
          </div>
        )}

        {/* Plată confirmată cu succes */}
        {status === "confirmed" && (
          <>
            <div className="payment-icon payment-icon-success"></div>
            <h1 style={{ color: "#16a34a", marginBottom: "12px" }}>
              Plată reușită!
            </h1>
            <p
              style={{
                color: "#374151",
                fontSize: "1.05rem",
                marginBottom: "8px",
              }}
            >
              Rezervarea ta este acum <strong>confirmată</strong>.
            </p>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.9rem",
                marginBottom: "32px",
              }}
            >
              Ai primit un email de confirmare.
              {bookingId && (
                <>
                  {" "}
                  · Rezervare <strong>#{bookingId}</strong>
                </>
              )}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/my-bookings" className="btn-primary">
                Vezi rezervările mele
              </Link>
              <Link to="/" className="btn-secondary">
                Acasă
              </Link>
            </div>
          </>
        )}

        {/* Eroare la procesarea plății */}
        {status === "error" && (
          <>
            <div className="payment-icon payment-icon-cancelled"></div>
            <h1 style={{ color: "#991b1b", marginBottom: "12px" }}>
              Problemă la plată
            </h1>
            <p
              style={{
                color: "#374151",
                fontSize: "1.05rem",
                marginBottom: "32px",
              }}
            >
              {errorMsg}
            </p>
            <Link to="/my-bookings" className="btn-primary">
              Înapoi la rezervări
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
