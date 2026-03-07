import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

const Login: React.FC = () => {
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
      await auth.login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', marginTop: '60px' }}>
      <div className="upload-page" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--text-primary)' }}>🔐 {t('login.title')}</h2>
        <form onSubmit={submit}>
          <div>
            <label htmlFor="email" style={{ color: 'var(--text-primary)' }}>{t('login.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: `2px solid var(--border-color)`
              }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ color: 'var(--text-primary)' }}>{t('login.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                border: `2px solid var(--border-color)`
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ background: 'var(--button-primary)' }}>
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a
            href="#"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            {t('login.forgotPassword')}
          </a>
        </div>
        {error && (
          <div className="message error" style={{ marginTop: '16px', background: '#ffebee', color: '#c62828' }}>
            ❌ {String(error)}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
