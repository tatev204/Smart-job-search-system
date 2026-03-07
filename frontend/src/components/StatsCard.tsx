import React from 'react'

const StatsCard: React.FC<{
  icon: string
  title: string
  value: string | number
  description?: string
}> = ({ icon, title, value, description }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{
        margin: '0 0 8px 0',
        color: '#333',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#667eea'
      }}>
        {value}
      </p>
      {description && (
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#999'
        }}>
          {description}
        </p>
      )}
    </div>
  )
}

export default StatsCard

