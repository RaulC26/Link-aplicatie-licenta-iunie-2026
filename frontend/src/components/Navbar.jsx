import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, isAdmin, removeToken, getFirstName } from "../utils/auth";
import {
  Home,
  Trophy,
  Settings,
  User,
  CalendarDays,
  LogOut,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const logged = isLoggedIn();
  const [firstName, setFirstName] = useState(logged ? getFirstName() : "");

  useEffect(() => {
    function refreshFirstName() {
      setFirstName(isLoggedIn() ? getFirstName() : "");
    }
    window.addEventListener("user-updated", refreshFirstName);
    window.addEventListener("storage", refreshFirstName);
    return () => {
      window.removeEventListener("user-updated", refreshFirstName);
      window.removeEventListener("storage", refreshFirstName);
    };
  }, []);

  function handleLogout() {
    removeToken();
    navigate("/");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div
          className="navbar-logo-img"
          style={{ backgroundImage: 'url("/logo fotrez transparent.png")' }}
          aria-label="fotrez"
        />
        <span className="navbar-logo-text">fotrez</span>
      </Link>

      <div className="navbar-sep" />

      <div className="navbar-links">
        <Link to="/">
          <Home size={15} strokeWidth={2.5} />
          Acasă
        </Link>
        <Link to="/tournaments">
          <Trophy size={15} strokeWidth={2.5} />
          Turnee
        </Link>

        {logged ? (
          <>
            {isAdmin() && (
              <Link to="/admin" className="navbar-admin-link">
                <Settings size={15} strokeWidth={2.5} />
                Admin
              </Link>
            )}
            <Link to="/profile">
              <User size={15} strokeWidth={2.5} />
              Profil
            </Link>
            <Link to="/my-bookings">
              <CalendarDays size={15} strokeWidth={2.5} />
              Rezervările mele
            </Link>
            {firstName && (
              <span className="navbar-greeting">Salut, {firstName}!</span>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={15} strokeWidth={2.5} />
              Logout
            </button>
          </>
        ) : (
          <div className="navbar-auth-group">
            <Link to="/login" className="navbar-btn-login">
              Intră în cont
            </Link>
            <Link to="/register" className="navbar-btn-register">
              Înregistrare →
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
