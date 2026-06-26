import { useState } from "react";
import { Settings, MapPin, CalendarDays, Users, Trophy } from "lucide-react";
import AdminFieldsManager from "../components/admin/AdminFieldsManager";
import AdminBookingsList from "../components/admin/AdminBookingsList";
import AdminUsersList from "../components/admin/AdminUsersList";
import AdminTournamentsManager from "../components/admin/AdminTournamentsManager";

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("fields");

  return (
    <div className="page-container">
      {/* Header admin */}
      <div className="page-hero-bar" style={{ marginBottom: "32px" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                color: "white",
              }}
            >
              <Settings size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.75rem" }}>
                Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8" }}>
                Gestionează terenuri, rezervări, utilizatori și turnee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab-uri */}
      <div className="admin-tabs">
        <button
          className={activeTab === "fields" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("fields")}
        >
          <MapPin size={15} strokeWidth={2.5} /> Terenuri
        </button>
        <button
          className={
            activeTab === "bookings" ? "admin-tab active" : "admin-tab"
          }
          onClick={() => setActiveTab("bookings")}
        >
          <CalendarDays size={15} strokeWidth={2.5} /> Rezervări
        </button>
        <button
          className={activeTab === "users" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("users")}
        >
          <Users size={15} strokeWidth={2.5} /> Utilizatori
        </button>
        <button
          className={
            activeTab === "tournaments" ? "admin-tab active" : "admin-tab"
          }
          onClick={() => setActiveTab("tournaments")}
        >
          <Trophy size={15} strokeWidth={2.5} /> Turnee
        </button>
      </div>

      <div className="admin-tab-content">
        {activeTab === "fields" && <AdminFieldsManager />}
        {activeTab === "bookings" && <AdminBookingsList />}
        {activeTab === "users" && <AdminUsersList />}
        {activeTab === "tournaments" && <AdminTournamentsManager />}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
