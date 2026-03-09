import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobs, Job } from '../services/jobs'

const HotJobs: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: jobsData = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  })

  // Take first 3 jobs as "hot" ones for now, as there is no "hot" flag in DB yet
  const hotJobs = jobsData.slice(0, 3)

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (hotJobs.length === 0) {
    return null
  }

  return (
    <div style={{ padding: '60px 20px', background: 'var(--bg-tertiary)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {t('home.hotJobs.title')}
          </h2>
          <button
            onClick={() => navigate('/jobs')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#667eea'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#667eea'
            }}
          >
            {t('home.hotJobs.viewMore')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {hotJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
                e.currentTarget.style.borderColor = '#667eea'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: '#667eea', fontSize: '18px', fontWeight: '600' }}>{job.title}</h3>
                  <span style={{
                    background: '#fff3e0',
                    color: '#ff9800',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    HOT
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                  {job.company}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {job.location}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#764ba2', fontWeight: '700', fontSize: '15px' }}>
                  {job.salary_range || 'Not specified'}
                </span>
                <span style={{ color: '#667eea', fontSize: '13px', fontWeight: '600' }}>
                  {t('jobCard.viewDetails')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HotJobs
