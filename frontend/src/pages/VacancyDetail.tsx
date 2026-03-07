import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobs, Job } from '../services/jobs'

const fetchJob = async (id: string | undefined): Promise<Job | null> => {
    if (!id) return null
    const jobs = await getJobs()
    return jobs.find((j) => j.id === Number(id)) || null
}

const VacancyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data, isLoading, error } = useQuery({
        queryKey: ['job', id],
        queryFn: () => fetchJob(id),
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className="loading">
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                <p>Loading job details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error">
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
                <p>Error loading job details</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="error">
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔍</div>
                <p>Job not found</p>
            </div>
        )
    }

    return (
        <div className="job-detail">
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '24px',
                    padding: '8px 16px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
            >
                ← Back
            </button>

            <h2>{data.title}</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '2px solid #f0f0f0'
            }}>
                <div>
                    <p style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>Company</p>
                    <h3 style={{ margin: 0, color: '#764ba2' }}>{data.company}</h3>
                </div>
                <div>
                    <p style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>Location</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>📍 {data.location}</p>
                </div>
                <div>
                    <p style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>Salary</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#667eea' }}>
                        💰 {data.salary_range || 'Not specified'}
                    </p>
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '16px', color: '#333' }}>📋 Job Description</h3>
                <div className="description">{data.description}</div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #f0f0f0' }}>
                <button
                    style={{
                        padding: '12px 32px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Apply Now
                </button>
            </div>
        </div>
    )
}

export default VacancyDetail