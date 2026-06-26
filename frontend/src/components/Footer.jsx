import { Link } from 'react-router-dom'
import { isLoggedIn } from '../utils/auth'

function Footer() {
  const currentYear = new Date().getFullYear()
  const logged = isLoggedIn()

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Coloana branding */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div
              className="footer-logo-img"
              style={{ backgroundImage: 'url("/logo fotrez transparent.png")' }}
              aria-label="fotrez"
            />
            fotrez
          </Link>
          <p>
            Platforma modernă pentru rezervarea terenurilor de fotbal.
            Rapid, simplu, fără telefon. Disponibil 24/7.
          </p>
        </div>

        {/* Coloana navigare */}
        <div className="footer-col">
          <h4>Navigare</h4>
          <ul>
            <li><Link to="/">Acasă</Link></li>
            <li><Link to="/tournaments">Turnee</Link></li>
            <li><Link to="/my-bookings">Rezervările mele</Link></li>
            <li><Link to="/profile">Profilul meu</Link></li>
          </ul>
        </div>

        {/* Coloana funcționalități */}
        <div className="footer-col">
          <h4>Funcționalități</h4>
          <ul>
            <li><span className="footer-info">Rezervare online</span></li>
            <li><span className="footer-info">Hartă terenuri</span></li>
            <li><span className="footer-info">Plată securizată</span></li>
            <li><span className="footer-info">Confirmare email</span></li>
          </ul>
        </div>

        {/* Coloana cont */}
        <div className="footer-col">
          <h4>Cont</h4>
          <ul>
            {!logged && <li><Link to="/login">Autentificare</Link></li>}
            {!logged && <li><Link to="/register">Înregistrare</Link></li>}
            {logged && <li><Link to="/profile">Setări profil</Link></li>}
            {logged && <li><Link to="/my-bookings">Rezervările mele</Link></li>}
          </ul>
        </div>
      </div>

      {/* Bara de jos */}
      <div className="footer-bottom">
        <span>© {currentYear} fotrez. Toate drepturile rezervate.</span>
      </div>
    </footer>
  )
}

export default Footer
