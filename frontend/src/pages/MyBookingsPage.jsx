import { useState } from 'react'
import { CalendarDays, Trophy } from 'lucide-react'
import BookingsList from '../components/BookingsList'
import MyTournamentsList from '../components/MyTournamentsList'
import { getUserFromToken } from '../utils/auth'

function MyBookingsPage() {
 const [activeTab, setActiveTab] = useState('bookings')
 const user = getUserFromToken()

 // Inițiala pentru avatar
 const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?'

 return (
 <div className="page-container">

 {/* Header vizual */}
 <div className="my-account-header">
 <div className="my-account-avatar-big">{initial}</div>
 <div className="my-account-info">
 <h1>Contul meu</h1>
 <p>Gestionează rezervările tale și înscrierile la turnee</p>
 </div>
 </div>

 {/* Tab-uri */}
 <div className="admin-tabs" style={{ marginBottom: '28px' }}>
 <button
 className={activeTab === 'bookings' ? 'admin-tab active' : 'admin-tab'}
 onClick={() => setActiveTab('bookings')}
 >
 <CalendarDays size={15} strokeWidth={2.5} /> Rezervări terenuri
 </button>
 <button
 className={activeTab === 'tournaments' ? 'admin-tab active' : 'admin-tab'}
 onClick={() => setActiveTab('tournaments')}
 >
 <Trophy size={15} strokeWidth={2.5} /> Turnee înscrise
 </button>
 </div>

 {activeTab === 'bookings' && <BookingsList />}
 {activeTab === 'tournaments' && <MyTournamentsList />}
 </div>
 )
}

export default MyBookingsPage
