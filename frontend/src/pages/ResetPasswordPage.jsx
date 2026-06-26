import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Check, X as XIcon, ArrowRight } from 'lucide-react'
import { API_URL } from '../utils/api'

function validatePassword(pw) {
 return {
 length: pw.length >= 8,
 uppercase: /[A-Z]/.test(pw),
 digit: /[0-9]/.test(pw),
 special: /[^A-Za-z0-9]/.test(pw)
 }
}

function ResetPasswordPage() {
 const [searchParams] = useSearchParams()
 const navigate = useNavigate()
 const token = searchParams.get('token') || ''
 const email = searchParams.get('email') || ''

 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showNew, setShowNew] = useState(false)
 const [showConfirm, setShowConfirm] = useState(false)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')

 const pwRules = validatePassword(newPassword)
 const allRulesValid = Object.values(pwRules).every(Boolean)

 async function handleSubmit(e) {
 e.preventDefault()
 setError(''); setSuccess('')

 if (!token || !email) {
 setError('Link invalid. Cere unul nou din pagina de resetare.')
 return
 }

 if (!newPassword || !confirmPassword) {
 setError('Completează ambele câmpuri de parolă.')
 return
 }
 if (newPassword !== confirmPassword) {
 setError('Parolele nu coincid.')
 return
 }
 if (!allRulesValid) {
 setError('Parola nu îndeplinește toate cerințele de securitate.')
 return
 }

 setLoading(true)
 try {
 const res = await fetch(API_URL + '/auth/reset-password', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, token, newPassword })
 })
 const data = await res.json()
 if (!res.ok) { setError(data.mesaj || 'Eroare la resetarea parolei.'); return }
 setSuccess(data.mesaj || 'Parola a fost resetată. Te poți autentifica.')
 setTimeout(() => navigate('/login'), 2500)
 } catch {
 setError('Eroare conexiune. Verifică serverul.')
 } finally {
 setLoading(false)
 }
 }

 // Daca lipsesc parametrii din URL, afisam mesaj de eroare
 if (!token || !email) {
 return (
 <div className="auth-page">
 <div className="auth-right" style={{ width: '100%' }}>
 <div className="auth-form-box" style={{ textAlign: 'center' }}>
 <h2 className="auth-form-title">Link invalid</h2>
 <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
 Acest link de resetare nu este valid sau a expirat.
 </p>
 <Link to="/forgot-password" className="btn-primary">
 Cere un link nou
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="auth-page">
 <div className="auth-left">
 <div className="auth-left-grid" />
 <Link to="/" className="auth-logo">
 <div className="auth-logo-icon">
 <div style={{
 width: '100%', height: '100%',
 backgroundImage: 'url("/logo fotrez transparent.png")',
 backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
 }} />
 </div>
 <div className="auth-logo-text">fotrez<span>Rezervări terenuri</span></div>
 </Link>

 <div className="auth-left-content">
 <p className="auth-tagline">Ultimul pas.<br />
 <span>Alege o parolă nouă.</span>
 </p>
 <p className="auth-tagline-sub">
 Asigură-te că noua parolă conține minim 8 caractere, o literă mare,
 o cifră și un simbol special.
 </p>
 </div>
 </div>

 <div className="auth-right">
 <div className="auth-form-box">
 <h2 className="auth-form-title">Setează parola nouă</h2>
 <p className="auth-form-sub">Pentru contul: <strong>{email}</strong></p>

 <form onSubmit={handleSubmit}>
 {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
 {success && <div className="success" style={{ marginBottom: '16px' }}>{success}</div>}

 <div className="auth-input-group">
 <label>Parolă nouă</label>
 <div className="auth-input-wrapper">
 <Lock size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type={showNew ? 'text' : 'password'}
 className="auth-input"
 value={newPassword}
 onChange={e => setNewPassword(e.target.value)}
 placeholder="Minim 8 caractere, 1 mare, 1 cifră, 1 simbol"
 style={{ paddingRight: '42px' }}
 autoFocus
 />
 <button type="button" onClick={() => setShowNew(s => !s)} className="auth-input-toggle">
 {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
 </button>
 </div>
 {newPassword && (
 <ul className="password-rules">
 <li className={pwRules.length ? 'rule-ok' : 'rule-bad'}>
 {pwRules.length ? <Check size={13} /> : <XIcon size={13} />} Minim 8 caractere
 </li>
 <li className={pwRules.uppercase ? 'rule-ok' : 'rule-bad'}>
 {pwRules.uppercase ? <Check size={13} /> : <XIcon size={13} />} O literă mare
 </li>
 <li className={pwRules.digit ? 'rule-ok' : 'rule-bad'}>
 {pwRules.digit ? <Check size={13} /> : <XIcon size={13} />} O cifră
 </li>
 <li className={pwRules.special ? 'rule-ok' : 'rule-bad'}>
 {pwRules.special ? <Check size={13} /> : <XIcon size={13} />} Un simbol
 </li>
 </ul>
 )}
 </div>

 <div className="auth-input-group">
 <label>Confirmă parola</label>
 <div className="auth-input-wrapper">
 <Lock size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type={showConfirm ? 'text' : 'password'}
 className="auth-input"
 value={confirmPassword}
 onChange={e => setConfirmPassword(e.target.value)}
 placeholder="Repetă parola nouă"
 style={{ paddingRight: '42px' }}
 />
 <button type="button" onClick={() => setShowConfirm(s => !s)} className="auth-input-toggle">
 {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
 </button>
 </div>
 </div>

 <button type="submit" className="auth-submit" disabled={loading}>
 {loading ? 'Se salvează...' : 'Salvează parola nouă'}
 {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
 </button>
 </form>
 </div>
 </div>
 </div>
 )
}

export default ResetPasswordPage
