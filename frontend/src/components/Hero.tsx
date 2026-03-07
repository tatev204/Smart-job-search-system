import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Hero: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '80px 32px',
      color: 'white',
      textAlign: 'center',
      marginBottom: '40px',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      backgroundSize: '60px 60px'
    }}>
      <h1 style={{
        fontSize: '56px',
        fontWeight: '700',
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        {t('home.hero.title')}
      </h1>
      <p style={{
        fontSize: '20px',
        marginBottom: '32px',
        opacity: 0.95,
        maxWidth: '600px',
        margin: '0 auto 32px auto',
        lineHeight: '1.6'
      }}>
        {t('home.hero.description')}
      </p>
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Link to="/upload" style={{
          padding: '12px 32px',
          background: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          display: 'inline-block',
          fontSize: '16px'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t('home.hero.uploadBtn')}
        </Link>
        <a href="/jobs" style={{
          padding: '12px 32px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          border: '2px solid white',
          transition: 'all 0.3s ease',
          display: 'inline-block',
          fontSize: '16px',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {t('home.hero.browseBtn')}
        </a>
      </div>
    </div>
  )
}

export default Hero

