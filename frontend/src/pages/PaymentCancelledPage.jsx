import { useSearchParams, Link } from 'react-router-dom'

function PaymentCancelledPage() {
 const [searchParams] = useSearchParams()
 const bookingId = searchParams.get('booking_id')

 return (
 <div className="page-container">
 <div className="payment-result-card">

 <div className="payment-icon payment-icon-cancelled"></div>
 <h1 style={{ color: '#991b1b', marginBottom: '12px' }}>Plată anulată</h1>

 <p style={{ color: '#374151', fontSize: '1.05rem', marginBottom: '8px' }}>Ai anulat procesul de plată.
 </p>

 {/* Edge case: rezervarea rămâne activă cu status 'pending' - userul poate plăti mai târziu */}
 <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '32px' }}>Rezervarea ta rămâne în status <strong>"Așteaptă plata"</strong>și o poți plăti oricând
 din secțiunea "Rezervările mele".
 {bookingId && ` · Rezervare #${bookingId}`}
 </p>

 <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
 {/* "Încearcă din nou" duce la my-bookings unde poate apăsa Plătește */}
 <Link to="/my-bookings" className="btn-primary">Încearcă din nou
 </Link>
 <Link to="/" className="btn-secondary">Acasă
 </Link>
 </div>

 </div>
 </div>
 )
}

export default PaymentCancelledPage
