import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CheckCircle2, XCircle, List } from 'lucide-react'
import { API_URL } from '../utils/api'
import { getToken } from '../utils/auth'
import BookingCard from './BookingCard'
import ErrorMessage from './ErrorMessage'
import { SkeletonBookingCard } from './Skeleton'

// Tab-urile disponibile - fiecare are propria culoare (clasa) si iconita
const TABS = [
 { key: 'upcoming', label: 'Viitoare', icon: CalendarDays, color: 'tab-upcoming' },
 { key: 'past', label: 'Trecute', icon: CheckCircle2, color: 'tab-past' },
 { key: 'cancelled', label: 'Anulate', icon: XCircle, color: 'tab-cancelled' },
 { key: 'all', label: 'Toate', icon: List, color: 'tab-all' },
]

function BookingsList() {
 const [bookings, setBookings] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [activeTab, setActiveTab] = useState('upcoming')

 async function loadBookings() {
 setLoading(true)
 setError('')
 try {
 const response = await fetch(API_URL + '/bookings/my', {
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await response.json()
 if (!response.ok) { setError(data.mesaj || 'Eroare la încărcarea rezervărilor.'); return }
 setBookings(data)
 } catch {
 setError('Nu s-a putut conecta la server.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => { loadBookings() }, [])

 if (loading) return (
 <div className="bookings-list">
 {[1, 2, 3].map(i => <SkeletonBookingCard key={i} />)}
 </div>
 )
 if (error) return <ErrorMessage message={error} />

 // Momentul curent pentru comparații cu data + ora rezervării
 const now = new Date()

 // Helper: combină booking_date + end_time într-un obiect Date
 // Edge case: booking_date vine ca ISO UTC ("2026-05-31T21:00:00.000Z") din MariaDB
 // din cauza fusului orar EEST (+3). Folosim getFullYear/Month/Date ca să luăm
 // data LOCALĂ corectă, nu substring care ar da ziua precedentă.
 function getEndDateTime(b) {
 const d = new Date(b.booking_date)
 const yyyy = d.getFullYear()
 const mm = String(d.getMonth() + 1).padStart(2, '0')
 const dd = String(d.getDate()).padStart(2, '0')
 return new Date(`${yyyy}-${mm}-${dd}T${b.end_time}`)
 }

 // Filtrăm rezervările în funcție de tab-ul activ
 // Edge case: o rezervare anulată din trecut NU trebuie să apară și la "Trecute"
 // ca să nu fie numărată dublu (1 + 10 + 2 trebuie să fie egal cu Toate)
 function filterBookings(tab) {
 switch (tab) {
 case 'upcoming':
 // Viitoare = încă nu s-a încheiat (end_time > acum) ȘI status activ
 return bookings.filter(b =>
 (b.status === 'pending' || b.status === 'confirmed') &&
 getEndDateTime(b) > now
 )
 case 'past':
 // Trecute = end_time <= acum SAU status completed; exclus cancelled
 return bookings.filter(b => b.status !== 'cancelled' &&
 (getEndDateTime(b) <= now || b.status === 'completed')
 )
 case 'cancelled':
 return bookings.filter(b => b.status === 'cancelled')
 default:
 return bookings
 }
 }

 const filtered = filterBookings(activeTab)

 // Numărăm rezervările per tab pentru badge-uri
 const counts = {
 upcoming: filterBookings('upcoming').length,
 past: filterBookings('past').length,
 cancelled: filterBookings('cancelled').length,
 all: bookings.length,
 }

 // Mesaj gol diferit per tab
 const emptyMessages = {
 upcoming: { icon: '', title: 'Nicio rezervare viitoare', sub: 'Rezervă un teren pentru a juca!' },
 past: { icon: '🕐', title: 'Nicio rezervare trecută', sub: 'Istoricul tău va apărea aici.' },
 cancelled: { icon: '', title: 'Nicio rezervare anulată', sub: 'Nu ai anulat nicio rezervare.' },
 all: { icon: '', title: 'Nu ai rezervări încă', sub: 'Rezervă primul tău teren!' },
 }

 return (
 <div>
 {/* Tab-uri cu badge-uri count + culori distincte per categorie */}
 <div className="bookings-tabs">
 {TABS.map(tab => {
 const Icon = tab.icon
 return (
 <button
 key={tab.key}
 className={`bookings-tab ${tab.color}${activeTab === tab.key ? ' active' : ''}`}
 onClick={() => setActiveTab(tab.key)}
 >
 <Icon size={15} strokeWidth={2.5} />
 {tab.label}
 {counts[tab.key] > 0 && (
 <span className={`bookings-tab-badge${activeTab === tab.key ? ' active' : ''}`}>
 {counts[tab.key]}
 </span>
 )}
 </button>
 )
 })}
 </div>

 {/* Lista rezervări sau mesaj gol */}
 {filtered.length === 0 ? (
 <div className="empty-state">
 <p style={{ fontSize: '2.5rem', marginBottom: 8 }}>{emptyMessages[activeTab].icon}</p>
 <h3>{emptyMessages[activeTab].title}</h3>
 <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>{emptyMessages[activeTab].sub}</p>
 {activeTab === 'upcoming' || activeTab === 'all' ? (
 <Link to="/" className="btn-primary">Caută terenuri</Link>
 ) : null}
 </div>
 ) : (
 <div className="bookings-list">
 {filtered.map(booking => (
 <BookingCard
 key={booking.id}
 booking={booking}
 onCancel={loadBookings}
 />
 ))}
 </div>
 )}
 </div>
 )
}

export default BookingsList
