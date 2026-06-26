import { useState, useEffect } from 'react'
import { API_URL } from '../../utils/api'
import { getToken } from '../../utils/auth'
import ErrorMessage from '../ErrorMessage'
import AdminDatePicker from './AdminDatePicker'

// Formularul de creare / editare turneu din panoul de admin
function AdminTournamentForm({ tournament, onSuccess, onCancel }) {
 // Dacă avem un turneu existent, preumplem câmpurile cu datele lui
 const [name, setName] = useState(tournament?.name || '')
 const [description, setDescription] = useState(tournament?.description || '')
 const [startDate, setStartDate] = useState(
 tournament?.start_date ? String(tournament.start_date).substring(0, 10) : ''
 )
 const [endDate, setEndDate] = useState(
 tournament?.end_date ? String(tournament.end_date).substring(0, 10) : ''
 )
 const [deadline, setDeadline] = useState(
 tournament?.registration_deadline ? String(tournament.registration_deadline).substring(0, 10) : ''
 )
 const [maxTeams, setMaxTeams] = useState(tournament?.max_teams || 8)
 const [teamSize, setTeamSize] = useState(tournament?.team_size || 5)
 const [prizeInfo, setPrizeInfo] = useState(tournament?.prize_info || '')
 const [status, setStatus] = useState(tournament?.status || 'upcoming')

 // ID-ul terenului selectat — înlocuiește câmpul de locație text liber
 const [fieldId, setFieldId] = useState(tournament?.field_id ? String(tournament.field_id) : '')

 // Lista de terenuri disponibile pentru dropdown
 const [fields, setFields] = useState([])
 const [fieldsLoading, setFieldsLoading] = useState(true)

 // Formatul turneului — knockout, groups_knockout sau league
 const [format, setFormat] = useState(tournament?.format || 'knockout')

 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 // Determinăm dacă e formular de editare sau de creare
 const isEdit = !!tournament

 // Data minimă selectabilă în calendar — azi (doar la creare, la editare nu blocăm)
 // Edge case: data locala (nu UTC) ca sa evitam decalajul EEST
 const _nowLocal = new Date()
 const todayStr = `${_nowLocal.getFullYear()}-${String(_nowLocal.getMonth() + 1).padStart(2, '0')}-${String(_nowLocal.getDate()).padStart(2, '0')}`

 // Edge case: dacă turneul a trecut deja calendaristic, blocăm statusurile "upcoming" și "active"
 // Practic, nu poți "reactiva" un turneu cu data în trecut (vezi backend admin.js)
 const tournamentEndStr = tournament?.end_date ? String(tournament.end_date).substring(0, 10) : null
 const isPastTournament = isEdit && tournamentEndStr && tournamentEndStr < todayStr

 // Încărcăm terenurile la montarea componentei
 useEffect(() => {
 async function loadFields() {
 setFieldsLoading(true)
 try {
 // Cerem lista de terenuri din API (ruta publică)
 const res = await fetch(API_URL + '/fields', {
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (res.ok) setFields(data)
 } catch {
 // Edge case: dacă nu putem încărca terenurile, continuăm fără ele
 console.error('Nu s-au putut încărca terenurile')
 } finally {
 setFieldsLoading(false)
 }
 }
 loadFields()
 }, [])

 async function handleSubmit(e) {
 e.preventDefault()
 setError('')

 // Validare câmpuri obligatorii
 if (!name.trim()) { setError('Numele turneului este obligatoriu.'); return }
 if (!fieldId) { setError('Locația (terenul) este obligatorie.'); return }
 if (!startDate) { setError('Data de start este obligatorie.'); return }
 if (!endDate) { setError('Data de final este obligatorie.'); return }
 if (!deadline) { setError('Termenul limită de înscriere este obligatoriu.'); return }
 if (!maxTeams || Number(maxTeams) < 2) { setError('Numărul de echipe trebuie să fie minim 2.'); return }
 if (!teamSize || Number(teamSize) < 1) { setError('Numărul de jucători per echipă trebuie să fie minim 1.'); return }

 // Edge case: data de start si deadline NU pot fi in trecut, indiferent daca e creare sau editare
 // Singura exceptie: la editare, daca data originala era deja in trecut SI nu a fost SCHIMBATA, o lasam
 // Asta permite admin-ului sa editeze alte campuri ale unui turneu vechi fara sa fie obligat sa-i schimbe data
 const originalStart = tournament?.start_date ? String(tournament.start_date).substring(0, 10) : ''
 const originalDeadline = tournament?.registration_deadline ? String(tournament.registration_deadline).substring(0, 10) : ''

 if (startDate < todayStr && startDate !== originalStart) {
 setError('Data de start nu poate fi în trecut.')
 return
 }
 if (deadline < todayStr && deadline !== originalDeadline) {
 setError('Termenul limită de înscriere nu poate fi în trecut.')
 return
 }

 // Edge case: data de final trebuie să fie după data de start
 if (endDate < startDate) {
 setError('Data de final trebuie să fie după data de start.')
 return
 }

 // Edge case: deadline-ul trebuie să fie înainte de sau egal cu data de start
 if (deadline > startDate) {
 setError('Termenul limită de înscriere trebuie să fie înainte de data de start.')
 return
 }

 setLoading(true)

 try {
 // Dacă edităm, folosim PUT, altfel POST
 const url = isEdit
 ? `${API_URL}/admin/tournaments/${tournament.id}`
 : `${API_URL}/admin/tournaments`
 const method = isEdit ? 'PUT' : 'POST'

 const res = await fetch(url, {
 method,
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + getToken()
 },
 body: JSON.stringify({
 name: name.trim(),
 description: description.trim(),
 start_date: startDate,
 end_date: endDate,
 registration_deadline: deadline,
 max_teams: Number(maxTeams),
 team_size: Number(teamSize),
 prize_info: prizeInfo.trim(),
 status,
 format,
 // Trimitem field_id dacă s-a selectat un teren, altfel null
 field_id: fieldId ? Number(fieldId) : null
 })
 })

 const data = await res.json()
 if (!res.ok) { setError(data.mesaj || 'Eroare la salvare.'); return }

 // Notificăm părintele că s-a salvat cu succes
 onSuccess()
 } catch {
 setError('Eroare conexiune server.')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="admin-form-container">
 <h3>{isEdit ? ` Editează turneul: ${tournament.name}` : '➕ Turneu nou'}</h3>

 {error && <ErrorMessage message={error} />}

 <form onSubmit={handleSubmit}>
 {/* Grid cu 2 coloane pentru câmpuri */}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>

 {/* Coloana stângă */}
 <div>
 <label className="form-label">Nume turneu *</label>
 <input
 className="form-input"
 type="text"
 value={name}
 onChange={e => setName(e.target.value)}
 placeholder="ex: Cupa Primăverii 2026"
 />

 <label className="form-label">Data de start *</label>
 <AdminDatePicker
 value={startDate}
 onChange={val => {
 setStartDate(val)
 // Edge case: dacă data de final e înainte de noul start, o resetăm
 if (endDate && val > endDate) setEndDate('')
 // Edge case: dacă termenul limită e după noul start, îl resetăm
 if (deadline && val < deadline) setDeadline('')
 }}
 min={todayStr}
 placeholder="Selectează data de start"
 />

 <label className="form-label">Data de final *</label>
 <AdminDatePicker
 value={endDate}
 onChange={setEndDate}
 min={startDate || todayStr}
 placeholder="Selectează data de final"
 />

 <label className="form-label">Termen limită înscrieri *</label>
 <AdminDatePicker
 value={deadline}
 onChange={setDeadline}
 min={todayStr}
 max={startDate || undefined}
 placeholder="Selectează termenul limită"
 />
 </div>

 {/* Coloana dreaptă */}
 <div>
 {/* Dropdown pentru selectarea terenului (înlocuiește textul liber de locație) */}
 <label className="form-label">Teren / Locație *</label>
 <select
 className="form-input"
 value={fieldId}
 onChange={e => setFieldId(e.target.value)}
 disabled={fieldsLoading}
 >
 <option value="">
 {fieldsLoading ? 'Se încarcă terenurile...' : '— Fără teren specific —'}
 </option>
 {/* Fiecare teren din BD apare ca opțiune */}
 {fields.map(f => (
 <option key={f.id} value={f.id}>
 {f.name} — {f.location}
 </option>
 ))}
 </select>

 <label className="form-label">Număr maxim echipe *</label>
 <input
 className="form-input"
 type="number"
 min="2"
 max="64"
 value={maxTeams}
 onChange={e => setMaxTeams(e.target.value)}
 />

 <label className="form-label">Jucători per echipă *</label>
 <input
 className="form-input"
 type="number"
 min="1"
 max="15"
 value={teamSize}
 onChange={e => setTeamSize(e.target.value)}
 />

 <label className="form-label">Format turneu *</label>
 <select
 className="form-input"
 value={format}
 onChange={e => setFormat(e.target.value)}
 >
 <option value="knockout">Eliminare directă</option>
 <option value="groups_knockout">Grupe + Bracket</option>
 <option value="league">Campionat (Ligă)</option>
 </select>

 <label className="form-label">Status</label>
 {isEdit ? (
 // La editare — toate statusurile disponibile
 // Edge case: dacă turneul a trecut, ascundem opțiunile "upcoming" / "active"
 <>
 <select
 className="form-input"
 value={status}
 onChange={e => {
 const newStatus = e.target.value
 // Avertizăm utilizatorul când se încearcă "resuscitarea" unui turneu trecut
 if (isPastTournament && (newStatus === 'upcoming' || newStatus === 'active')) {
 alert(` Turneul s-a încheiat pe ${tournamentEndStr}. Nu îl mai poți readuce la "${newStatus === 'upcoming' ? 'Înregistrări deschise' : 'Activ'}". Folosește "Finalizat" sau "Anulat".`)
 return
 }
 setStatus(newStatus)
 }}
 >
 {!isPastTournament && <option value="upcoming">Înregistrări deschise</option>}
 {!isPastTournament && <option value="active">Activ (în desfășurare)</option>}
 <option value="completed">Finalizat</option>
 <option value="cancelled">Anulat</option>
 </select>
 {isPastTournament && (
 <p style={{ fontSize: '0.78rem', color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>Turneul s-a încheiat pe {tournamentEndStr}. Statusul poate fi schimbat doar între „Finalizat" și „Anulat".
 </p>
 )}
 </>
 ) : (
 // La creare — doar "upcoming" are sens; afișăm ca read-only
 <div className="form-input" style={{ background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
 🟢 Înregistrări deschise
 </div>
 )}
 </div>
 </div>

 {/* Câmpuri pe lățime completă */}
 <label className="form-label">Premii / informații premii</label>
 <input
 className="form-input"
 type="text"
 value={prizeInfo}
 onChange={e => setPrizeInfo(e.target.value)}
 placeholder="ex: 1.000 lei + trofeu pentru locul 1"
 />

 <label className="form-label">Descriere</label>
 <textarea
 className="form-input"
 rows={3}
 value={description}
 onChange={e => setDescription(e.target.value)}
 placeholder="Descriere detaliată a turneului..."
 style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.95rem' }}
 />

 <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
 <button type="submit" className="btn-primary" disabled={loading}>
 {loading ? 'Se salvează...' : isEdit ? 'Salvează modificările' : 'Creează turneul'}
 </button>
 <button type="button" className="btn-secondary" onClick={onCancel}>Anulează
 </button>
 </div>
 </form>
 </div>
 )
}

export default AdminTournamentForm
