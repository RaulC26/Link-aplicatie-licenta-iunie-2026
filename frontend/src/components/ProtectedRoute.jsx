// Importăm useEffect pentru a rula codul de verificare după randare
import { useEffect } from 'react'

// useNavigate = hook pentru navigare prin cod (fără click)
import { useNavigate } from 'react-router-dom'

import { isLoggedIn } from '../utils/auth'

// Primește "children" = conținutul paginii protejate (ex: <MyBookingsPage />)
function ProtectedRoute({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    // Dacă userul NU e logat, îl trimitem la pagina de login
    if (!isLoggedIn()) {
      navigate('/login')
    }
  }, []) // rulează o singură dată la încărcare

  // Dacă e logat, afișăm pagina normală
  // Dacă nu e logat, useEffect de mai sus îl redirecționează
  if (!isLoggedIn()) {
    return null // nu afișăm nimic în timp ce navigăm
  }

  return children
}

export default ProtectedRoute
