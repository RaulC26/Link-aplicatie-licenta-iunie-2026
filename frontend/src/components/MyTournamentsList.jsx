import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { getToken } from '../utils/auth'
import ErrorMessage from './ErrorMessage'
import { SkeletonTournamentReg } from './Skeleton'

function MyTournamentsList() {
 const [registrations, setRegistrations] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 useEffect(() => { loadRegistrations() }, [])

 async function loadRegistrations() {
 setLoading(true)
 try {
 const res = await fetch(`${API_URL}/tournaments/my/registrations`, {
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (!res.ok) { setError(data.mesaj || 'Eroare'); return }
 setRegistrations(data)
 } catch { setError('Eroare conexiune.') }
 finally { setLoading(false) }
 }

 async function handleCancel(regId, tournamentName) {
 if (!window.confirm(`Anulezi înscrierea la turneul "${tournamentName}"?`)) return
 try {
 const res = await fetch(`${API_URL}/tournaments/registrations/${regId}`, {
 method: 'DELETE',
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (!res.ok) { alert(data.mesaj || 'Eroare.'); return }
 loadRegistrations()
 } catch { alert('Eroare conexiune.') }
 }

 function formatDate(raw) {
 if (!raw) return '—'
 return new Date(String(raw).substring(0, 10) + 'T12:00:00').toLocaleDateString('ro-RO', {
 day: 'numeric', month: 'long', year: 'numeric'
 })
 }

 if (loading) return (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 {[1,2,3].map(i => <SkeletonTournamentReg key={i} />)}
 </div>
 )
 if (error) return <ErrorMessage message={error} />

  if (registrations.length === 0) {
 return (
 <div className="empty-state">
 <p></p>
 <h3>Nu ești înscris la niciun turneu</h3>
 <p style={{ marginBottom: '20px' }}>Caută un turneu activ și înscrie-ți echipa!</p>
 <Link to="/tournaments" className="btn-primary">Vezi turnee disponibile
 </Link>
 </div>
 )
 }

 return (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 {registrations.map(reg => (
 <div key={reg.id} className={`my-tournament-card my-tournament-${reg.status}`}>

 <div className="my-tournament-header">
 <div>
 <h3 className="my-tournament-title"> {reg.tournament_name}</h3>
 <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
 {formatDate(reg.start_date)}
 {reg.tournament_location && <> · {reg.tournament_location}</>}
 </p>
 </div>
 <span className={`status-badge-large ${reg.status}`}>
 {reg.status === 'pending' ? ' În așteptare' :
 reg.status === 'approved' ? ' Aprobată' : ' Respinsă'}
 </span>
 </div>

 <div className="my-tournament-body">

 <div className="my-tournament-col">
 <p className="my-tournament-section-title">Echipa ta</p>
 <div className="my-tournament-info-grid">
 <div className="my-info-row">
 <span>Nume echipă</span>
 <strong>{reg.team_name}</strong>
 </div>
 {reg.captain_name && (
 <div className="my-info-row">
 <span>Căpitan</span>
 <strong>{reg.captain_name}</strong>
 </div>
 )}
 {reg.captain_phone && (
 <div className="my-info-row">
 <span>Telefon căpitan</span>
 <strong>{reg.captain_phone}</strong>
 </div>
 )}
 {reg.notes && (
 <div className="my-info-row">
 <span>Note</span>
 <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>{reg.notes}</span>
 </div>
 )}
 <div className="my-info-row">
 <span>Data înscrierii</span>
 <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{formatDate(reg.created_at)}</span>
 </div>
 </div>
 </div>

 <div className="my-tournament-col">
 <p className="my-tournament-section-title">Jucătorii echipei ({(reg.players || []).length}/{reg.team_size})</p>
 {(reg.players || []).length > 0 ? (
 <ol className="my-players-list">
 {(reg.players || []).map((player, i) => (
 <li key={i} className="my-player-item">
 <span className="my-player-number">{i + 1}</span>
 <span className="my-player-name">{player}</span>
 </li>
 ))}
 </ol>
 ) : (
 <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Niciun jucător înregistrat.</p>
 )}
 </div>
 </div>

 <div className="my-tournament-footer">
 <Link to={`/tournaments/${reg.tournament_id}`} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Vezi turneul
 </Link>
 {reg.status === 'pending' && (
 <button
 className="btn-danger"
 style={{ fontSize: '0.85rem', padding: '8px 16px' }}
 onClick={() => handleCancel(reg.id, reg.tournament_name)}
 > Anulează înscrierea
 </button>
 )}
 {reg.status === 'approved' && (
 <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>Înscrierea ta a fost aprobată de organizatori
 </span>
 )}
 </div>
 </div>
 ))}
 </div>
 )
}

export default MyTournamentsList
