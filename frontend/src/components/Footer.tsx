import React from 'react'
import { useTranslation } from 'react-i18next'

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer style={{
      background: '#0f172a',
      color: '#fff',
      padding: '40px 20px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '32px',
        marginBottom: '32px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>
            💼 Diplomayin
          </h3>
          <p style={{
            margin: '0',
            color: '#999',
            lineHeight: '1.6',
            fontSize: '14px'
          }}>
            {t('home.footer.description')}
          </p>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
            Quick Links
          </h4>
          <ul style={{
            margin: '0',
            padding: '0',
            listStyle: 'none'
          }}>
            <li style={{ marginBottom: '8px' }}>
              <a href="#" style={{ color: '#999', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                Browse Jobs
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a href="#" style={{ color: '#999', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                Upload CV
              </a>
            </li>
            <li>
              <a href="#" style={{ color: '#999', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
            Follow Us
          </h4>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="#" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              color: '#fff',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              f
            </a>
            <a href="#" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              color: '#fff',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              𝕏
            </a>
            <a href="#" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              color: '#fff',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              in
            </a>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '24px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        {t('home.footer.copyright')}
      </div>
    </footer>
  )
}

export default Footer

