import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobs, searchJobs, Job } from '../services/jobs'

const Jobs: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  const [filters, setFilters] = useState({
    region: '',
    salary: [0, 1000000],
    category: '',
    level: '',
    type: ''
  })

  useEffect(() => {
    const search = new URLSearchParams(window.location.search).get('search')
    if (search) {
      setSearchTerm(search)
      setDebouncedSearch(search)
    }
  }, [])

  // Debounce search term to prevent spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: jobsResult, isLoading, error } = useQuery({
    queryKey: ['jobs', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.trim() === '') {
        // Fallback to getting top recent jobs if no search
        return await getJobs()
      } else {
        const result = await searchJobs({ q: debouncedSearch, limit: 200 })
        return result.items || []
      }
    },
  })

  // We still do region filtering client side simply because region uses a localized list
  // However, the text search is now correctly dispatched to the backend.
  const filteredJobs = (jobsResult || []).filter((job: Job) => {
    const matchRegion = !filters.region || (job.location || '').toLowerCase().includes(filters.region.toLowerCase())
    return matchRegion
  })

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px', color: 'var(--text-primary)', transition: 'background 0.3s ease, color 0.3s ease' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>{t('jobs.title')}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { code: 'en', flagUrl: 'https://flagcdn.com/w40/gb.png' },
              { code: 'ru', flagUrl: 'https://flagcdn.com/w40/ru.png' },
              { code: 'hy', flagUrl: 'https://flagcdn.com/w40/am.png' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  padding: '8px 16px',
                  background: i18n.language === lang.code ? '#667eea' : 'var(--bg-secondary)',
                  color: i18n.language === lang.code ? '#fff' : 'var(--text-primary)',
                  border: '2px solid #667eea',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <img
                  src={lang.flagUrl}
                  alt={lang.code}
                  style={{ width: '18px', height: '12px', borderRadius: '1px', objectFit: 'cover' }}
                />
                <span>{lang.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow)', color: 'var(--text-primary)' }}>
          <input
            type="text"
            placeholder={t('jobs.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              marginBottom: '16px',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                {t('jobs.region')}
              </label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">All Regions</option>
                {Object.entries(t('jobs.regions', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                {t('jobs.category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">All Categories</option>
                {Object.entries(t('jobs.categories', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                {t('jobs.level')}
              </label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">All Levels</option>
                {Object.entries(t('jobs.levels', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                {t('jobs.type')}
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">All Types</option>
                {Object.entries(t('jobs.types', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                {t('jobs.salary')}
              </label>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={filters.salary[1]}
                onChange={(e) => setFilters({ ...filters, salary: [0, parseInt(e.target.value)] })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Max: {filters.salary[1].toLocaleString()} AMD
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {isLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>{t('jobs.loading') || 'Loading jobs...'}</p>
            </div>
          ) : error ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>{t('jobs.error') || 'Error loading jobs'}</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow)'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#667eea' }}>{job.title}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {job.company}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {job.location && (
                      <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        📍 {job.location}
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#667eea' }}>
                    {job.salary_range || 'Salary not specified'}
                  </span>
                  <button
                    style={{
                      padding: '6px 14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12px',
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {t('jobs.viewDetails') || 'View Details'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{t('jobs.noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Jobs
