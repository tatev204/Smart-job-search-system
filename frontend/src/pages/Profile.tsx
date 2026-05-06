import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface SavedJob {
    id: number;
    title: string;
    company: string;
    location: string;
}

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'saved'>('info');

    // Նոր գունային գամմա[cite: 4]
    const theme = {
        navy: '#2F4156',
        teal: '#567C8D',
        skyBlue: '#C8D9E6',
        beige: '#F5EFEB',
        white: '#FFFFFF'
    };

    const { data: savedJobs, isLoading: isLoadingSaved } = useQuery({
        queryKey: ['savedJobs'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await api.get('/saved-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data || [];
        },
        enabled: activeTab === 'saved'
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{ minHeight: '90vh', padding: '40px 20px', background: theme.beige }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

                {/* --- Sidebar --- */}
                <div style={{
                    flex: '0 0 280px',
                    background: theme.white,
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                    height: 'fit-content',
                    border: `1px solid ${theme.skyBlue}`
                }}>
                    <button
                        onClick={() => setActiveTab('info')}
                        style={{
                            width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600',
                            background: activeTab === 'info' ? theme.navy : 'transparent',
                            color: activeTab === 'info' ? theme.white : theme.navy,
                            transition: '0.3s'
                        }}
                    >
                        👤 Իմ Էջը
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        style={{
                            width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600',
                            background: activeTab === 'saved' ? theme.navy : 'transparent',
                            color: activeTab === 'saved' ? theme.white : theme.navy,
                            transition: '0.3s'
                        }}
                    >
                        🔖 Պահպանվածներ
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '15px', marginTop: '20px', borderRadius: '14px', border: `1px solid ${theme.teal}`, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', color: theme.teal, background: 'transparent',
                            transition: '0.3s'
                        }}
                    >
                        🚪 Ելք
                    </button>
                </div>

                {/* --- Content Area --- */}
                <div style={{
                    flex: 1,
                    background: theme.white,
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.skyBlue}`
                }}>
                    {activeTab === 'info' ? (
                        <>
                            <h2 style={{ color: theme.navy, borderBottom: `3px solid ${theme.skyBlue}`, paddingBottom: '15px', marginBottom: '30px' }}>
                                Էջի տեղեկատվություն
                            </h2>
                            <div style={{ background: theme.beige, padding: '30px', borderRadius: '20px', border: `1px solid ${theme.skyBlue}` }}>
                                <p style={{ color: theme.teal, marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Անուն Ազգանուն</p>
                                <h3 style={{ margin: '0 0 25px 0', color: theme.navy, fontSize: '22px' }}>
                                    {user?.firstName} {user?.lastName}
                                </h3>

                                <p style={{ color: theme.teal, marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Էլ. փոստ</p>
                                <h3 style={{ margin: 0, color: theme.navy, fontSize: '20px' }}>
                                    {user?.email}
                                </h3>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 style={{ color: theme.navy, borderBottom: `3px solid ${theme.skyBlue}`, paddingBottom: '15px', marginBottom: '30px' }}>
                                Պահպանված աշխատանքներ
                            </h2>
                            {isLoadingSaved ? (
                                <p style={{ textAlign: 'center', color: theme.teal }}>⏳ Բեռնվում է...</p>
                            ) : savedJobs && savedJobs.length > 0 ? (
                                <div style={{ display: 'grid', gap: '18px' }}>
                                    {savedJobs.map((job: SavedJob) => (
                                        <div
                                            key={job.id}
                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                            style={{
                                                padding: '25px',
                                                borderRadius: '16px',
                                                border: `1px solid ${theme.skyBlue}`,
                                                cursor: 'pointer',
                                                transition: '0.3s',
                                                background: '#fff'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.teal}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.skyBlue}
                                        >
                                            <h4 style={{ margin: '0 0 8px 0', color: theme.navy, fontSize: '18px' }}>{job.title}</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: theme.teal }}>🏢 {job.company} | 📍 {job.location}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', color: theme.skyBlue }}>
                                    <p style={{ fontSize: '60px', margin: 0 }}>📂</p>
                                    <p style={{ color: theme.teal, fontSize: '16px' }}>Դեռևս պահպանված աշխատանքներ չունեք:</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;