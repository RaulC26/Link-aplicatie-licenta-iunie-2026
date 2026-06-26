import { useState, useEffect } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { API_URL } from '../../utils/api'
import { getToken, getUserFromToken } from '../../utils/auth'
import ErrorMessage from '../ErrorMessage'
import { SkeletonAdminTable } from '../Skeleton'

function AdminUsersList() {
 const [users, setUsers] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 // Filtru de căutare după nume sau email
 const [search, setSearch] = useState('')

 // Userul aflat în modul editare — null când nu edităm pe nimeni
 const [editingUser, setEditingUser] = useState(null)
 const [editForm, setEditForm] = useState({ name: '', phone: '', role: '' })
 const [editError, setEditError] = useState('')
 const [savingEdit, setSavingEdit] = useState(false)

 // ID-ul adminului logat — folosit ca să nu îl lași să se șteargă/modifice pe sine
 const currentAdmin = getUserFromToken()
 const currentAdminId = currentAdmin ? currentAdmin.userId : null

 useEffect(() => {
 loadUsers()
 }, [])

 async function loadUsers() {
 setLoading(true)
 setError('')
 try {
 const response = await fetch(API_URL + '/admin/users', {
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await response.json()
 if (!response.ok) { setError(data.mesaj || 'Eroare.'); return }
 setUsers(data)
 } catch {
 setError('Eroare conexiune.')
 } finally {
 setLoading(false)
 }
 }

 // Intră în modul editare pentru un user — preumplem formularul
 function startEdit(user) {
 setEditingUser(user)
 setEditError('')
 setEditForm({
 name: user.name || '',
 phone: user.phone || '',
 role: user.role || 'user'
 })
 }

 function cancelEdit() {
 setEditingUser(null)
 setEditForm({ name: '', phone: '', role: '' })
 setEditError('')
 }

 // Salvează modificările
 async function handleSaveEdit() {
 if (!editForm.name.trim() || editForm.name.trim().length < 2) {
 setEditError('Numele trebuie să aibă minim 2 caractere.')
 return
 }
 setSavingEdit(true)
 setEditError('')
 try {
 const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + getToken()
 },
 body: JSON.stringify(editForm)
 })
 const data = await res.json()
 if (!res.ok) { setEditError(data.mesaj || 'Eroare.'); return }
 cancelEdit()
 loadUsers()
 } catch {
 setEditError('Eroare conexiune.')
 } finally {
 setSavingEdit(false)
 }
 }

 // Ștergere user — cu confirmare clară
 async function handleDelete(user) {
 if (!window.confirm(`Sigur ștergi utilizatorul "${user.name}" (${user.email})?\n\nAceastă acțiune nu poate fi anulată.`)) return
 try {
 const res = await fetch(`${API_URL}/admin/users/${user.id}`, {
 method: 'DELETE',
 headers: { 'Authorization': 'Bearer ' + getToken() }
 })
 const data = await res.json()
 if (!res.ok) { alert(data.mesaj || 'Eroare.'); return }
 alert(data.mesaj)
 loadUsers()
 } catch {
 alert('Eroare conexiune.')
 }
 }

 // Filtrăm userii după search (nume sau email)
 const filteredUsers = users.filter(u => {
 if (!search.trim()) return true
 const q = search.trim().toLowerCase()
 return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
 })

 if (loading) return <SkeletonAdminTable rows={6} cols={7} />

  if (error) return <ErrorMessage message={error} />

  return (
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 <h2>Toți Utilizatorii ({filteredUsers.length}{search ? ` / ${users.length}` : ''})</h2>
 <button className="btn-primary" onClick={loadUsers}>Reîncarcă
 </button>
 </div>

 {/* Bara de căutare */}
 <div style={{ marginBottom: '16px' }}>
 <input
 type="text"
 className="form-input"
 style={{ maxWidth: 360, marginBottom: 0 }}
 placeholder="🔍 Caută după nume sau email..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 />
 </div>

 {filteredUsers.length === 0 ? (
 <p style={{ color: '#666' }}>
 {search ? 'Niciun utilizator nu corespunde căutării.' : 'Nu există utilizatori.'}
 </p>
 ) : (
 <div className="admin-table-wrapper">
 <table className="admin-table">
 <thead>
 <tr>
 <th>ID</th>
 <th>Nume</th>
 <th>Email</th>
 <th>Telefon</th>
 <th>Rol</th>
 <th>Data înregistrării</th>
 <th>Acțiuni</th>
 </tr>
 </thead>
 <tbody>
 {filteredUsers.map(user => {
 const isSelf = user.id === currentAdminId
 const isEditing = editingUser && editingUser.id === user.id

 if (isEditing) {
 // === MOD EDITARE — un singur user în formular inline ===
 return (
 <tr key={user.id} style={{ background: '#fef9c3' }}>
 <td>{user.id}</td>
 <td>
 <input
 className="form-input"
 style={{ marginBottom: 0 }}
 value={editForm.name}
 onChange={e => setEditForm({ ...editForm, name: e.target.value })}
 />
 </td>
 {/* Email-ul nu se poate modifica — e cheia unică de identificare */}
 <td><small>{user.email}</small></td>
 <td>
 <input
 className="form-input"
 style={{ marginBottom: 0 }}
 value={editForm.phone}
 onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
 placeholder="—"
 />
 </td>
 <td>
 <select
 className="form-input"
 style={{ marginBottom: 0 }}
 value={editForm.role}
 onChange={e => setEditForm({ ...editForm, role: e.target.value })}
 disabled={isSelf}
 >
 <option value="user">user</option>
 <option value="admin">admin</option>
 </select>
 </td>
 <td colSpan={2}>
 {editError && (
 <p style={{ color: '#dc2626', fontSize: '0.78rem', margin: '0 0 6px' }}>
 {editError}
 </p>
 )}
 <div style={{ display: 'flex', gap: '6px' }}>
 <button className="btn-primary" style={{ padding: '6px 12px' }} onClick={handleSaveEdit} disabled={savingEdit}>
 {savingEdit ? '...' : ' Salvează'}
 </button>
 <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={cancelEdit}>
 
 </button>
 </div>
 </td>
 </tr>
 )
 }

 // === MOD VIZUALIZARE ===
 return (
 <tr key={user.id}>
 <td>{user.id}</td>
 <td>
 {user.name}
 {isSelf && <span style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-dark)' }}>(Tu)</span>}
 </td>
 <td>{user.email}</td>
 {/* Edge case: telefonul poate fi null dacă nu a fost completat */}
 <td>{user.phone || '—'}</td>
 <td>
 <span className={user.role === 'admin' ? 'role-badge-admin' : 'role-badge-user'}>
 {user.role}
 </span>
 </td>
 {/* Formatăm data în format românesc */}
 <td>{new Date(user.created_at).toLocaleDateString('ro-RO')}</td>
 <td>
 <div style={{ display: 'flex', gap: '4px' }}>
 <button
 className="btn-edit"
 onClick={() => startEdit(user)}
 style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
 >
 <Pencil size={13} strokeWidth={2.5} />
 Editează
 </button>
 {/* Edge case: butonul de ștergere este blocat pe propriul cont */}
 <button
 className="btn-delete"
 onClick={() => handleDelete(user)}
 disabled={isSelf}
 title={isSelf ? 'Nu te poți șterge pe tine însuți' : 'Șterge utilizatorul'}
 style={{ padding: '4px 10px', opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center' }}
 >
 <Trash2 size={13} strokeWidth={2.5} />
 </button>
 </div>
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )
}

export default AdminUsersList
