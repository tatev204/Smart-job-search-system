import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobById } from '../services/jobs'
import api from '../services/api'

const VacancyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data, isLoading, error } = useQuery({
        queryKey: ['job', id],
        queryFn: () => getJobById(id!),
        enabled: !!id,
    })

    const handleSaveJob = async () => {
        if (!data) return;
        try {
            const token = localStorage.getItem('token');
            await api.post('/save-job', { job_id: data.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Աշխատանքը հաջողությամբ պահպանվեց Ձեր էջում!');
        } catch (error) {
            console.error("Չհաջողվեց պահպանել", error);
            alert('Խնդրում ենք մուտք գործել համակարգ աշխատանքը պահելու համար:');
        }
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Բեռնվում է...</div>
    if (error || !data) return <div style={{ padding: '40px', textAlign: 'center' }}>❌ Աշխատանքը չի գտնվել</div>

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ marginBottom: '24px', padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
                ← Back
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>{data.title}</h2>
                <button
                    onClick={handleSaveJob}
                    title="Պահել աշխատանքը"
                    style={{
                        background: '#fff', border: '2px solid #ff9800', borderRadius: '50%',
                        width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                    }}
                >
                    🔖
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #f0f0f0' }}>
                <div>
                    <p style={{ fontSize: '14px', color: '#999', margin: '0 0 4px 0' }}>Company</p>
                    <h3 style={{ margin: 0, color: '#764ba2', fontSize: '16px' }}>{data.company || 'Չի նշված'}</h3>
                </div>
                <div>
                    <p style={{ fontSize: '14px', color: '#999', margin: '0 0 4px 0' }}>Location</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>📍 {data.location || 'Չի նշված'}</p>
                </div>
                <div>
                    <p style={{ fontSize: '14px', color: '#999', margin: '0 0 4px 0' }}>Salary</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#667eea' }}>💰 {data.salary_range || 'Negotiable'}</p>
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '16px', color: '#333' }}>📋 Job Description</h3>
                <div style={{ whiteSpace: 'pre-wrap', background: '#f8f9fa', padding: '20px', borderRadius: '8px', color: '#444', lineHeight: '1.6' }}>
                    {/* ԱՌԱՋՆԱՀԵՐԹ ՑՈՒՅՑ Է ՏԱԼԻՍ FULL DESCRIPTION-ը */}
                    {data.full_description || data.description || 'Նկարագրությունը բացակայում է:'}
                </div>
            </div>

            {/* ԿՈՃԱԿԸ ՏԵՂԱՓՈԽՎԱԾ Է ՁԱԽ ԵՎ ՏԵՔՍՏԸ ՓՈԽՎԱԾ Է */}
            <div style={{ marginTop: '32px', textAlign: 'left' }}>
                <button
                    style={{
                        padding: '14px 40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    {data.phone_number ? `📞 ${data.phone_number}` : '📞 Հեռախոսահամարը նշված չէ'}
                </button>
            </div>
        </div>
    )
}

export default VacancyDetail