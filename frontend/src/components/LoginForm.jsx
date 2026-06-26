import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
// Icoane Lucide pentru câmpurile de input — mai curate decât emoji
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { API_URL } from '../utils/api'
import { saveToken } from '../utils/auth'

function LoginForm() {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)

 const navigate = useNavigate()
 const [searchParams] = useSearchParams()

 // Edge case: sesiunea a expirat → mesaj specific diferit de eroarea de login
 const isExpired = searchParams.get('expired') === 'true'

 async function handleSubmit(e) {
 e.preventDefault()
 setError('')

 if (!email || !password) {
 setError('Completează emailul și parola.')
 return
 }

 setLoading(true)
 try {
 const response = await fetch(API_URL + '/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password })
 })
 const data = await response.json()

 // Edge case: 401 separat pentru mesaj mai clar de credențiale greșite
 if (response.status === 401) { setError('Email sau parolă incorectă.'); return }
 if (!response.ok) { setError(data.mesaj || 'Eroare la autentificare.'); return }

 saveToken(data.token)
 navigate('/')
 window.location.reload()
 } catch {
 setError('Eroare conexiune. Verifică serverul.')
 } finally {
 setLoading(false)
 }
 }

 return (
 <form onSubmit={handleSubmit}>

 {/* Mesaj sesiune expirată — apare când user vine de pe o rută protejată */}
 {isExpired && (
 <div className="auth-expired-msg">Sesiunea ta a expirat. Te rugăm să te autentifici din nou.
 </div>
 )}

 {/* Mesaj eroare login */}
 {error && (
 <div className="error" style={{ marginBottom: '20px' }}>
 {error}
 </div>
 )}

 {/* Câmp email cu iconița Mail din Lucide */}
 <div className="auth-input-group">
 <label>Adresă email</label>
 <div className="auth-input-wrapper">
 <Mail size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type="email"
 className="auth-input"
 value={email}
 onChange={e => setEmail(e.target.value)}
 placeholder="exemplu@email.com"
 autoFocus
 />
 </div>
 </div>

 {/* Câmp parolă cu iconița Lock din Lucide + toggle ochi */}
 <div className="auth-input-group">
 <label>Parolă</label>
 <div className="auth-input-wrapper">
 <Lock size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type={showPassword ? 'text' : 'password'}
 className="auth-input"
 value={password}
 onChange={e => setPassword(e.target.value)}
 placeholder="Parola ta"
 style={{ paddingRight: '42px' }}
 />
 <button
 type="button"
 onClick={() => setShowPassword(s => !s)}
 className="auth-input-toggle"
 aria-label={showPassword ? 'Ascunde parola' : 'Afișează parola'}
 title={showPassword ? 'Ascunde parola' : 'Afișează parola'}
 >
 {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
 </button>
 </div>
 </div>

 {/* Link resetare parola */}
 <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '16px' }}>
 <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--green-dark)', fontWeight: 600 }}>
 Ai uitat parola?
 </Link>
 </div>

 <button type="submit" className="auth-submit" disabled={loading}>
 {loading ? (
 <>
 {/* Spinner CSS animat în timp ce se verifică credențialele */}
 <span style={{
 width: 16, height: 16,
 border: '2px solid rgba(255,255,255,0.4)',
 borderTopColor: '#fff',
 borderRadius: '50%',
 display: 'inline-block',
 animation: 'spin 0.7s linear infinite'
 }} />Se verifică...
 </>
 ) : (
 <>Intră în cont
 <ArrowRight size={16} strokeWidth={2.5} />
 </>
 )}
 </button>

 <div className="auth-swap">Nu ai cont?{' '}
 <Link to="/register">Înregistrează-te gratuit</Link>
 </div>
 </form>
 )
}

export default LoginForm
