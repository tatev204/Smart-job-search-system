import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobById } from '../services/jobs';
import api from '../services/api';

const VacancyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ՍԻՆՅՈՌԻ ԼՈՒԾՈՒՄ. Ստեղծում ենք գեղեցիկ ծանուցման վիճակ (state)
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['job', id],
        queryFn: () => getJobById(id!),
        enabled: !!id,
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        // 3 վայրկյանից ավտոմատ փակում է ծանուցումը
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveJob = async () => {
        if (!data) return;
        try {
            const token = localStorage.getItem('token');
            await api.post('/save-job', { job_id: data.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Կանչում ենք մեր նոր, գեղեցիկ ծանուցումը հին alert-ի փոխարեն
            showNotification('Ձեր աշխատանքը հաջողությամբ պահպանվեց:', 'success');
        } catch (error) {
            showNotification('Խնդրում ենք մուտք գործել աշխատանքը պահպանելու համար:', 'error');
        }
    };

    if (isLoading) return <div style={{ padding: '60px', textAlign: 'center', fontSize: '24px', color: '#567C8D' }}>⏳ Բեռնվում են մանրամասները...</div>;
    if (error || !data) return <div style={{ padding: '60px', textAlign: 'center', color: '#e74c3c', fontSize: '24px' }}>❌ Աշխատանքը չի գտնվել:</div>;

    return (
        <div style={{ position: 'relative', maxWidth: '850px', margin: '40px auto', padding: '40px', background: '#fff', borderRadius: '16px', borderTop: '8px solid #567C8D', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>

            {/* ԳԵՂԵՑԻԿ ԾԱՆՈՒՑՄԱՆ ՊԱՏՈՒՀԱՆԸ */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '30px', right: '30px', zIndex: 9999,
                    background: notification.type === 'success' ? '#27ae60' : '#e74c3c',
                    color: 'white', padding: '16px 24px', borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)', fontSize: '16px', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.3s ease-in-out'
                }}>
                    <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
                    {notification.message}
                </div>
            )}

            {/* ՀԵՏ ՎԵՐԱԴԱՌՆԱԼՈՒ ԿՈՃԱԿ */}
            <button onClick={() => navigate(-1)} style={{ marginBottom: '24px', padding: '10px 20px', background: '#F5EFEB', color: '#2F4156', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                ← Հետ
            </button>

            {/* ՎԵՐՆԱԳԻՐ ԵՎ ՊԱՀՊԱՆԵԼ ԿՈՃԱԿ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '15px' }}>
                <h1 style={{ color: '#2F4156', fontSize: '36px', margin: 0 }}>{data.title}</h1>

                <button
                    onClick={handleSaveJob}
                    title="Պահպանել աշխատանքը"
                    style={{
                        padding: '12px 20px', background: '#fff', color: '#567C8D',
                        border: '2px solid #567C8D', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: '0.3s', whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#567C8D'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#567C8D'; }}
                >
                    🔖 Պահպանել
                </button>
            </div>

            <h3 style={{ color: '#567C8D', fontSize: '22px', marginBottom: '30px', marginTop: 0 }}>🏢 {data.company || 'Ընկերությունը նշված չէ'}</h3>

            {/* ՄԱՆՐԱՄԱՍՆԵՐԻ ԲԼՈԿ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', padding: '20px', background: '#F8F9FA', borderRadius: '12px' }}>
                <div>
                    <span style={{ color: '#999', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Վայր</span>
                    <strong style={{ fontSize: '18px', color: '#2F4156' }}>📍 {data.location || 'Չի նշված'}</strong>
                </div>
                <div>
                    <span style={{ color: '#999', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Աշխատավարձ</span>
                    <strong style={{ fontSize: '18px', color: '#27ae60' }}>💰 {data.salary_range || 'Պայմանագրային'}</strong>
                </div>
            </div>

            {/* ՆԿԱՐԱԳՐՈՒԹՅՈՒՆ */}
            <h3 style={{ color: '#2F4156', marginBottom: '15px' }}>📋 Նկարագրություն</h3>
            <div style={{ whiteSpace: 'pre-wrap', padding: '25px', background: '#fff', border: '1px solid #EAEAEA', borderRadius: '12px', lineHeight: '1.8', fontSize: '16px', color: '#444' }}>
                {data.full_description || data.description || 'Նկարագրությունը բացակայում է:'}
            </div>

            {/* ՀԵՌԱԽՈՍԱՀԱՄԱՐԻ ԿՈՃԱԿ */}
            <div style={{ marginTop: '40px', borderTop: '2px solid #F5EFEB', paddingTop: '30px' }}>
                {data.phone_number ? (
                    <a href={`tel:${data.phone_number}`} style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '16px 35px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)' }}>
                            📞 Զանգահարել: {data.phone_number}
                        </button>
                    </a>
                ) : (
                    <button disabled style={{ padding: '16px 35px', background: '#E0E0E0', color: '#888', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'not-allowed' }}>
                        📞 Հեռախոսահամարը նշված չէ
                    </button>
                )}
            </div>
        </div>
    );
};

export default VacancyDetail;