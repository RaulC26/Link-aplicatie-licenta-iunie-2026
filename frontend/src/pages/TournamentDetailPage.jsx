import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";
import { getToken, isLoggedIn } from "../utils/auth";
import ErrorMessage from "../components/ErrorMessage";
import { SkeletonTournamentDetail } from "../components/Skeleton";
import FieldMap from "../components/FieldMap";

function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  const [players, setPlayers] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  useEffect(() => {
    loadTournament();
  }, [id]);

  async function loadTournament() {
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/tournaments/" + id);
      const data = await res.json();
      if (!res.ok) {
        setError(data.mesaj || "Turneu negăsit");
        return;
      }
      setTournament(data);
      
      setPlayers(Array(data.team_size).fill(""));
    } catch {
      setError("Eroare conexiune.");
    } finally {
      setLoading(false);
    }
  }

  function handlePlayerChange(index, value) {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    if (!teamName.trim()) {
      setRegError("Numele echipei este obligatoriu.");
      return;
    }

    
    const emptyPlayers = players.filter((p) => !p.trim());
    if (emptyPlayers.length > 0) {
      setRegError(
        `Completează numele tuturor celor ${tournament.team_size} jucători.`,
      );
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch(`${API_URL}/tournaments/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          team_name: teamName,
          captain_name: captainName,
          captain_phone: captainPhone,
          notes,
          players,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRegError(data.mesaj || "Eroare la înscriere.");
        return;
      }

      setRegSuccess(data.mesaj || "Echipa a fost înscrisă cu succes!");
      setTeamName("");
      setCaptainName("");
      setCaptainPhone("");
      setNotes("");
      setPlayers(Array(tournament.team_size).fill(""));
      
      loadTournament();
    } catch {
      setRegError("Eroare conexiune.");
    } finally {
      setRegLoading(false);
    }
  }

  function formatDate(raw) {
    if (!raw) return "—";
    return new Date(
      String(raw).substring(0, 10) + "T12:00:00",
    ).toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) return <SkeletonTournamentDetail />;

  if (error)
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    );

  const spotsLeft =
    tournament.max_teams - (tournament.registrations_count || 0);
  const registrationOpen = tournament.status === "upcoming" && spotsLeft > 0;

  
  const hasFieldImage = !!tournament.field_image_url;
  
  const hasMap = !!(tournament.field_latitude && tournament.field_longitude);

  return (
    <div className="page-container">
      
      {hasFieldImage && (
        <div className="field-hero" style={{ marginBottom: "28px" }}>
          <img
            src={tournament.field_image_url}
            alt={tournament.field_name || tournament.name}
            className="field-hero-img"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          
          <div className="field-hero-overlay">
            
            <div className="field-hero-breadcrumb">
              <Link to="/">Acasă</Link> › <Link to="/tournaments">Turnee</Link>{" "}
              › <span>{tournament.name}</span>
            </div>
            
            <h1 className="field-hero-title">{tournament.name}</h1>
            
            {tournament.field_location_text && (
              <p className="field-hero-location">
                {" "}
                {tournament.field_location_text}
              </p>
            )}
            {tournament.description && (
              <p className="field-hero-desc">{tournament.description}</p>
            )}
            
            <span
              className={`tournament-status tournament-status-${tournament.status}`}
              style={{ marginTop: "8px", display: "inline-block" }}
            >
              {tournament.status === "upcoming"
                ? "Înregistrări deschise"
                : tournament.status === "active"
                  ? "În desfășurare"
                  : tournament.status === "completed"
                    ? "Finalizat"
                    : "Anulat"}
            </span>
          </div>
        </div>
      )}

      
      {!hasFieldImage && (
        <div className="breadcrumb">
          <Link to="/">Acasă</Link> › <Link to="/tournaments">Turnee</Link> ›{" "}
          <span>{tournament.name}</span>
        </div>
      )}

      
      {!hasFieldImage && (
        <div className="tournament-detail-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <h1 style={{ margin: 0 }}>{tournament.name}</h1>
            <span
              className={`tournament-status tournament-status-${tournament.status}`}
            >
              {tournament.status === "upcoming"
                ? "Înregistrări deschise"
                : tournament.status === "active"
                  ? "În desfășurare"
                  : tournament.status === "completed"
                    ? "Finalizat"
                    : "Anulat"}
            </span>
          </div>
          {tournament.description && (
            <p
              style={{ color: "#6b7280", fontSize: "1rem", margin: "0 0 4px" }}
            >
              {tournament.description}
            </p>
          )}
        </div>
      )}

      
      <div className="tournament-detail-body">
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="tournament-info-card">
            <h3>Detalii turneu</h3>
            <div className="tournament-info-rows">
              <div className="tournament-info-row">
                <span>Data start</span>
                <strong>{formatDate(tournament.start_date)}</strong>
              </div>
              <div className="tournament-info-row">
                <span>Data final</span>
                <strong>{formatDate(tournament.end_date)}</strong>
              </div>
              <div className="tournament-info-row">
                <span>⏰ Termen înscriere</span>
                <strong style={{ color: "#ef4444" }}>
                  {formatDate(tournament.registration_deadline)}
                </strong>
              </div>

              
              {tournament.field_name && (
                <div className="tournament-info-row">
                  <span>Teren</span>
                  <strong>{tournament.field_name}</strong>
                </div>
              )}
              {tournament.field_location_text && (
                <div className="tournament-info-row">
                  <span>Locație</span>
                  <strong>{tournament.field_location_text}</strong>
                </div>
              )}
              
              {!tournament.field_name && tournament.location && (
                <div className="tournament-info-row">
                  <span>Locație</span>
                  <strong>{tournament.location}</strong>
                </div>
              )}

              <div className="tournament-info-row">
                <span>👥 Jucători / echipă</span>
                <strong>{tournament.team_size}</strong>
              </div>
              <div className="tournament-info-row">
                <span>Echipe înscrise</span>
                <strong>
                  {tournament.registrations_count || 0} / {tournament.max_teams}
                </strong>
              </div>
              {tournament.prize_info && (
                <div className="tournament-info-row">
                  <span>Premii</span>
                  <strong>{tournament.prize_info}</strong>
                </div>
              )}
              <div className="tournament-info-row">
                <span>Locuri disponibile</span>
                <strong
                  style={{ color: spotsLeft > 0 ? "#16a34a" : "#ef4444" }}
                >
                  {spotsLeft > 0 ? `${spotsLeft} locuri` : "Complet"}
                </strong>
              </div>
            </div>
          </div>

          
          {(tournament.enrolled_teams || []).length > 0 && (
            <div className="tournament-info-card">
              <h3>
                Echipe înscrise ({(tournament.enrolled_teams || []).length})
              </h3>
              <ol className="enrolled-teams-list">
                {(tournament.enrolled_teams || []).map((name, i) => (
                  <li key={i} className="enrolled-team-item">
                    <span className="enrolled-team-number">{i + 1}</span>
                    <span className="enrolled-team-name">{name}</span>
                  </li>
                ))}
              </ol>
              {spotsLeft > 0 && tournament.status === "upcoming" && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    marginTop: "12px",
                    borderTop: "1px solid #f3f4f6",
                    paddingTop: "12px",
                  }}
                >
                  Mai sunt{" "}
                  <strong style={{ color: "#16a34a" }}>
                    {spotsLeft} locuri
                  </strong>
                  disponibile.
                </p>
              )}
            </div>
          )}

          
          {hasMap && (
            <div className="map-section" style={{ marginTop: 0 }}>
              <h2
                style={{
                  marginBottom: "16px",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                }}
              >
                Localizare pe hartă
              </h2>
              <FieldMap
                lat={parseFloat(tournament.field_latitude)}
                lng={parseFloat(tournament.field_longitude)}
                name={tournament.field_name || tournament.name}
              />
              {tournament.field_location_text && (
                <p className="map-address-hint">
                  📌 {tournament.field_location_text}
                </p>
              )}
            </div>
          )}
        </div>

        
        <div className="tournament-register-card">
          {!isLoggedIn() ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ fontSize: "2rem", marginBottom: "12px" }}></p>
              <p style={{ marginBottom: "16px", color: "#374151" }}>
                Trebuie să fii autentificat pentru a înscrie o echipă.
              </p>
              <Link to="/login" className="btn-primary">
                Loghează-te
              </Link>
            </div>
          ) : !registrationOpen ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                {tournament.status === "completed"
                  ? ""
                  : spotsLeft <= 0
                    ? ""
                    : ""}
              </p>
              <p
                style={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                }}
              >
                {tournament.status === "completed"
                  ? "Turneul s-a terminat."
                  : tournament.status === "cancelled"
                    ? "Turneul a fost anulat."
                    : tournament.status === "active"
                      ? "Turneul este în desfășurare."
                      : spotsLeft <= 0
                        ? "Toate locurile sunt ocupate."
                        : "Înregistrările sunt închise."}
              </p>
            </div>
          ) : (
            <>
              <h3>✍️ Înscrie echipa</h3>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.88rem",
                  marginBottom: "20px",
                }}
              >
                Completează datele echipei tale. Vei fi căpitanul echipei dacă
                nu specifici altul.
              </p>

              {regError && <ErrorMessage message={regError} />}
              {regSuccess && (
                <div className="success">
                  {regSuccess} —{" "}
                  <Link
                    to="/my-bookings"
                    style={{ color: "#065f46", fontWeight: 600 }}
                  >
                    Vezi turneele mele
                  </Link>
                </div>
              )}

              {!regSuccess && (
                <form onSubmit={handleRegister} className="profile-edit-form">
                  <label>Numele echipei *</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="ex: FC Vulturii"
                  />

                  <label>Numele căpitanului *</label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="ex: Ion Popescu"
                  />

                  <label>Telefon căpitan (opțional)</label>
                  <input
                    type="tel"
                    value={captainPhone}
                    onChange={(e) =>
                      setCaptainPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="ex: 0740000000"
                    maxLength={10}
                    inputMode="numeric"
                  />

                  <label style={{ marginBottom: "10px" }}>
                    Jucătorii echipei * ({tournament.team_size} jucători)
                  </label>

                  {players.map((player, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          minWidth: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "#4f46e5",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={player}
                        onChange={(e) => handlePlayerChange(i, e.target.value)}
                        placeholder={`Jucătorul ${i + 1}`}
                        style={{ marginBottom: 0, flex: 1 }}
                      />
                    </div>
                  ))}

                  <label style={{ marginTop: "8px" }}>
                    Note / mențiuni (opțional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ex: Avem nevoie de ecusoane"
                  />

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={regLoading}
                    style={{ marginTop: "8px" }}
                  >
                    {regLoading ? "Se înscrie..." : ` Înscrie echipa la turneu`}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      
      {tournament.status === "completed" && tournament.winner_first && (
        <div className="tournament-info-card" style={{ marginTop: 24 }}>
          <h3>Câștigătorii turneului</h3>
          <div className="winners-podium">
            
            {tournament.winner_second && (
              <div className="winner-card winner-second">
                <div className="winner-medal"></div>
                <div className="winner-place">Locul 2</div>
                <div className="winner-name">{tournament.winner_second}</div>
              </div>
            )}
            
            <div className="winner-card winner-first">
              <div className="winner-medal"></div>
              <div className="winner-place">Campioni</div>
              <div className="winner-name">{tournament.winner_first}</div>
            </div>
            
            {tournament.winner_third && (
              <div className="winner-card winner-third">
                <div className="winner-medal"></div>
                <div className="winner-place">Locul 3</div>
                <div className="winner-name">{tournament.winner_third}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentDetailPage;
