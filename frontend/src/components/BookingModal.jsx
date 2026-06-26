import { useEffect } from "react";
import BookingForm from "./BookingForm";

function BookingModal({ field, isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rezervă: {field.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ color: "#666", marginBottom: "20px", fontSize: "0.9rem" }}>
          {field.location} · {field.price_per_hour} lei / oră
        </p>

        <BookingForm field={field} onSuccess={onClose} />
      </div>
    </div>
  );
}

export default BookingModal;
