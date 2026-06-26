import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { API_URL } from "../utils/api";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Introdu adresa de email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email invalid");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.mesaj || "Eroare la trimiterea cererii.");
        return;
      }
      setSuccess(
        data.mesaj ||
          "Dacă există un cont cu acest email, vei primi un link de resetare.",
      );
      setEmail("");
    } catch {
      setError("Eroare conexiune. Verifică serverul.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-grid" />
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: 'url("/logo fotrez transparent.png")',
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
          <div className="auth-logo-text">
            fotrez<span>Rezervări terenuri</span>
          </div>
        </Link>

        <div className="auth-left-content">
          <p className="auth-tagline">
            Ai uitat parola?
            <br />
            <span>Nu-ți face griji.</span>
          </p>
          <p className="auth-tagline-sub">
            Introdu adresa de email asociată contului tău și îți vom trimite un
            link prin care îți poți reseta parola în mai puțin de un minut.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Resetare parolă</h2>
          <p className="auth-form-sub">
            Te ajutăm să recapeți accesul la contul tău.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error" style={{ marginBottom: "16px" }}>
                {error}
              </div>
            )}
            {success && (
              <div className="success" style={{ marginBottom: "16px" }}>
                {success}
              </div>
            )}

            <div className="auth-input-group">
              <label>Adresă email</label>
              <div className="auth-input-wrapper">
                <Mail size={17} strokeWidth={2} className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplu@email.com"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Se trimite..." : "Trimite link de resetare"}
              {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>

            <div className="auth-swap" style={{ marginTop: "20px" }}>
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowLeft size={14} /> Înapoi la autentificare
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
