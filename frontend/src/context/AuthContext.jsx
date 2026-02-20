import { createContext, useContext, useEffect, useState } from 'react'
import API from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    API.get('/me')
      .then((res) => {
        if (mounted) setUser(res.data.user)
      })
      .catch(() => setUser(null))
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  const login = async (credentials) => {
    const res = await API.post('/login', credentials)
    setUser(res.data.user)
    return res
  }

  const register = async (data) => {
    const res = await API.post('/register', data)
    setUser(res.data.user)
    return res
  }

  const logout = async () => {
    try {
      await API.post('/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
