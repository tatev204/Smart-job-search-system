import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Profession {
  id: string
  title: string
  field: string
  demandLevel: number
  salaryRange: string
  description: string
}

const ProfessionsSection: React.FC = () => {
  const { t } = useTranslation()
  const [selectedField, setSelectedField] = useState<string>('all')

  const professions: Profession[] = [
    {
      id: '1',
      title: 'Full Stack Developer',
      field: 'technology',
      demandLevel: 95,
      salaryRange: '$100K - $150K',
      description: 'Web and mobile application development'
    },
    {
      id: '2',
      title: 'Data Scientist',
      field: 'technology',
      demandLevel: 92,
      salaryRange: '$120K - $160K',
      description: 'Data analysis and machine learning'
    },
    {
      id: '3',
      title: 'Cloud Architect',
      field: 'technology',
      demandLevel: 90,
      salaryRange: '$130K - $170K',
      description: 'Cloud infrastructure design'
    },
    {
      id: '4',
      title: 'Medical Doctor',
      field: 'healthcare',
      demandLevel: 88,
      salaryRange: '$80K - $200K+',
      description: 'Patient care and diagnosis'
    },
    {
      id: '5',
      title: 'Nurse',
      field: 'healthcare',
      demandLevel: 85,
      salaryRange: '$50K - $90K',
      description: 'Patient support and care'
    },
    {
      id: '6',
      title: 'Financial Analyst',
      field: 'finance',
      demandLevel: 87,
      salaryRange: '$70K - $120K',
      description: 'Financial planning and analysis'
    },
    {
      id: '7',
      title: 'Marketing Manager',
      field: 'marketing',
      demandLevel: 84,
      salaryRange: '$60K - $110K',
      description: 'Marketing campaigns and strategy'
    },
    {
      id: '8',
      title: 'Software Engineer',
      field: 'engineering',
      demandLevel: 93,
      salaryRange: '$90K - $140K',
      description: 'System design and development'
    }
  ]

  const fields = [
    { id: 'all', label: t('home.professions.allFields') },
    { id: 'technology', label: t('home.professions.fields.technology') },
    { id: 'healthcare', label: t('home.professions.fields.healthcare') },
    { id: 'finance', label: t('home.professions.fields.finance') },
    { id: 'marketing', label: t('home.professions.fields.marketing') },
    { id: 'engineering', label: t('home.professions.fields.engineering') }
  ]

  const filtered = selectedField === 'all'
    ? professions
    : professions.filter(p => p.field === selectedField)

  return (
    <div style={{
      padding: '60px 20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#333',
          textAlign: 'center'
        }}>
          {t('home.professions.title')}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          textAlign: 'center',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px auto'
        }}>
          Изучите наиболее востребованные профессии в различных областях
        </p>

        {/* Field Filter */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {fields.map((field) => (
            <button
              key={field.id}
              onClick={() => setSelectedField(field.id)}
              style={{
                padding: '10px 20px',
                background: selectedField === field.id
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'white',
                color: selectedField === field.id ? 'white' : '#333',
                border: selectedField === field.id ? 'none' : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (selectedField !== field.id) {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.background = '#f8f9ff'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedField !== field.id) {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              {field.label}
            </button>
          ))}
        </div>

        {/* Professions Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map((profession) => (
            <div
              key={profession.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{
                margin: '0 0 8px 0',
                color: '#667eea',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {profession.title}
              </h3>
              <p style={{
                margin: '0 0 12px 0',
                color: '#999',
                fontSize: '14px'
              }}>
                {profession.description}
              </p>

              {/* Demand Level */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <span>Спрос</span>
                  <span>{profession.demandLevel}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${profession.demandLevel}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <p style={{
                margin: '0',
                color: '#764ba2',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                💰 {profession.salaryRange}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfessionsSection

