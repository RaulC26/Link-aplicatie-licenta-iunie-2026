import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X as XIcon } from "lucide-react";
import { API_URL } from "../utils/api";
import {
  getToken,
  getUserFromToken,
  removeToken,
  saveToken,
} from "../utils/auth";
import ErrorMessage from "../components/ErrorMessage";
import { SkeletonProfile } from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";


function validatePassword(pw) {
  return {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

function ProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  
  const [activeTab, setActiveTab] = useState("info");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  
  const pwRules = validatePassword(newPassword);
  const allPwRulesValid = Object.values(pwRules).every(Boolean);

  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoadingUser(true);
    try {
      const res = await fetch(API_URL + "/auth/me", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadingUser(false);
        return;
      }
      setUser(data);
      setEditName(data.name || "");
      setEditPhone(data.phone || "");
    } catch {
      const tokenUser = getUserFromToken();
      if (tokenUser)
        setUser({
          name: tokenUser.name || tokenUser.email,
          email: tokenUser.email,
        });
    } finally {
      setLoadingUser(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!editName.trim()) {
      setSaveError("Numele nu poate fi gol.");
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.mesaj || "Eroare.");
        return;
      }

      setUser(data.user);
      
      
      if (data.token) {
        saveToken(data.token);
        window.dispatchEvent(new Event("user-updated"));
      }
      setSaveSuccess("Profil actualizat cu succes!");
      setEditMode(false);
    } catch {
      setSaveError("Eroare conexiune.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("Completează toate câmpurile.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Noua parolă și confirmarea nu coincid.");
      return;
    }
    if (!allPwRulesValid) {
      setPassError(
        "Noua parolă nu îndeplinește toate cerințele de securitate.",
      );
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPassError(data.mesaj || "Eroare.");
        return;
      }

      setPassSuccess("Parola a fost schimbată cu succes!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPassError("Eroare conexiune.");
    } finally {
      setPassLoading(false);
    }
  }

  
  async function handleConfirmDelete() {
    setShowDeleteModal(false);
    setDeleteLoading(true);
    try {
      const res = await fetch(API_URL + "/auth/me", {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getToken() },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.mesaj || "Nu s-a putut șterge contul.", "error");
        setDeleteLoading(false);
        return;
      }
      showToast("Cont șters definitiv.", "success");
      removeToken();
      
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 800);
    } catch {
      showToast("Eroare conexiune.", "error");
      setDeleteLoading(false);
    }
  }

  function getInitials(name) {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  }

  function formatDate(raw) {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loadingUser) return <SkeletonProfile />;

  return (
    <div className="page-container">
      {showDeleteModal && (
        <ConfirmModal
          title="Ești sigur că vrei să ștergi contul?"
          message=""
          confirmText="Da, șterge"
          danger={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <h1>Profilul meu</h1>

      
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-hero-avatar">{getInitials(user?.name)}</div>
          <div className="profile-hero-info">
            <h2 className="profile-name">{user?.name || "—"}</h2>
            <div className="profile-hero-meta">
              <span className="profile-hero-meta-item">✉ {user?.email}</span>
              {user?.phone && (
                <span className="profile-hero-meta-item"> {user.phone}</span>
              )}
            </div>
            <p className="profile-joined">
              Membru din {formatDate(user?.created_at)}
            </p>
          </div>
          {user?.role === "admin" && (
            <span className="profile-hero-badge">Administrator</span>
          )}
        </div>
      </div>

      
      <div className="profile-tabs">
        <button
          className={
            activeTab === "info" ? "profile-tab active" : "profile-tab"
          }
          onClick={() => {
            setActiveTab("info");
            setEditMode(false);
            setSaveSuccess("");
            setSaveError("");
          }}
        >
          {" "}
          Date personale
        </button>
        <button
          className={
            activeTab === "password" ? "profile-tab active" : "profile-tab"
          }
          onClick={() => {
            setActiveTab("password");
            setPassSuccess("");
            setPassError("");
          }}
        >
          {" "}
          Schimbă parola
        </button>
      </div>

      
      {activeTab === "info" && (
        <div className="profile-card">
          {!editMode ? (
            <>
              <div className="profile-card-header">
                <h3>Informații personale</h3>
                <button
                  className="btn-edit-profile"
                  onClick={() => {
                    setEditMode(true);
                    setSaveSuccess("");
                    setSaveError("");
                  }}
                >
                  Editează profilul
                </button>
              </div>

              {saveSuccess && <div className="success">{saveSuccess}</div>}

              <div className="profile-info-grid">
                <div className="profile-info-row">
                  <span className="profile-info-label">Nume complet</span>
                  <span className="profile-info-value">
                    {user?.name || "—"}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">
                    {user?.email || "—"}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Telefon</span>
                  <span className="profile-info-value">
                    {user?.phone || "—"}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Rol</span>
                  <span className="profile-info-value">
                    <span
                      className={
                        user?.role === "admin"
                          ? "role-badge-admin"
                          : "role-badge-user"
                      }
                    >
                      {user?.role || "user"}
                    </span>
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Cont creat</span>
                  <span className="profile-info-value">
                    {formatDate(user?.created_at)}
                  </span>
                </div>
              </div>

              
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--bg)",
                  textAlign: "right",
                }}
              >
                <button
                  className="btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Se șterge..." : "Șterge cont"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-card-header">
                <h3>Editează profilul</h3>
              </div>

              {saveError && <ErrorMessage message={saveError} />}

              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <label>Nume complet *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Numele tău complet"
                />

                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    background: "#f9fafb",
                    color: "#9ca3af",
                    cursor: "not-allowed",
                  }}
                  title="Emailul nu poate fi schimbat"
                />
                <small
                  style={{
                    color: "#9ca3af",
                    marginTop: "-12px",
                    marginBottom: "12px",
                    display: "block",
                  }}
                >
                  Emailul nu poate fi modificat.
                </small>

                <label>Telefon</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="ex: 0740 000 000"
                />

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saveLoading}
                  >
                    {saveLoading ? "Se salvează..." : "Salvează modificările"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setEditName(user?.name || "");
                      setEditPhone(user?.phone || "");
                      setSaveError("");
                    }}
                  >
                    Anulează
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      
      {activeTab === "password" && (
        <div className="profile-card">
          <div className="profile-card-header">
            <h3>Schimbă parola</h3>
          </div>

          {passError && <ErrorMessage message={passError} />}
          {passSuccess && <div className="success"> {passSuccess}</div>}

          <form onSubmit={handleChangePassword} className="profile-edit-form">
            <label>Parola curentă *</label>
            <div className="pw-input-wrapper">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Parola ta actuală"
                autoComplete="current-password"
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowCurrent((s) => !s)}
                aria-label={showCurrent ? "Ascunde parola" : "Afișează parola"}
              >
                {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label>Parola nouă *</label>
            <div className="pw-input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minim 8 caractere, 1 mare, 1 cifră, 1 simbol"
                autoComplete="new-password"
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowNew((s) => !s)}
                aria-label={showNew ? "Ascunde parola" : "Afișează parola"}
              >
                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            
            {newPassword && (
              <ul className="password-rules" style={{ marginBottom: "12px" }}>
                <li className={pwRules.length ? "rule-ok" : "rule-bad"}>
                  {pwRules.length ? <Check size={13} /> : <XIcon size={13} />}{" "}
                  Minim 8 caractere
                </li>
                <li className={pwRules.uppercase ? "rule-ok" : "rule-bad"}>
                  {pwRules.uppercase ? (
                    <Check size={13} />
                  ) : (
                    <XIcon size={13} />
                  )}{" "}
                  Cel puțin o literă mare
                </li>
                <li className={pwRules.digit ? "rule-ok" : "rule-bad"}>
                  {pwRules.digit ? <Check size={13} /> : <XIcon size={13} />}{" "}
                  Cel puțin o cifră
                </li>
                <li className={pwRules.special ? "rule-ok" : "rule-bad"}>
                  {pwRules.special ? <Check size={13} /> : <XIcon size={13} />}{" "}
                  Cel puțin un simbol
                </li>
              </ul>
            )}

            <label>Confirmă parola nouă *</label>
            <div className="pw-input-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetă parola nouă"
                autoComplete="new-password"
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? "Ascunde parola" : "Afișează parola"}
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {newPassword && confirmPassword && (
              <p
                style={{
                  fontSize: "0.85rem",
                  marginTop: "-12px",
                  marginBottom: "12px",
                  color:
                    newPassword === confirmPassword ? "#16a34a" : "#dc2626",
                }}
              >
                {newPassword === confirmPassword
                  ? "Parolele coincid"
                  : "Parolele nu coincid"}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={passLoading}
              style={{ marginTop: "8px" }}
            >
              {passLoading ? "Se schimbă..." : "Schimbă parola"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
