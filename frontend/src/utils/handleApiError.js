import { removeToken } from './auth'

// Centralizare tratare erori - mesaje consistente pentru user
// Primește response-ul fetch și returnează un mesaj în română
async function handleApiError(response) {
  // Edge case: eroare de rețea (serverul offline) - response e null/undefined
  if (!response) {
    return 'Eroare de conexiune. Verifică că serverul rulează.'
  }

  // Edge case: 401 = token expirat sau invalid → delogăm și redirectăm la login
  if (response.status === 401) {
    removeToken()
    // Adăugăm ?expired=true în URL ca LoginForm să afișeze mesajul potrivit
    window.location.href = '/login?expired=true'
    return 'Sesiunea a expirat. Te rugăm să te loghezi din nou.'
  }

  // Edge case: 403 = acces interzis (ex: încerci să plătești rezervarea altuia)
  if (response.status === 403) {
    return 'Nu ai permisiunea să efectuezi această acțiune.'
  }

  // Edge case: 404 = resursa nu există
  if (response.status === 404) {
    return 'Resursa căutată nu a fost găsită.'
  }

  // Edge case: 500 = eroare internă de server
  if (response.status >= 500) {
    return 'Eroare de server. Încearcă din nou mai târziu.'
  }

  // Altfel: încercăm să citim mesajul din body-ul răspunsului
  try {
    const data = await response.json()
    return data.mesaj || 'A apărut o eroare neașteptată.'
  } catch {
    return 'A apărut o eroare neașteptată.'
  }
}

export default handleApiError
