import React from 'react'

const LoadingSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      padding: '0'
    }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          <div style={{
            height: '24px',
            background: '#e0e0e0',
            borderRadius: '6px',
            marginBottom: '12px'
          }} />
          <div style={{
            height: '16px',
            background: '#f0f0f0',
            borderRadius: '6px',
            marginBottom: '12px'
          }} />
          <div style={{
            height: '16px',
            background: '#f0f0f0',
            borderRadius: '6px',
            marginBottom: '12px',
            width: '80%'
          }} />
          <div style={{
            height: '60px',
            background: '#f0f0f0',
            borderRadius: '6px',
            marginTop: '16px'
          }} />
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default LoadingSkeleton

