import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
    { code: 'ru', label: 'Русский', flagUrl: 'https://flagcdn.com/w40/ru.png' },
    { code: 'hy', label: 'Հայերեն', flagUrl: 'https://flagcdn.com/w40/am.png' }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid white',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <img
          src={currentLanguage.flagUrl}
          alt={currentLanguage.code}
          style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
        />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <span style={{ fontSize: '10px', marginLeft: '2px' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '140px',
          marginTop: '4px',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: i18n.language === lang.code ? '600' : '400',
                color: i18n.language === lang.code ? '#667eea' : '#333',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.3s ease',
                borderBottom: lang.code !== 'hy' ? '1px solid #f0f0f0' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <img
                src={lang.flagUrl}
                alt={lang.code}
                style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
              />
              <span>{lang.label}</span>
              {i18n.language === lang.code && (
                <span style={{ marginLeft: 'auto', color: '#667eea' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default LanguageSwitcher
