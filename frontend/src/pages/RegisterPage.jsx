import RegisterForm from "../components/RegisterForm";
import { Link } from "react-router-dom";
import { Gift, MapPin, Trophy, Mail } from "lucide-react";

function RegisterPage() {
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
            Alătură-te
            <br />
            <span>comunității noastre.</span>
          </p>
          <p className="auth-tagline-sub">
            Creează un cont gratuit și ai acces imediat la toate terenurile de
            fotbal din platformă.
          </p>

          <ul className="auth-features">
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-green">
                <Gift size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Cont 100% gratuit</strong>
                <p>
                  Înregistrarea e gratuită, plătești doar rezervările efectuate.
                </p>
              </div>
            </li>
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-blue">
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Hartă interactivă</strong>
                <p>Găsește terenuri aproape de tine cu localizare GPS.</p>
              </div>
            </li>
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-indigo">
                <Trophy size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Participare la turnee</strong>
                <p>Înscrie echipa ta și luptă pentru trofeu.</p>
              </div>
            </li>
            <li className="auth-feature-item">
              <div className="auth-feature-icon auth-feature-icon-amber">
                <Mail size={20} strokeWidth={2.5} />
              </div>
              <div className="auth-feature-text">
                <strong>Confirmări pe email</strong>
                <p>Primești email automat după fiecare rezervare.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ===== PANOUL DREAPTA — formular ===== */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Creează cont gratuit</h2>
          <p className="auth-form-sub">
            Durează mai puțin de 1 minut. Nu sunt necesare date bancare.
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
