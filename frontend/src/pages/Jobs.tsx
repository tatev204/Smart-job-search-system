import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface Job {
  id: number
  title: string
  company: string
  region: string
  salary: number
  category: string
  level: string
  type: string
  description: string
}

const Jobs: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    region: '',
    salary: [0, 500000],
    category: '',
    level: '',
    type: ''
  })

  const jobsData: Job[] = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp',
      region: 'yerevan',
      salary: 450000,
      category: 'it',
      level: 'senior',
      type: 'full_time',
      description: 'Looking for experienced React developer'
    },
    {
      id: 2,
      title: 'Marketing Manager',
      company: 'BrandCo',
      region: 'yerevan',
      salary: 350000,
      category: 'marketing',
      level: 'middle',
      type: 'full_time',
      description: 'Lead marketing initiatives'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignStudio',
      region: 'remote',
      salary: 380000,
      category: 'design',
      level: 'middle',
      type: 'full_time',
      description: 'Create beautiful user interfaces'
    },
    {
      id: 4,
      title: 'Sales Executive',
      company: 'SalesPro',
      region: 'gyumri',
      salary: 320000,
      category: 'sales',
      level: 'junior',
      type: 'full_time',
      description: 'Drive sales growth'
    },
    {
      id: 5,
      title: 'Junior Developer',
      company: 'StartupXYZ',
      region: 'yerevan',
      salary: 250000,
      category: 'it',
      level: 'junior',
      type: 'internship',
      description: 'Learn and grow with us'
    },
    {
      id: 6,
      title: 'Financial Analyst',
      company: 'FinanceHub',
      region: 'vagharshapat',
      salary: 400000,
      category: 'finance',
      level: 'middle',
      type: 'full_time',
      description: 'Analyze financial data'
    },
    {
      id: 7,
      title: 'HR Specialist',
      company: 'HRPro',
      region: 'remote',
      salary: 300000,
      category: 'hr',
      level: 'junior',
      type: 'part_time',
      description: 'Support HR operations'
    },
    {
      id: 8,
      title: 'Lead Backend Developer',
      company: 'CloudTech',
      region: 'yerevan',
      salary: 500000,
      category: 'it',
      level: 'lead',
      type: 'full_time',
      description: 'Lead backend architecture'
    }
  ]

  const filteredJobs = useMemo(() => {
    return jobsData.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRegion = !filters.region || job.region === filters.region
      const matchSalary = job.salary >= filters.salary[0] && job.salary <= filters.salary[1]
      const matchCategory = !filters.category || job.category === filters.category
      const matchLevel = !filters.level || job.level === filters.level
      const matchType = !filters.type || job.type === filters.type

      return matchSearch && matchRegion && matchSalary && matchCategory && matchLevel && matchType
    })
  }, [searchTerm, filters])

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px', color: 'var(--text-primary)', transition: 'background 0.3s ease, color 0.3s ease' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>{t('jobs.title')}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['en', 'ru', 'hy'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                style={{
                  padding: '8px 16px',
                  background: i18n.language === lang ? '#667eea' : 'var(--bg-secondary)',
                  color: i18n.language === lang ? '#fff' : 'var(--text-primary)',
                  border: '2px solid #667eea',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                {lang.toUpperCase()}
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
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
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
                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#667eea' }}>{job.title}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {job.company}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t(`jobs.regions.${job.region}`)}
                  </span>
                  <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t(`jobs.categories.${job.category}`)}
                  </span>
                  <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t(`jobs.levels.${job.level}`)}
                  </span>
                  <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {t(`jobs.types.${job.type}`)}
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{job.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#667eea' }}>
                    {job.salary.toLocaleString()} AMD
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
                    {t('jobs.apply')}
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
