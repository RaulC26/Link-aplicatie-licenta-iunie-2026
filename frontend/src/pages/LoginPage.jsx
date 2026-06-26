import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";
import { CalendarCheck, Trophy, CreditCard } from "lucide-react";

function LoginPage() {
  return (
    <div className="auth-page">
      {/* ===== PANOUL STÂNGA — branding ===== */}
      <div className="auth-left">
        <div className="auth-left-grid" />

        {/* Logo */}
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
            fotrez
            <span>Rezervări terenuri</span>
          </div>
        </Link>

        {/* Conținut central */}
        <div className="auth-left-content">
          <p className="auth-tagline">
            Rezervă rapid și ușor
            <br />
            <span>terenul tău preferat.</span>
          </p>
          <p className="auth-tagline-sub">
            Platforma pasionaților de fotbal pe sintetic.
          </p>

          <ul className="auth-features">
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-green">
                <CalendarCheck size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Rezervări în timp real</strong>
                <p>
                  Alege ziua, ora și confirmă instant fără apeluri telefonice.
                </p>
              </div>
            </li>
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-indigo">
                <Trophy size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Turnee organizate</strong>
                <p>Înscrie-ți echipa în turneele FOTREZ.</p>
              </div>
            </li>
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-amber">
                <CreditCard size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Plată securizată</strong>
                <p>Plătești rapid cu cardul cu ajutorul Stripe</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ===== PANOUL DREAPTA — formular ===== */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Bine ai revenit</h2>
          <p className="auth-form-sub">
            Intră în cont pentru a rezerva terenuri și a te înscrie la turnee.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
