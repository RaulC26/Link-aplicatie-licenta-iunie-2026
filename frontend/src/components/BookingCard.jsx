import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, CalendarDays, Clock, Banknote, CreditCard, X } from 'lucide-react'
import ConfirmModal from './ConfirmModal'
import { API_URL } from '../utils/api'
import { getToken } from '../utils/auth'
import { useToast } from '../context/ToastContext'

const statusClass = {
 pending: 'status-pending',
 confirmed: 'status-confirmed',
 cancelled: 'status-cancelled',
 completed: 'status-completed'
}

const statusLabel = {
 pending: 'Așteaptă plata',
 confirmed: 'Confirmată ',
 cancelled: 'Anulată',
 completed: 'Finalizată'
}

function BookingCard({ booking, onCancel }) {
 const [payLoading, setPayLoading] = useState(false)
 const [cancelLoading, setCancelLoading] = useState(false)
 const [showCancelModal, setShowCancelModal] = useState(false)
 const { showToast } = useToast()

 async function handlePay() {
 setPayLoading(true)
 try {
 const response = await fetch(API_URL + '/payments/create-checkout-session', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + getToken()
 },
 body: JSON.stringify({ booking_id: booking.id })
 })

 const data = await response.json()

 if (!response.ok) {
 showToast(data.mesaj || 'Eroare la inițierea plății.', 'error')
 return
 }

 window.location.href = data.url

 } catch {
 showToast('Eroare de conexiune. Încearcă din nou.', 'error')
 } finally {
 setPayLoading(false)
 }
 }

 async function handleConfirmCancel() {
 setShowCancelModal(false)
 setCancelLoading(true)

 try {
 const response = await fetch(API_URL + '/bookings/' + booking.id, {
 method: 'DELETE',
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })

 const data = await response.json()

 if (!response.ok) {
 showToast(data.mesaj || 'Eroare la anulare.', 'error')
 return
 }

 showToast('Rezervare anulată cu succes!', 'success')
 onCancel()

 } catch {
 showToast('Eroare de conexiune.', 'error')
 } finally {
 setCancelLoading(false)
 }
 }

 function formatBookingDate(raw) {
 if (!raw) return '—'
 const date = new Date(raw)
 if (isNaN(date)) return String(raw)
 return date.toLocaleDateString('ro-RO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
 }
 const formattedDate = formatBookingDate(booking.booking_date)

 function localDateStr(raw) {
 const d = new Date(raw)
 const yyyy = d.getFullYear()
 const mm = String(d.getMonth() + 1).padStart(2, '0')
 const dd = String(d.getDate()).padStart(2, '0')
 return `${yyyy}-${mm}-${dd}`
 }
 const now = new Date()
 const todayStr = localDateStr(now)
 const bookingDateStr = localDateStr(booking.booking_date)
 const bookingStart = String(booking.start_time).substring(0, 5) // ex: "09:00"
 const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')

 const isBookingInPast = bookingDateStr < todayStr || (bookingDateStr === todayStr && bookingStart <= currentHHMM)

 const isPastUnpaid = booking.status === 'pending' && isBookingInPast

 const isCancellable = (booking.status === 'pending' || booking.status === 'confirmed') && !isBookingInPast

 return (
 <>
 {showCancelModal && (
 <ConfirmModal
 title="Anulezi rezervarea?"
 message={`Ești sigur că vrei să anulezi rezervarea la "${booking.field_name}" din ${formattedDate}? Decizia este definitivă și suma plătită nu va fi rambursată.`}
 confirmText="Da, anulează"
 danger={true}
 onConfirm={handleConfirmCancel}
 onCancel={() => setShowCancelModal(false)}
 />
 )}

 <motion.div
 className={`booking-card booking-card-${booking.status}`}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, ease: 'easeOut' }}
 whileHover={{ x: 4, transition: { duration: 0.2, ease: 'easeOut' } }}
 >
  <div className="booking-card-header">
 <h3>{booking.field_name}</h3>
 <span className={`status-badge-large ${booking.status}`}>
 {statusLabel[booking.status] || booking.status}
 </span>
 </div>

 <div className="booking-card-details">
 <p><MapPin size={14} strokeWidth={2.5} /> {booking.field_location}</p>
 <p><CalendarDays size={14} strokeWidth={2.5} /> {formattedDate}</p>
 <p><Clock size={14} strokeWidth={2.5} /> {booking.start_time} — {booking.end_time}</p>
 <p className="booking-price"><Banknote size={14} strokeWidth={2.5} /> {booking.total_price} lei</p>
 </div>

 <div className="booking-card-actions">
 {isPastUnpaid && (
 <span className="booking-expired-label">Plată expirată
 </span>
 )}

 {booking.status === 'pending' && !isPastUnpaid && (
 <button
 className="btn-pay"
 onClick={handlePay}
 disabled={payLoading}
 >
 <CreditCard size={15} strokeWidth={2.5} />
 {payLoading ? 'Se procesează...' : 'Plătește acum'}
 </button>
 )}

 {isCancellable && (
 <button
 className="btn-danger"
 onClick={() => setShowCancelModal(true)}
 disabled={cancelLoading}
 >
 <X size={15} strokeWidth={2.5} />
 {cancelLoading ? 'Se anulează...' : 'Anulează'}
 </button>
 )}
 </div>
 </motion.div>
 </>
 )
}

export default BookingCard




