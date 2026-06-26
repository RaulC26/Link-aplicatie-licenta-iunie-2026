import { useEffect } from 'react'
import BookingForm from './BookingForm'

// Props:
//   field   = obiectul terenului
//   isOpen  = true/false dacă modalul e vizibil
//   onClose = funcție apelată pentru a închide modalul
function BookingModal({ field, isOpen, onClose }) {

  useEffect(() => {
    // Edge case: accesibilitate - ESC pe tastatură închide modalul
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    // Cleanup: scoatem event listener-ul când modalul se închide
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Dacă modalul nu e deschis, nu randăm nimic
  if (!isOpen) return null

  return (
    // Overlay - fundalul întunecat
    // Edge case: click pe overlay (în afara modalului) îl închide
    <div className="modal-overlay" onClick={onClose}>

      {/* stopPropagation oprește click-ul să ajungă la overlay */}
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Rezervă: {field.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
          {field.location} · {field.price_per_hour} lei / oră
        </p>

        <BookingForm field={field} onSuccess={onClose} />
      </div>
    </div>
  )
}

export default BookingModal
