import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "../utils/api";
import ErrorMessage from "../components/ErrorMessage";
import { SkeletonTournamentCard } from "../components/Skeleton";

// Mapări status → text, clasă CSS, emoji indicator
const statusLabel = {
  upcoming: "Înscrieri deschise",
  active: "În desfășurare",
  completed: "Finalizat",
  cancelled: "Anulat",
};
const statusClass = {
  upcoming: "tournament-status-upcoming",
  active: "tournament-status-active",
  completed: "tournament-status-completed",
  cancelled: "tournament-status-cancelled",
};
const statusDot = {
  upcoming: "🟢",
  active: "🔵",
  completed: "⚫",
  cancelled: "🔴",
};

// Variante stagger — grila de turnee apare card cu card
const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] },
  },
};

function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/tournaments");
      const data = await res.json();
      if (!res.ok) {
        setError(data.mesaj || "Eroare");
        return;
      }
      setTournaments(data);
    } catch {
      setError("Eroare conexiune.");
    } finally {
      setLoading(false);
    }
  }

  // Formatăm data cu timezone-safe (adăugăm T12:00:00 pentru a evita shift-ul de zi)
  function formatDate(raw) {
    if (!raw) return "—";
    return new Date(
      String(raw).substring(0, 10) + "T12:00:00",
    ).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Calculăm câte zile mai sunt până la deadline-ul de înscriere
  function daysUntilDeadline(raw) {
    if (!raw) return null;
    const diff = Math.ceil(
      (new Date(String(raw).substring(0, 10) + "T23:59:59") - new Date()) /
        86400000,
    );
    return diff;
  }

  // Filtrăm turneele în funcție de status selectat
  const filtered =
    filter === "all"
      ? tournaments
      : tournaments.filter((t) => t.status === filter);

  if (loading)
    return (
      <div className="page-container">
        <div className="tournaments-grid">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonTournamentCard key={i} />
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    );

  return (
    <div className="page-container">
      {/* ===== HERO TURNEE ===== */}
      <motion.div
        className="tournaments-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="tournaments-hero-emoji"></span>
        <h1>Turnee de Fotbal</h1>
        <p>
          Înscrie-ți echipa la competițiile organizate și luptă pentru victorie!
          Fiecare meci contează.
        </p>
      </motion.div>

      {/* ===== FILTRE STATUS ===== */}
      <motion.div
        className="tournaments-filter"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {[
          { key: "all", label: "🔀 Toate", count: tournaments.length },
          { key: "upcoming", label: "🟢 Înscrieri deschise" },
          { key: "active", label: "🔵 În desfășurare" },
          { key: "completed", label: "⚫ Finalizate" },
        ].map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {/* Badge cu număr total — apare doar pentru filtrul "Toate" */}
            {f.count !== undefined && (
              <span
                style={{
                  marginLeft: 4,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 99,
                  padding: "1px 7px",
                  fontSize: "0.75rem",
                }}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ===== GRID TURNEE ===== */}
      {filtered.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="empty-state-icon"></span>
          <h3>Niciun turneu disponibil</h3>
          <p>
            Nu există turnee în această categorie. Revino mai târziu pentru noi
            competiții.
          </p>
        </motion.div>
      ) : (
        // Grid animat cu stagger — cardurile apar succesiv la schimbarea filtrului
        <motion.div
          className="tournaments-grid"
          key={filter}
          variants={gridContainer}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((t) => {
            const days = daysUntilDeadline(t.registration_deadline);
            const spotsLeft = Math.max(
              0,
              t.max_teams - (t.registrations_count || 0),
            );
            const fillPct = Math.min(
              100,
              Math.round(((t.registrations_count || 0) / t.max_teams) * 100),
            );

            return (
              // Card cu animație de apariție și hover cu ridicare
              <motion.div
                key={t.id}
                className="tournament-card"
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.22, ease: "easeOut" },
                }}
              >
                {/* Bară colorată sus pentru identitate vizuală */}
                <div className="tournament-card-header-band" />

                <div className="tournament-card-body">
                  {/* Badge status + countdown deadline */}
                  <div className="tournament-card-top">
                    <span
                      className={`tournament-status ${statusClass[t.status] || ""}`}
                    >
                      {statusDot[t.status]} {statusLabel[t.status] || t.status}
                    </span>
                    {t.status === "upcoming" && days !== null && days > 0 && (
                      <span className="tournament-deadline">
                        ⏰ {days} {days === 1 ? "zi" : "zile"}
                      </span>
                    )}
                    {/* Edge case: deadline expirat dar turneul e încă upcoming */}
                    {t.status === "upcoming" && days !== null && days <= 0 && (
                      <span className="tournament-deadline">⏰ Expirat</span>
                    )}
                  </div>

                  <h2 className="tournament-name">{t.name}</h2>

                  {t.description && (
                    <p className="tournament-description">{t.description}</p>
                  )}

                  {/* Grid meta cu detalii turneu — 2 coloane */}
                  <div className="tournament-meta">
                    {t.location && (
                      <div className="tournament-meta-item">
                        <span className="tournament-meta-icon"></span>
                        <span>{t.location}</span>
                      </div>
                    )}
                    <div className="tournament-meta-item">
                      <span className="tournament-meta-icon"></span>
                      <span>{formatDate(t.start_date)}</span>
                    </div>
                    <div className="tournament-meta-item">
                      <span className="tournament-meta-icon">👥</span>
                      <span>
                        <strong>{t.team_size}</strong>jucători/echipă
                      </span>
                    </div>
                    {t.prize_info && (
                      <div className="tournament-meta-item">
                        <span className="tournament-meta-icon"></span>
                        <span>{t.prize_info}</span>
                      </div>
                    )}
                  </div>

                  {/* Bara de locuri disponibile — fill progresiv */}
                  <div className="tournament-spots-bar">
                    <div className="tournament-spots-label">
                      <span>
                        {t.registrations_count || 0}/{t.max_teams} echipe
                      </span>
                      <span
                        style={{
                          color: spotsLeft > 0 ? "#16a34a" : "#dc2626",
                          fontWeight: 700,
                        }}
                      >
                        {spotsLeft > 0
                          ? `${spotsLeft} locuri libere`
                          : "🔴 Complet"}
                      </span>
                    </div>
                    <div className="tournament-spots-track">
                      <div
                        className="tournament-spots-fill"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="tournament-card-footer">
                    <Link to={`/tournaments/${t.id}`} className="btn-primary">
                      {t.status === "upcoming"
                        ? " Înscrie echipa"
                        : "👀 Vezi detalii"}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default TournamentsPage;
