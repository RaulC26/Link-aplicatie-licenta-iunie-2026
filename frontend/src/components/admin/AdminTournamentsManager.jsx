import { useState, useEffect } from 'react'
import { Check, X, RotateCcw, Pencil, Trash2, Users, Trophy } from 'lucide-react'
import { API_URL } from '../../utils/api'
import { getToken } from '../../utils/auth'
import ErrorMessage from '../ErrorMessage'
import { SkeletonAdminTable, SkeletonTournamentCard } from '../Skeleton'
import AdminTournamentForm from './AdminTournamentForm'

function AdminTournamentsManager() {
 const [tournaments, setTournaments] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [showAdd, setShowAdd] = useState(false)
 const [editingTournament, setEditingTournament] = useState(null)

 // Vizualizare inscrieri
 const [viewRegistrations, setViewRegistrations] = useState(null)
 const [registrations, setRegistrations] = useState([])
 const [regLoading, setRegLoading] = useState(false)

 // Editare inline echipa
 const [editingRegId, setEditingRegId] = useState(null)
 const [editForm, setEditForm] = useState(null)
 const [saveLoading, setSaveLoading] = useState(false)
 const [saveError, setSaveError] = useState('')

 // Vizualizare/editare castigatori (locuri 1/2/3)
 const [viewWinners, setViewWinners] = useState(null)
 const [winnersForm, setWinnersForm] = useState({ winner_first: '', winner_second: '', winner_third: '' })
 const [winnersSaving, setWinnersSaving] = useState(false)
 const [winnersError, setWinnersError] = useState('')
 const [winnersSuccess, setWinnersSuccess] = useState('')

 useEffect(() => { loadTournaments() }, [])

 async function loadTournaments() {
 setLoading(true)
 try {
 const res = await fetch(API_URL + '/admin/tournaments', {
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (!res.ok) { setError(data.mesaj || 'Eroare'); return }
 setTournaments(data)
 } catch { setError('Eroare conexiune.') }
 finally { setLoading(false) }
 }

 async function loadRegistrations(tournament) {
 setViewRegistrations(tournament)
 setEditingRegId(null)
 setRegLoading(true)
 try {
 const res = await fetch(`${API_URL}/admin/tournaments/${tournament.id}/registrations`, {
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (res.ok) setRegistrations(data)
 } catch { }
 finally { setRegLoading(false) }
 }

 // Deschide vizualizarea de castigatori (locuri 1/2/3)
 function openWinners(tournament) {
 setViewWinners(tournament)
 setWinnersForm({
 winner_first: tournament.winner_first || '',
 winner_second: tournament.winner_second || '',
 winner_third: tournament.winner_third || ''
 })
 setWinnersError('')
 setWinnersSuccess('')
 }

 async function handleSaveWinners() {
 setWinnersError('')
 setWinnersSuccess('')
 setWinnersSaving(true)
 try {
 const res = await fetch(`${API_URL}/admin/tournaments/${viewWinners.id}/winners`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
 body: JSON.stringify(winnersForm)
 })
 const data = await res.json()
 if (!res.ok) { setWinnersError(data.mesaj || 'Eroare.'); return }
 setWinnersSuccess('Câștigătorii au fost salvați!')
 loadTournaments()
 } catch { setWinnersError('Eroare conexiune.') }
 finally { setWinnersSaving(false) }
 }

 async function handleDeleteTournament(t) {
 if (!window.confirm(`Ștergi turneul "${t.name}"? Se șterg și toate înscrierile.`)) return
 try {
 const res = await fetch(`${API_URL}/admin/tournaments/${t.id}`, {
 method: 'DELETE',
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (!res.ok) { alert(data.mesaj || 'Eroare.'); return }
 alert('Turneu șters!')
 loadTournaments()
 } catch { alert('Eroare conexiune.') }
 }

 async function handleStatusChange(regId, newStatus) {
 try {
 const res = await fetch(`${API_URL}/admin/tournaments/registrations/${regId}/status`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
 body: JSON.stringify({ status: newStatus })
 })
 const data = await res.json()
 if (!res.ok) { alert(data.mesaj || 'Eroare.'); return }
 loadRegistrations(viewRegistrations)
 } catch { alert('Eroare.') }
 }

 async function handleDeleteReg(reg) {
 if (!window.confirm(`Elimini echipa "${reg.team_name}" din turneu?`)) return
 try {
 const res = await fetch(`${API_URL}/admin/tournaments/registrations/${reg.id}`, {
 method: 'DELETE',
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (!res.ok) { alert(data.mesaj || 'Eroare.'); return }
 loadRegistrations(viewRegistrations)
 } catch { alert('Eroare conexiune.') }
 }

 function startEditReg(reg) {
 setEditingRegId(reg.id)
 setSaveError('')
 setEditForm({
 team_name: reg.team_name || '',
 captain_name: reg.captain_name || '',
 captain_phone: reg.captain_phone || '',
 notes: reg.notes || '',
 status: reg.status || 'pending',
 players: [...(reg.players || [])]
 })
 }

 function handlePlayerEdit(index, value) {
 const updated = [...editForm.players]
 updated[index] = value
 setEditForm({ ...editForm, players: updated })
 }

 async function handleSaveReg(regId) {
 setSaveError('')
 if (!editForm.team_name.trim()) { setSaveError('Numele echipei este obligatoriu.'); return }
 setSaveLoading(true)
 try {
 const res = await fetch(`${API_URL}/admin/tournaments/registrations/${regId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
 body: JSON.stringify(editForm)
 })
 const data = await res.json()
 if (!res.ok) { setSaveError(data.mesaj || 'Eroare.'); return }
 setEditingRegId(null)
 setEditForm(null)
 loadRegistrations(viewRegistrations)
 } catch { setSaveError('Eroare conexiune.') }
 finally { setSaveLoading(false) }
 }

 function formatDate(raw) {
 if (!raw) return '—'
 const d = new Date(raw)
 if (isNaN(d)) return '—'
 return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })
 }

 if (loading) return (
 <div className="tournaments-grid">
 {[1,2,3].map(i => <SkeletonTournamentCard key={i} />)}
 </div>
 )
 if (error) return <ErrorMessage message={error} />

 // ================================================================
 // VIZUALIZARE CASTIGATORI — formular locuri 1/2/3
 // ================================================================
 if (viewWinners) {
 // Listă echipe aprobate pentru sugestii rapide la auto-complete
 const approvedTeams = (viewWinners.approved_team_names || []).filter(Boolean)

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
 <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setViewWinners(null); setWinnersError(''); setWinnersSuccess('') }}>
 ← Înapoi
 </button>
 <h2 style={{ margin: 0 }}>Câștigători: {viewWinners.name}</h2>
 </div>

 <div className="profile-card" style={{ maxWidth: 640 }}>
 <div className="profile-card-header">
 <h3>Setează locurile premiate</h3>
 </div>

 <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>Introdu numele echipei câștigătoare pe fiecare loc. Câmpurile sunt opționale —
 poți completa doar locul 1 dacă turneul are doar un câștigător desemnat.
 </p>

 {winnersError && <ErrorMessage message={winnersError} />}
 {winnersSuccess && <div className="success"> {winnersSuccess}</div>}

 <div className="profile-edit-form">
 <label>Locul 1 (campioni)</label>
 <input
 type="text"
 list="approvedTeamsList"
 value={winnersForm.winner_first}
 onChange={e => setWinnersForm(f => ({ ...f, winner_first: e.target.value }))}
 placeholder="ex: FC Vulturii"
 maxLength={100}
 />

 <label>Locul 2 (vicecampioni)</label>
 <input
 type="text"
 list="approvedTeamsList"
 value={winnersForm.winner_second}
 onChange={e => setWinnersForm(f => ({ ...f, winner_second: e.target.value }))}
 placeholder="ex: FC Leii"
 maxLength={100}
 />

 <label>Locul 3 (semifinaliști)</label>
 <input
 type="text"
 list="approvedTeamsList"
 value={winnersForm.winner_third}
 onChange={e => setWinnersForm(f => ({ ...f, winner_third: e.target.value }))}
 placeholder="ex: FC Tigrii"
 maxLength={100}
 />

 {/* Datalist pentru sugestii rapide din echipele inscrise */}
 <datalist id="approvedTeamsList">
 {approvedTeams.map(name => <option key={name} value={name} />)}
 </datalist>

 <button
 className="btn-primary"
 onClick={handleSaveWinners}
 disabled={winnersSaving}
 style={{ marginTop: '16px' }}
 >
 {winnersSaving ? 'Se salvează...' : ' Salvează câștigătorii'}
 </button>
 </div>
 </div>
 </div>
 )
 }

 // ================================================================
 // VIZUALIZARE INSCRIERI — carduri per echipa
 // ================================================================
 if (viewRegistrations) {
 const approved = registrations.filter(r => r.status === 'approved').length
 const pending = registrations.filter(r => r.status === 'pending').length
 const rejected = registrations.filter(r => r.status === 'rejected').length

 return (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
 <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => {
 setViewRegistrations(null)
 setEditingRegId(null)
 }}>
 ← Înapoi la turnee
 </button>
 <h2 style={{ margin: 0 }}> {viewRegistrations.name}</h2>
 </div>

 <div className="reg-stats-row">
 <div className="reg-stat-badge reg-stat-total">
 👥 {registrations.length} echipe
 </div>
 <div className="reg-stat-badge reg-stat-approved">
 {approved} aprobate
 </div>
 <div className="reg-stat-badge reg-stat-pending">
 {pending} în așteptare
 </div>
 {rejected > 0 && (
 <div className="reg-stat-badge reg-stat-rejected">
 {rejected} respinse
 </div>
 )}
 <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Maxim: {viewRegistrations.max_teams} echipe · {viewRegistrations.team_size} jucători/echipă
 </span>
 </div>

 {regLoading ? (
 <div className="teams-grid">
 {[1,2,3].map(i => <SkeletonAdminTable key={i} rows={3} cols={4} />)}
 </div>
 ) : registrations.length === 0 ? (
 <div className="empty-state" style={{ padding: '40px 0' }}>
 <p>👥</p>
 <h3>Nicio echipă înscrisă încă</h3>
 </div>
 ) : (
 <div className="teams-grid">
 {registrations.map((reg, i) => (
 <div key={reg.id} className={`team-card team-card-${reg.status}`}>

 {editingRegId !== reg.id ? (
 <>
 <div className="team-card-header">
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span className="team-number">#{i + 1}</span>
 <h3 className="team-name">{reg.team_name}</h3>
 </div>
 <span className={`tournament-status tournament-status-${reg.status === 'approved' ? 'active' : reg.status === 'rejected' ? 'cancelled' : 'upcoming'}`}>
 {reg.status === 'approved' ? ' Aprobată' : reg.status === 'rejected' ? ' Respinsă' : ' Așteptare'}
 </span>
 </div>

 <div className="team-card-info">
 <div className="team-info-row">
 <span>Căpitan:</span>
 <strong>{reg.captain_name || '—'}</strong>
 </div>
 <div className="team-info-row">
 <span>Telefon:</span>
 <strong>{reg.captain_phone || '—'}</strong>
 </div>
 <div className="team-info-row">
 <span>🙋 Cont:</span>
 <span style={{ fontSize: '0.82rem' }}>
 {reg.user_name}
 <small style={{ color: '#9ca3af', display: 'block' }}>{reg.user_email}</small>
 </span>
 </div>
 {reg.notes && (
 <div className="team-info-row">
 <span>📝 Note:</span>
 <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{reg.notes}</span>
 </div>
 )}
 </div>

 <div className="team-players-section">
 <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Jucători ({(reg.players || []).length})
 </p>
 <ol className="team-players-list">
 {(reg.players || []).map((p, j) => (
 <li key={j}>{p}</li>
 ))}
 </ol>
 </div>

 <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '12px' }}>Înscris: {formatDate(reg.created_at)}
 </p>

 <div className="team-card-actions">
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 {reg.status !== 'approved' && (
 <button className="btn-approve" onClick={() => handleStatusChange(reg.id, 'approved')}>
 <Check size={13} strokeWidth={2.5} /> Aprobă
 </button>
 )}
 {reg.status !== 'rejected' && (
 <button className="btn-reject" onClick={() => handleStatusChange(reg.id, 'rejected')}>
 <X size={13} strokeWidth={2.5} /> Respinge
 </button>
 )}
 {reg.status !== 'pending' && (
 <button className="btn-reset" onClick={() => handleStatusChange(reg.id, 'pending')}>
 <RotateCcw size={13} strokeWidth={2.5} /> Resetează
 </button>
 )}
 </div>
 <div style={{ display: 'flex', gap: '6px' }}>
 <button className="btn-edit" onClick={() => startEditReg(reg)}>
 <Pencil size={13} strokeWidth={2.5} /> Editează
 </button>
 <button className="btn-delete" onClick={() => handleDeleteReg(reg)}>
 <Trash2 size={13} strokeWidth={2.5} /> Elimină
 </button>
 </div>
 </div>
 </>
 ) : (
 <>
 <div className="team-card-header">
 <span className="team-number">#{i + 1}</span>
 <h3 style={{ margin: 0, color: '#1d4ed8', fontSize: '0.95rem' }}>Editare echipă</h3>
 </div>

 {saveError && <ErrorMessage message={saveError} />}

 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 <div>
 <label className="form-label">Nume echipă *</label>
 <input className="form-input"
 value={editForm.team_name}
 onChange={e => setEditForm({ ...editForm, team_name: e.target.value })}
 />
 </div>
 <div>
 <label className="form-label">Nume căpitan</label>
 <input className="form-input"
 value={editForm.captain_name}
 onChange={e => setEditForm({ ...editForm, captain_name: e.target.value })}
 />
 </div>
 <div>
 <label className="form-label">Telefon căpitan</label>
 <input className="form-input"
 value={editForm.captain_phone}
 onChange={e => setEditForm({ ...editForm, captain_phone: e.target.value })}
 />
 </div>

 <div>
 <label className="form-label">Jucători</label>
 {editForm.players.map((p, j) => (
 <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
 <span style={{
 minWidth: '22px', height: '22px', borderRadius: '50%',
 background: '#4f46e5', color: 'white', display: 'flex',
 alignItems: 'center', justifyContent: 'center',
 fontSize: '0.72rem', fontWeight: 700, flexShrink: 0
 }}>{j + 1}</span>
 <input
 className="form-input"
 style={{ marginBottom: 0 }}
 value={p}
 onChange={e => handlePlayerEdit(j, e.target.value)}
 placeholder={`Jucătorul ${j + 1}`}
 />
 </div>
 ))}
 </div>

 <div>
 <label className="form-label">Status</label>
 <select className="form-input"
 value={editForm.status}
 onChange={e => setEditForm({ ...editForm, status: e.target.value })}
 >
 <option value="pending">În așteptare</option>
 <option value="approved">Aprobată</option>
 <option value="rejected">Respinsă</option>
 </select>
 </div>

 <div>
 <label className="form-label">Note</label>
 <input className="form-input"
 value={editForm.notes}
 onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
 />
 </div>
 </div>

 <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
 <button className="btn-primary" style={{ flex: 1 }}
 onClick={() => handleSaveReg(reg.id)} disabled={saveLoading}>
 {saveLoading ? 'Se salvează...' : ' Salvează'}
 </button>
 <button className="btn-secondary" onClick={() => { setEditingRegId(null); setSaveError('') }}>Anulează
 </button>
 </div>
 </>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 )
 }

 // ================================================================
 // LISTA DE TURNEE
 // ================================================================
 return (
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <h2>Turnee ({tournaments.length})</h2>
 {!showAdd && !editingTournament && (
 <button className="btn-primary" onClick={() => setShowAdd(true)}>
 + Turneu nou
 </button>
 )}
 </div>

 {showAdd && (
 <AdminTournamentForm
 tournament={null}
 onSuccess={() => { setShowAdd(false); loadTournaments() }}
 onCancel={() => setShowAdd(false)}
 />
 )}

 {editingTournament && (
 <AdminTournamentForm
 tournament={editingTournament}
 onSuccess={() => { setEditingTournament(null); loadTournaments() }}
 onCancel={() => setEditingTournament(null)}
 />
 )}

 {!showAdd && !editingTournament && (
 <div className="admin-table-wrapper">
 <table className="admin-table">
 <thead>
 <tr>
 <th>Nume</th><th>Start</th><th>Deadline</th><th>Echipe</th><th>Jucători</th><th>Status</th><th>Acțiuni</th>
 </tr>
 </thead>
 <tbody>
 {tournaments.map(t => (
 <tr key={t.id}>
 <td>
 <strong>{t.name}</strong>
 {/* Indicator vizual daca turneul are castigatori setati */}
 {t.winner_first && (
 <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: 2 }}>
 {t.winner_first}
 </div>
 )}
 </td>
 <td>{formatDate(t.start_date)}</td>
 <td>{formatDate(t.registration_deadline)}</td>
 <td>{t.registrations_count || 0} / {t.max_teams}</td>
 <td>{t.team_size} / echipă</td>
 <td>
 <span className={`tournament-status tournament-status-${t.status}`}>
 {t.status === 'upcoming' ? 'Înregistrări' : t.status === 'active' ? 'Activ' : t.status === 'completed' ? 'Finalizat' : 'Anulat'}
 </span>
 </td>
 <td>
 <button className="btn-edit" onClick={() => loadRegistrations(t)}>
 <Users size={13} strokeWidth={2.5} /> Echipe
 </button>
 <button className="btn-edit" onClick={() => openWinners(t)}>
 <Trophy size={13} strokeWidth={2.5} /> Câștigători
 </button>
 <button className="btn-edit" onClick={() => setEditingTournament(t)}>
 <Pencil size={13} strokeWidth={2.5} /> Editează
 </button>
 <button className="btn-delete" onClick={() => handleDeleteTournament(t)}>
 <Trash2 size={13} strokeWidth={2.5} /> Șterge
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )
}

export default AdminTournamentsManager
