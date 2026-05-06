import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getJobs } from '../services/jobs'

const HotJobs: React.FC = () => {
    const { t } = useTranslation()
    const { data: jobsData = [] } = useQuery({ queryKey: ['jobs'], queryFn: getJobs })
    const hotJobs = jobsData.slice(0, 3)

    return (
        /* Ֆոնը փոխված է #fdfbf7 */
        <div style={{ padding: '60px 20px', background: '#fdfbf7' }}>[cite: 12]
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>{t('home.hotJobs.title')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {hotJobs.map((job) => (
                        <div key={job.id} style={{
                            background: '#ffffff', // Քարտերը պահում ենք սպիտակ, որպեսզի գեղեցիկ երևան ֆոնի վրա[cite: 12]
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #eee'
                        }}>
                            <h3>{job.title}</h3>
                            <p>{job.company}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HotJobs