import React, { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VacancyList from './pages/VacancyList'
import Jobs from './pages/Jobs'
import VacancyDetail from './pages/VacancyDetail'
import UploadResume from './pages/UploadResume'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { useAuth } from './contexts/AuthContext'
import LanguageSwitcher from './components/LanguageSwitcher'

const App: React.FC = () => {
  const auth = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <div className="app-header-left">
          <h1 style={{ margin: 0 }}><Link to="/">💼 MyJobs</Link></h1>
          <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/">{t('header.jobs')}</Link>
            <Link to="/upload">{t('header.uploadCV')}</Link>
          </nav>
        </div>

        <div className="app-header-right">
          <LanguageSwitcher />
          {auth.token ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                👤 {auth.firstName}
              </button>

              {/* Dropdown меню */}
              {profileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  minWidth: '200px',
                  marginTop: '8px',
                  zIndex: 1000
                }}>
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      fontWeight: 500,
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    👤 {t('profile.title')}
                  </Link>
                  <button
                    onClick={() => {
                      auth.logout()
                      setProfileMenuOpen(false)
                      window.location.href = '/login'
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      color: '#c62828',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#ffebee'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('profile.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">{t('header.login')}</Link>
              <Link to="/register">{t('header.register') || 'Register'}</Link>
            </>
          )}
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<VacancyList />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<VacancyDetail />} />
          <Route path="/upload" element={<UploadResume />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
