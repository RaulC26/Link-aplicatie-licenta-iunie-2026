import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { getToken, isLoggedIn } from '../utils/auth'
import ErrorMessage from '../components/ErrorMessage'
import { SkeletonFieldDetail } from '../components/Skeleton'
import FieldMap from '../components/FieldMap'
import DatePickerBar from '../components/DatePickerBar'
import ReviewsSection from '../components/ReviewsSection'

function FieldDetailPage() {
 const { id } = useParams()
 const navigate = useNavigate()

 const [field, setField] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 // Data selectată — implicit azi
 // Edge case: folosim componentele LOCALE (getFullYear/Month/Date) ca sa nu cadem
 // in trecut din cauza fusului EEST. La 1AM Romania, UTC e ziua precedenta.
 const todayLocal = new Date()
 const today = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`
 const [selectedDate, setSelectedDate] = useState(today)
 const [slots, setSlots] = useState([])
 const [slotsLoading, setSlotsLoading] = useState(false)

 // Array de sloturi selectate (multi-select consecutiv, max 4)
 const [selectedSlots, setSelectedSlots] = useState([])

 const [bookingLoading, setBookingLoading] = useState(false)
 const [bookingError, setBookingError] = useState('')

 useEffect(() => { loadField() }, [id])

 useEffect(() => {
 if (field) loadSlots()
 }, [selectedDate, field])

 async function loadField() {
 setLoading(true)
 try {
 const res = await fetch(API_URL + '/fields/' + id)
 const data = await res.json()
 if (!res.ok) { setError(data.mesaj || 'Teren negăsit'); return }
 setField(data)
 } catch { setError('Eroare conexiune.') }
 finally { setLoading(false) }
 }

 async function loadSlots() {
 setSlotsLoading(true)
 setSelectedSlots([])
 setBookingError('')
 try {
 const res = await fetch(`${API_URL}/fields/${id}/slots?date=${selectedDate}`)
 const data = await res.json()
 if (res.ok) setSlots(data)
 } catch { /* non-fatal */ }
 finally { setSlotsLoading(false) }
 }

 function handleSelectSlot(slot) {
 if (!isLoggedIn()) { navigate('/login'); return }
 if (!slot.available) return

 setBookingError('')

 const isSelected = selectedSlots.some(s => s.start_time === slot.start_time)

 if (isSelected) {
 // Click pe slot deja selectat → deselectăm tot
 setSelectedSlots([])
 return
 }

 if (selectedSlots.length === 0) {
 setSelectedSlots([slot])
 return
 }

 // Verificăm adiacența față de selecția curentă
 const sorted = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
 const firstStart = sorted[0].start_time
 const lastEnd = sorted[sorted.length - 1].end_time

 if (slot.start_time === lastEnd) {
 // Adăugăm DUPĂ
 if (selectedSlots.length >= 4) { setBookingError('Poți selecta maxim 4 ore consecutive.'); return }
 setSelectedSlots([...sorted, slot])
 } else if (slot.end_time === firstStart) {
 // Adăugăm ÎNAINTE
 if (selectedSlots.length >= 4) { setBookingError('Poți selecta maxim 4 ore consecutive.'); return }
 setSelectedSlots([slot, ...sorted])
 } else {
 // Edge case: slot ne-adiacent → resetăm selecția la noul slot
 setSelectedSlots([slot])
 }
 }

 // Confirmă rezervarea și redirecționează direct la plată Stripe
 async function confirmBooking() {
 if (selectedSlots.length === 0) return
 setBookingLoading(true)
 setBookingError('')

 try {
 const startTimes = selectedSlots.map(s => s.start_time)
 const isSingle = selectedSlots.length === 1
 const url = API_URL + (isSingle ? '/bookings' : '/bookings/multi')
 const body = isSingle
 ? { field_id: field.id, booking_date: selectedDate, start_time: startTimes[0] }
 : { field_id: field.id, booking_date: selectedDate, start_times: startTimes }

 const res = await fetch(url, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
 body: JSON.stringify(body)
 })
 const data = await res.json()
 if (!res.ok) { setBookingError(data.mesaj || 'Eroare la rezervare.'); return }

 // Obținem booking_id-ul pentru a iniția plata
 // Edge case: single booking → data.bookingId, multi → data.bookingIds[0]
 const bookingId = isSingle ? data.bookingId : data.bookingIds[0]

 if (!bookingId) {
 // Edge case: ID-ul lipsă din răspuns → redirectăm la rezervările mele
 navigate('/my-bookings')
 return
 }

 // Creăm sesiunea de checkout Stripe și redirecționăm direct
 setBookingError('')
 try {
 const payRes = await fetch(API_URL + '/payments/create-checkout-session', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + getToken()
 },
 body: JSON.stringify({ booking_id: bookingId })
 })
 const payData = await payRes.json()

 if (payRes.ok && payData.url) {
 // Redirecționăm direct la Stripe Checkout
 window.location.href = payData.url
 } else {
 // Edge case: dacă plata eșuează, mergem la rezervările mele unde pot plăti manual
 navigate('/my-bookings')
 }
 } catch {
 // Edge case: rețea căzută după creare rezervare → oricum rezervarea e creată
 navigate('/my-bookings')
 }

 } catch { setBookingError('Eroare conexiune.') }
 finally { setBookingLoading(false) }
 }

 function formatDate(dateStr) {
 return new Date(dateStr + 'T12:00:00').toLocaleDateString('ro-RO', {
 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
 })
 }

 if (loading) return <SkeletonFieldDetail />

  if (error) return <div className="page-container"><ErrorMessage message={error} /></div>

 const sortedSelected = [...selectedSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
 const totalPrice = parseFloat(field.price_per_hour) * selectedSlots.length

 return (
 <div className="page-container">

 {/* === HERO: imagine cu overlay gradient === */}
 <div className="field-hero">
 {field.image_url && (
 <img
 src={field.image_url}
 alt={field.name}
 className="field-hero-img"
 onError={e => { e.target.style.display = 'none' }}
 />
 )}
 <div className="field-hero-overlay">
 {/* Breadcrumb pe fundalul întunecat */}
 <div className="field-hero-breadcrumb">
 <Link to="/">Acasă</Link> › <Link to="/">Terenuri</Link> › <span>{field.name}</span>
 </div>
 <h1 className="field-hero-title">{field.name}</h1>
 <p className="field-hero-location"> {field.location}</p>
 {field.description && (
 <p className="field-hero-desc">{field.description}</p>
 )}
 <span className="field-price-pill">{field.price_per_hour} lei / oră</span>
 </div>
 </div>

 {/* === SECȚIUNEA DE REZERVARE === */}
 <div className="booking-section">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
 <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>Rezervă sloturi orare
 </h2>
 <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click pe un slot · Poți selecta până la 4 ore consecutive
 </span>
 </div>

 {/* Bara modernă de selectare dată (stil Booksport) — înlocuiește input type="date" */}
 <DatePickerBar
 selectedDate={selectedDate}
 onChange={date => setSelectedDate(date)}
 />

 {/* Grid sloturi — pill-uri interactive */}
 {slotsLoading ? (
 // Skeleton sloturi — 14 pill-uri placeholder cât se încarcă disponibilitatea
 <div className="slots-grid">
 {Array.from({ length: 14 }).map((_, i) => (
 <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--radius-lg)' }} />
 ))}
 </div>
 ) : (
 <div className="slots-grid">
 {slots.map(slot => {
 const isSelected = selectedSlots.some(s => s.start_time === slot.start_time)
 let cls = 'slot-btn '
 if (!slot.available) cls += 'slot-occupied'
 else if (isSelected) cls += 'slot-selected'
 else cls += 'slot-free'

 return (
 <button
 key={slot.start_time}
 className={cls}
 onClick={() => handleSelectSlot(slot)}
 disabled={!slot.available}
 title={slot.available ? `${slot.start_time}–${slot.end_time}` : 'Ocupat'}
 >
 {slot.start_time}
 <span className="slot-end-time">{slot.end_time}</span>
 </button>
 )
 })}
 </div>
 )}

 {/* Legendă */}
 <div className="slots-legend">
 <span className="legend-item"><span className="legend-dot dot-free"></span>Disponibil</span>
 <span className="legend-item"><span className="legend-dot dot-occupied"></span>Ocupat</span>
 <span className="legend-item"><span className="legend-dot dot-selected"></span>Selectat</span>
 </div>

 {/* Panel de confirmare — apare doar când ai sloturi selectate */}
 {selectedSlots.length > 0 && (
 <div className="booking-confirm-panel">
 <h3>Confirmare rezervare</h3>
 <p><strong>Teren:</strong> {field.name}</p>
 <p><strong>Data:</strong> {formatDate(selectedDate)}</p>
 <p><strong>Interval:</strong> {sortedSelected[0].start_time} – {sortedSelected[sortedSelected.length - 1].end_time}</p>
 <p><strong>Durată:</strong> {selectedSlots.length} {selectedSlots.length === 1 ? 'oră' : 'ore'}</p>
 <p>
 <strong>Preț total:</strong>{' '}
 <span className="confirm-price">{totalPrice} lei</span>
 {selectedSlots.length > 1 && (
 <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
 {' '}({field.price_per_hour} lei × {selectedSlots.length})
 </small>
 )}
 </p>

 {bookingError && <ErrorMessage message={bookingError} />}

 <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
 {/* Butonul confirmă duce direct la Stripe — nu mai e nevoie să mergi la "Rezervările mele" */}
 <button className="btn-primary" onClick={confirmBooking} disabled={bookingLoading}>
 {bookingLoading ? 'Se procesează...' : ' Rezervă și plătește'}
 </button>
 <button className="btn-danger" onClick={() => { setSelectedSlots([]); setBookingError('') }}>Anulează selecția
 </button>
 </div>
 </div>
 )}

 {bookingError && selectedSlots.length === 0 && <ErrorMessage message={bookingError} />}
 </div>

 {/* === SECȚIUNEA HARTĂ (doar dacă terenul are coordonate) === */}
 {/* Edge case: afișăm harta DOAR dacă terenul are coordonate salvate */}
 {field.latitude && field.longitude && (
 <div className="map-section">
 <h2 style={{ marginBottom: '16px' }}>Localizare pe hartă</h2>
 <FieldMap
 lat={parseFloat(field.latitude)}
 lng={parseFloat(field.longitude)}
 name={field.name}
 />
 <p className="map-address-hint">
 📌 {field.location}
 </p>
 </div>
 )}

 {/* === SECȚIUNEA RECENZII === */}
 <ReviewsSection fieldId={id} />
 </div>
 )
}

export default FieldDetailPage
