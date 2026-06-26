import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, Check, X as XIcon } from 'lucide-react'
import { API_URL } from '../utils/api'

function validatePassword(pw) {
 return {
 length: pw.length >= 8,
 uppercase: /[A-Z]/.test(pw),
 digit: /[0-9]/.test(pw),
 special: /[^A-Za-z0-9]/.test(pw)
 }
}

function RegisterForm() {
 const [name, setName] = useState('')
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [phone, setPhone] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [loading, setLoading] = useState(false)

 const navigate = useNavigate()
 const pwRules = validatePassword(password)
 const allRulesValid = Object.values(pwRules).every(Boolean)

 function handlePhoneChange(e) {
 const digitsOnly = e.target.value.replace(/[^0-9]/g, '')
 if (digitsOnly.length <= 10) setPhone(digitsOnly)
 }

 async function handleSubmit(e) {
 e.preventDefault()
 setError(''); setSuccess('')

 if (loading) return


 if (!name || !email || !password) { setError('Numele, emailul și parola sunt obligatorii.'); return }

 const numeRegex = /^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/
 if (name.trim().length < 2) { setError('Numele trebuie să aibă minim 2 caractere.'); return }
 if (!numeRegex.test(name.trim())) { setError('Numele trebuie să conțină doar litere.'); return }

 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 if (!emailRegex.test(email)) { setError('Format email invalid.'); return }

 if (!allRulesValid) {
 setError('Parola nu îndeplinește toate cerințele de securitate.')
 return
 }

 if (phone.trim() !== '') {
 if (!/^07[0-9]{8}$/.test(phone)) {
 setError('Numărul de telefon trebuie să aibă 10 cifre și să înceapă cu 07 (ex: 0712345678).')
 return
 }
 }

 setLoading(true)
 try {
 const response = await fetch(API_URL + '/auth/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ name, email, password, phone: phone.trim() || undefined })
 })
 const data = await response.json()

 if (!response.ok) { setError(data.mesaj || 'Eroare la înregistrare.'); return }

 setSuccess('Cont creat cu succes! Te redirecționăm la login...')
 setTimeout(() => navigate('/login'), 2000)
 } catch {
 setError('Eroare conexiune. Verifică serverul.')
 } finally {
 setLoading(false)
 }
 }

 return (
 <form onSubmit={handleSubmit}>

 {error && <div className="error" style={{ marginBottom: '16px' }}> {error}</div>}
 {success && <div className="success" style={{ marginBottom: '16px' }}> {success}</div>}

 <div className="auth-input-group">
 <label>Nume complet</label>
 <div className="auth-input-wrapper">
 <User size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type="text"
 className="auth-input"
 value={name}
 onChange={e => setName(e.target.value)}
 placeholder="Ion Popescu"
 />
 </div>
 </div>

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
 />
 </div>
 </div>

 <div className="auth-input-group">
 <label>Parolă</label>
 <div className="auth-input-wrapper">
 <Lock size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type={showPassword ? 'text' : 'password'}
 className="auth-input"
 value={password}
 onChange={e => setPassword(e.target.value)}
 placeholder="Minim 8 caractere, 1 mare, 1 cifră, 1 simbol"
 style={{ paddingRight: '42px' }}
 />
 <button
 type="button"
 onClick={() => setShowPassword(s => !s)}
 className="auth-input-toggle"
 aria-label={showPassword ? 'Ascunde parola' : 'Afișează parola'}
 >
 {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
 </button>
 </div>

 {password && (
 <ul className="password-rules">
 <li className={pwRules.length ? 'rule-ok' : 'rule-bad'}>
 {pwRules.length ? <Check size={13} /> : <XIcon size={13} />} Minim 8 caractere
 </li>
 <li className={pwRules.uppercase ? 'rule-ok' : 'rule-bad'}>
 {pwRules.uppercase ? <Check size={13} /> : <XIcon size={13} />} Cel puțin o literă mare (A-Z)
 </li>
 <li className={pwRules.digit ? 'rule-ok' : 'rule-bad'}>
 {pwRules.digit ? <Check size={13} /> : <XIcon size={13} />} Cel puțin o cifră (0-9)
 </li>
 <li className={pwRules.special ? 'rule-ok' : 'rule-bad'}>
 {pwRules.special ? <Check size={13} /> : <XIcon size={13} />} Cel puțin un simbol (!@#$ etc.)
 </li>
 </ul>
 )}
 </div>

 <div className="auth-input-group">
 <label>Telefon <span className="auth-optional">(opțional)</span></label>
 <div className="auth-input-wrapper">
 <Phone size={17} strokeWidth={2} className="auth-input-icon" />
 <input
 type="tel"
 className="auth-input"
 value={phone}
 onChange={handlePhoneChange}
 placeholder="07xxxxxxxx (10 cifre)"
 maxLength={10}
 inputMode="numeric"
 />
 </div>
 {phone && phone.length > 0 && phone.length < 10 && (
 <small style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
 Mai trebuie {10 - phone.length} {10 - phone.length === 1 ? 'cifră' : 'cifre'}
 </small>
 )}
 </div>

 <button type="submit" className="auth-submit" disabled={loading}>
 {loading ? 'Se creează contul...' : 'Creează cont gratuit'}
 {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
 </button>

 <div className="auth-swap">Ai deja cont?{' '}
 <Link to="/login">Autentifică-te</Link>
 </div>
 </form>
 )
}

export default RegisterForm
