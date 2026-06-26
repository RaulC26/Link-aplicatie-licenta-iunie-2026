import { useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import { isLoggedIn } from '../utils/auth'

function ProtectedRoute({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
    }
  }, []) 

  
  if (!isLoggedIn()) {
    return null 
  }

  return children
}

export default ProtectedRoute
