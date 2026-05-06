import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

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
    const navigate = useNavigate()
    const [selectedField, setSelectedField] = useState<string>('all')
    const [activeProfession, setActiveProfession] = useState<Profession | null>(null)

    const professions: Profession[] = [
        { id: '1', title: 'Full Stack Developer', field: 'technology', demandLevel: 95, salaryRange: '$100K - $150K', description: 'Web and mobile application development' },
        { id: '2', title: 'Data Scientist', field: 'technology', demandLevel: 92, salaryRange: '$120K - $160K', description: 'Data analysis and machine learning' },
        { id: '8', title: 'Software Engineer', field: 'engineering', demandLevel: 93, salaryRange: '$90K - $140K', description: 'System design and development' }
    ]

    const fields = [
        { id: 'all', label: t('home.professions.allFields') },
        { id: 'technology', label: t('home.professions.fields.technology') },
        { id: 'healthcare', label: t('home.professions.fields.healthcare') }
    ]

    const filtered = selectedField === 'all' ? professions : professions.filter(p => p.field === selectedField)

    return (
        <div style={{
            padding: '60px 20px',
            background: '#fdfbf7', // Ուղղված է՝ հեռացվել է գրադիենտը[cite: 15]
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#333', textAlign: 'center' }}>
                    {t('home.professions.title')}
                </h2>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {fields.map((field) => (
                        <button
                            key={field.id}
                            onClick={() => setSelectedField(field.id)}
                            style={{
                                padding: '10px 20px',
                                background: selectedField === field.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                color: selectedField === field.id ? 'white' : '#333',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {field.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filtered.map((profession) => (
                        <div
                            key={profession.id}
                            style={{
                                background: 'white', // Քարտերը մնում են սպիտակ՝ ֆոնից տարբերվելու համար[cite: 15]
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '18px' }}>{profession.title}</h3>
                            <p style={{ margin: '0 0 12px 0', color: '#999', fontSize: '14px' }}>{profession.description}</p>
                            <p style={{ margin: '0', color: '#764ba2', fontWeight: '600' }}>💰 {profession.salaryRange}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProfessionsSection