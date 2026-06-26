import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";
import { getToken } from "../utils/auth";
import ErrorMessage from "./ErrorMessage";

function BookingForm({ field, onSuccess }) {
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  function calculeazaPret() {
    if (!startTime || !endTime) return null;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const durataMinute = endH * 60 + endM - (startH * 60 + startM);

    if (durataMinute <= 0) return null;

    const durataOre = durataMinute / 60;
    return (durataOre * parseFloat(field.price_per_hour)).toFixed(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!bookingDate || !startTime || !endTime) {
      setError("Completează data și intervalul orar.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(bookingDate);
    if (selected < today) {
      setError("Nu poți rezerva pentru date trecute.");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const durataMinute = endH * 60 + endM - (startH * 60 + startM);

    if (durataMinute <= 0) {
      setError("Ora de sfârșit trebuie să fie după ora de început.");
      return;
    }

    if (durataMinute < 60) {
      setError("Rezervarea trebuie să fie de minim 1 oră.");
      return;
    }

    if (durataMinute > 240) {
      setError("Rezervarea nu poate depăși 4 ore.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL + "/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({
          field_id: field.id,
          booking_date: bookingDate,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.mesaj || "Eroare la rezervare.");
        return;
      }

      setSuccess(
        `Rezervare creată! Total: ${data.totalPrice} lei. Te redirecționăm...`,
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      setError("Eroare conexiune. Verifică serverul.");
    } finally {
      setLoading(false);
    }
  }

  const pretCalculat = calculeazaPret();

  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;

  return (
    <form className="form" onSubmit={handleSubmit} style={{ maxWidth: "100%" }}>
      {error && <ErrorMessage message={error} />}
      {success && <div className="success">{success}</div>}

      <label>Data rezervării</label>
      <input
        type="date"
        value={bookingDate}
        onChange={(e) => setBookingDate(e.target.value)}
        min={today}
        required
      />

      <label>Ora de start</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />

      <label>Ora de sfârșit</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />

      {pretCalculat && (
        <div className="pret-preview">
          Total estimat: <strong>{pretCalculat} lei</strong>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Se procesează..." : "Confirmă rezervarea"}
      </button>
    </form>
  );
}

export default BookingForm;
