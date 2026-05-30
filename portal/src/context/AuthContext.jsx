import { createContext, useContext, useState, useEffect } from 'react'
import API from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('krishiai_portal_token')
    const saved = localStorage.getItem('krishiai_portal_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      API.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (phone, password) => {
    const { data } = await API.post('/auth/login', { phone, password })
    // Only allow non-farmer roles
    if (data.user.role === 'farmer')
      throw new Error('This portal is for Companies, Transporters and Insurance providers only. Farmers please use the main app.')
    localStorage.setItem('krishiai_portal_token', data.token)
    localStorage.setItem('krishiai_portal_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData)
    localStorage.setItem('krishiai_portal_token', data.token)
    localStorage.setItem('krishiai_portal_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('krishiai_portal_token')
    localStorage.removeItem('krishiai_portal_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
