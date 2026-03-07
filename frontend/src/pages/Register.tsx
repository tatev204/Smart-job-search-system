import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await auth.register(firstName, lastName, email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', marginTop: '60px' }}>
      <div className="upload-page">
        <h2 style={{ textAlign: 'center' }}>📝 {t('header.register') || 'Register'}</h2>
        <form onSubmit={submit}>
          <div>
            <label htmlFor="firstName">First Name</label>
            <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        {error && <div className="message error" style={{ marginTop: '16px' }}>{String(error)}</div>}
      </div>
    </div>
  )
}

export default Register

