import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

// Modal de confirmare custom — înlocuiește window.confirm() cu un design modern
// Props:
//   title       = titlul dialogului (ex: "Anulezi rezervarea?")
//   message     = mesajul de confirmare
//   onConfirm   = callback când userul apasă butonul de confirmare
//   onCancel    = callback când userul apasă "Renunță" sau dă click pe overlay
//   confirmText = textul butonului de confirmare (default: "Confirmă")
//   danger      = dacă true, butonul principal e roșu (pentru acțiuni distructive)
function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirmă', danger = true }) {
  return (
    // Overlay întunecat — click pe el închide modalul
    <div className="modal-overlay" onClick={onCancel}>
      {/* Motion div pentru animație de apariție spring */}
      <motion.div
        className="modal-container confirm-modal-box"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Buton închidere în colțul din dreapta */}
        <button className="confirm-modal-close" onClick={onCancel}>
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Iconița de avertizare — roșie pentru acțiuni periculoase */}
        <div className={`confirm-modal-icon ${danger ? 'confirm-icon-danger' : 'confirm-icon-info'}`}>
          <AlertTriangle size={30} strokeWidth={2} />
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        {message && <p className="confirm-modal-msg">{message}</p>}

        <div className="confirm-modal-actions">
          {/* Renunță — varianta sigură */}
          <button className="btn-secondary confirm-modal-cancel" onClick={onCancel}>
            Renunță
          </button>
          {/* Confirmă — roșu pentru acțiuni distructive */}
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ConfirmModal
