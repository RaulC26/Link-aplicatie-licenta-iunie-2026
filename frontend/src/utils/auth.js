// Funcții helper pentru gestionarea autentificării
// Toate lucrează cu localStorage - "cutia" browserului unde ținem token-ul

// Salvează token-ul în localStorage după login
export function saveToken(token) {
  localStorage.setItem('token', token)
}

// Returnează token-ul salvat, sau null dacă nu există
export function getToken() {
  return localStorage.getItem('token')
}

// Șterge token-ul din localStorage la logout
export function removeToken() {
  localStorage.removeItem('token')
}

// Returnează true dacă userul e logat (există token), false dacă nu
export function isLoggedIn() {
  return getToken() !== null
}

// Returnează true dacă userul logat are rolul 'admin'
export function isAdmin() {
  const user = getUserFromToken()
  return user !== null && user.role === 'admin'
}

// Returnează prenumele (primul cuvant) din numele complet salvat în token
// Edge case: tokenuri mai vechi nu au câmpul name; folosim partea de dinainte de @ din email
export function getFirstName() {
  const user = getUserFromToken()
  if (!user) return ''
  if (user.name && user.name.trim()) return user.name.trim().split(' ')[0]
  if (user.email) return user.email.split('@')[0]
  return ''
}

// Decodează payload-ul din token JWT și returnează datele userului
// Un JWT are 3 părți separate prin punct: header.payload.signature
// Payload-ul e encodat în base64 și conține userId, email etc.
export function getUserFromToken() {
  const token = getToken()
  if (!token) return null

  try {
    // Luăm partea din mijloc (index 1) - aceea e payload-ul
    const payload = token.split('.')[1]

    // atob() decodează base64 → text JSON
    // JSON.parse() transformă textul JSON în obiect JavaScript
    const decoded = JSON.parse(atob(payload))

    return decoded
  } catch (eroare) {
    // Dacă token-ul e corupt sau invalid, returnăm null
    return null
  }
}
