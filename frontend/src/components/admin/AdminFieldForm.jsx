import { useState, useEffect } from 'react'
import { API_URL } from '../../utils/api'
import { getToken } from '../../utils/auth'
import ErrorMessage from '../ErrorMessage'

function AdminFieldForm({ field, onSuccess, onCancel }) {
 const [name, setName] = useState('')
 const [location, setLocation] = useState('')
 const [description, setDescription] = useState('')
 const [pricePerHour, setPricePerHour] = useState('')
 const [imageUrl, setImageUrl] = useState('')

 const [latitude, setLatitude] = useState('')
 const [longitude, setLongitude] = useState('')
 const [geocodeLoading, setGeocodeLoading] = useState(false)
 const [geocodeMsg, setGeocodeMsg] = useState('') 

 const [error, setError] = useState('')
 const [loading, setLoading] = useState(false)

 useEffect(() => {
 if (field) {
 setName(field.name || '')
 setLocation(field.location || '')
 setDescription(field.description || '')
 setPricePerHour(field.price_per_hour || '')
 setImageUrl(field.image_url || '')
 setLatitude(field.latitude != null ? String(field.latitude) : '')
 setLongitude(field.longitude != null ? String(field.longitude) : '')
 }
 }, [field])

 async function handleGeocode() {
 const adresa = location.trim()
 if (!adresa) {
 setGeocodeMsg(' Completează mai întâi câmpul Locație.')
 return
 }

 setGeocodeLoading(true)
 setGeocodeMsg('')

 try {
 const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresa)}&format=json&limit=1`
 const res = await fetch(url, {
 headers: { 'User-Agent': 'TerenuriFotbalApp/1.0' }
 })
 const data = await res.json()

 if (!data || data.length === 0) {
 setGeocodeMsg(' Adresa nu a fost găsită. Încearcă mai specific (ex: "Str. X, Cluj-Napoca, România").')
 return
 }

 const lat = parseFloat(data[0].lat)
 const lng = parseFloat(data[0].lon)
 setLatitude(String(lat))
 setLongitude(String(lng))
 setGeocodeMsg(` Coordonate detectate: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)

 } catch {
 setGeocodeMsg(' Eroare conexiune. Verifică internetul.')
 } finally {
 setGeocodeLoading(false)
 }
 }

 async function handleSubmit(e) {
 e.preventDefault()
 setError('')

 if (!name.trim() || !location.trim() || !pricePerHour) {
 setError('Numele, locația și prețul sunt obligatorii.')
 return
 }
 if (name.trim().length < 3) {
 setError('Numele trebuie să aibă minim 3 caractere.')
 return
 }
 const price = parseFloat(pricePerHour)
 if (isNaN(price) || price <= 0) {
 setError('Prețul trebuie să fie un număr pozitiv.')
 return
 }
 if (imageUrl.trim() && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
 setError('URL-ul imaginii trebuie să înceapă cu http:// sau https://')
 return
 }

 let latVal = null
 let lngVal = null
 if (latitude.trim() !== '') {
 latVal = parseFloat(latitude)
 if (isNaN(latVal) || latVal < -90 || latVal > 90) {
 setError('Latitudinea trebuie să fie între -90 și 90.')
 return
 }
 }
 if (longitude.trim() !== '') {
 lngVal = parseFloat(longitude)
 if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
 setError('Longitudinea trebuie să fie între -180 și 180.')
 return
 }
 }

 setLoading(true)

 try {
 const url = field
 ? API_URL + '/admin/fields/' + field.id
 : API_URL + '/admin/fields'
 const method = field ? 'PUT' : 'POST'

 const response = await fetch(url, {
 method,
 headers: {
 'Content-Type': 'application/json',
 'Authorization': 'Bearer ' + getToken()
 },
 body: JSON.stringify({
 name: name.trim(),
 location: location.trim(),
 description: description.trim() || null,
 price_per_hour: price,
 image_url: imageUrl.trim() || null,
 latitude: latVal, 
 longitude: lngVal 
 })
 })

 const data = await response.json()
 if (!response.ok) {
 setError(data.mesaj || 'Eroare la salvare.')
 return
 }

 onSuccess()

 } catch {
 setError('Eroare conexiune. Verifică serverul.')
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="admin-form-container">
 <h3>{field ? 'Editează teren' : 'Adaugă teren nou'}</h3>

 <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '560px' }}>
 {error && <ErrorMessage message={error} />}

 <label>Nume *</label>
 <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Teren Central" />

 <label>Locație *</label>
 <input
 value={location}
 onChange={e => { setLocation(e.target.value); setGeocodeMsg('') }}
 placeholder="ex: Str. Sportului 1, Cluj-Napoca"
 />

 <label>Descriere</label>
 <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descriere scurtă" />

 <label>Preț / oră (lei) *</label>
 <input type="number" min="1" step="0.01" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} placeholder="ex: 150" />

 <label>URL imagine (opțional)</label>
 <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />

 <div className="map-coords-section">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
 <label style={{ margin: 0 }}>Locație pe hartă (opțional)</label>
 <button
 type="button"
 className="btn-geocode"
 onClick={handleGeocode}
 disabled={geocodeLoading}
 >
 {geocodeLoading ? ' Se caută...' : ' Detectează din adresă'}
 </button>
 </div>

 {geocodeMsg && (
 <p style={{
 fontSize: '0.83rem',
 marginBottom: '10px',
 color: geocodeMsg.startsWith('') ? '#16a34a' : '#dc2626'
 }}>
 {geocodeMsg}
 </p>
 )}

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
 <div>
 <label style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Latitudine</label>
 <input
 type="number"
 step="any"
 value={latitude}
 onChange={e => setLatitude(e.target.value)}
 placeholder="ex: 46.7712"
 />
 </div>
 <div>
 <label style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Longitudine</label>
 <input
 type="number"
 step="any"
 value={longitude}
 onChange={e => setLongitude(e.target.value)}
 placeholder="ex: 23.6236"
 />
 </div>
 </div>
 <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Lasă gol dacă nu vrei să afișezi harta. Folosește "Detectează din adresă" pentru completare automată.
 </small>
 </div>

 <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
 <button type="submit" className="btn-primary" disabled={loading}>
 {loading ? 'Se salvează...' : (field ? 'Salvează modificările' : 'Adaugă terenul')}
 </button>
 <button type="button" className="btn-danger" onClick={onCancel}>Anulează
 </button>
 </div>
 </form>
 </div>
 )
}

export default AdminFieldForm
