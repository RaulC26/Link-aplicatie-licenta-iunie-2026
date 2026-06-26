import { useState, useEffect, useMemo } from "react";
import { API_URL } from "../../utils/api";
import { getToken } from "../../utils/auth";
import ErrorMessage from "../ErrorMessage";
import { SkeletonAdminTable } from "../Skeleton";

function AdminBookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterId, setFilterId] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL + "/admin/bookings", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.mesaj || "Eroare.");
        return;
      }
      setBookings(data);
    } catch {
      setError("Eroare conexiune.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusClass(status) {
    if (status === "confirmed") return "status-confirmed";
    if (status === "pending") return "status-pending";
    if (status === "cancelled") return "status-cancelled";
    if (status === "completed") return "status-completed";
    return "";
  }

  function translateStatus(status) {
    if (status === "confirmed") return "Confirmată";
    if (status === "pending") return "În așteptare";
    if (status === "cancelled") return "Anulată";
    if (status === "completed") return "Finalizată";
    return status;
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterId && !String(b.id).includes(filterId.trim())) return false;

      if (filterUser.trim()) {
        const q = filterUser.trim().toLowerCase();
        const inName = (b.user_name || "").toLowerCase().includes(q);
        const inEmail = (b.user_email || "").toLowerCase().includes(q);
        if (!inName && !inEmail) return false;
      }

      if (filterDate) {
        const d = new Date(b.booking_date);
        const bDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (bDate !== filterDate) return false;
      }

      if (filterStatus && b.status !== filterStatus) return false;

      return true;
    });
  }, [bookings, filterId, filterUser, filterDate, filterStatus]);

  function clearFilters() {
    setFilterId("");
    setFilterUser("");
    setFilterDate("");
    setFilterStatus("");
  }

  const hasActiveFilters = filterId || filterUser || filterDate || filterStatus;

  if (loading) return <SkeletonAdminTable rows={7} cols={7} />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>
          Toate Rezervările ({filteredBookings.length}
          {hasActiveFilters ? ` / ${bookings.length}` : ""})
        </h2>
        <button className="btn-primary" onClick={loadBookings}>
          Reîncarcă
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "flex-end",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", minWidth: 110 }}
        >
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ID
          </label>
          <input
            type="text"
            className="form-input"
            style={{ marginBottom: 0 }}
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            placeholder="ex: 42"
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 180,
          }}
        >
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            User (nume sau email)
          </label>
          <input
            type="text"
            className="form-input"
            style={{ marginBottom: 0 }}
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            placeholder="ex: ion sau ion@exemplu.ro"
          />
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", minWidth: 150 }}
        >
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Data rezervării
          </label>
          <input
            type="date"
            className="form-input"
            style={{ marginBottom: 0 }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", minWidth: 160 }}
        >
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Status
          </label>
          <select
            className="form-input"
            style={{ marginBottom: 0 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Toate</option>
            <option value="confirmed">Confirmată</option>
            <option value="pending">În așteptare</option>
            <option value="cancelled">Anulată</option>
            <option value="completed">Finalizată</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary"
            onClick={clearFilters}
            style={{ padding: "8px 16px" }}
          >
            ✕ Reset filtre
          </button>
        )}
      </div>

      {filteredBookings.length === 0 ? (
        <p style={{ color: "#666" }}>
          {hasActiveFilters
            ? "Nicio rezervare nu corespunde filtrelor."
            : "Nu există rezervări."}
        </p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Utilizator</th>
                <th>Teren</th>
                <th>Data</th>
                <th>Orar</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>
                    <strong>{booking.user_name}</strong>
                    <br />
                    <small style={{ color: "#888" }}>
                      {booking.user_email}
                    </small>
                  </td>
                  <td>{booking.field_name}</td>
                  <td>
                    {new Date(booking.booking_date).toLocaleDateString("ro-RO")}
                  </td>
                  <td>
                    {booking.start_time} – {booking.end_time}
                  </td>
                  <td>{booking.total_price} lei</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(booking.status)}`}
                    >
                      {translateStatus(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminBookingsList;
