import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, register as apiRegister } from '../services/auth'

type AuthContextType = {
  token: string | null
  userId: number | null
  userEmail: string | null
  firstName: string | null
  lastName: string | null
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      const uid = localStorage.getItem('user_id')
      const em = localStorage.getItem('user_email')
      const fn = localStorage.getItem('user_firstName')
      const ln = localStorage.getItem('user_lastName')
      if (t) setToken(t)
      if (uid) setUserId(Number(uid))
      if (em) setUserEmail(em)
      if (fn) setFirstName(fn)
      if (ln) setLastName(ln)
    } catch (e) {
      // ignore
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password)
    if (data?.token) {
      localStorage.setItem('token', data.token)
      if (data.user_id) localStorage.setItem('user_id', String(data.user_id))
      if (data.email) localStorage.setItem('user_email', data.email)
      setToken(data.token)
      setUserId(data.user_id ?? null)
      setUserEmail(data.email ?? null)
    }
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    // Call backend register endpoint
    await apiRegister(firstName, lastName, email, password)
    // After successful registration, automatically log in the user
    const data = await apiLogin(email, password)
    if (data?.token) {
      localStorage.setItem('token', data.token)
      if (data.user_id) localStorage.setItem('user_id', String(data.user_id))
      if (data.email) localStorage.setItem('user_email', data.email)
      setToken(data.token)
      setUserId(data.user_id ?? null)
      setUserEmail(data.email ?? null)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    setToken(null)
    setUserId(null)
    setUserEmail(null)
  }

  return (
    <AuthContext.Provider value={{ token, userId, userEmail, firstName, lastName, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
