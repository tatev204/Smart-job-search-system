import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

import heroImage from '../assets/hero-image.jpg';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const theme = {
        navy: '#2F4156', teal: '#567C8D', skyBlue: '#C8D9E6',
        beige: '#F5EFEB', white: '#FFFFFF'
    };

    const { data: latestJobs = [], isLoading } = useQuery({
        queryKey: ['latest-jobs'],
        queryFn: async () => {
            const res = await api.get('/jobs');

            // 🚀 ՈՒՂՂՈՒՄ. Հիմա զտում ենք, որ և՛ դատարկ չլինի, և՛ "Staff.am Partner" չլինի
            const filtered = res.data ? res.data.filter((job: any) =>
                job.company &&
                job.company.trim() !== "" &&
                job.company !== "Staff.am Partner" // Այս տողը կհեռացնի անորոշ գործատուներին
            ) : [];

            return filtered.slice(0, 6);
        }
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

            {/* --- HERO SECTION --- */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                borderRadius: '50px',
                marginBottom: '60px',
                overflow: 'hidden',
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 25px 60px rgba(47, 65, 86, 0.15)'
            }}>
                <div style={{
                    position: 'absolute',
                    zIndex: 2,
                    top: '55%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={() => navigate('/jobs')}
                        style={{
                            background: theme.white,
                            color: theme.navy,
                            padding: '12px 28px', /* Փոքրացված ներքին տարածություն */
                            borderRadius: '12px', /* Ավելի նուրբ անկյուններ */
                            border: 'none',
                            fontSize: '16px', /* Փոքրացված տառաչափ */
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        🔍 Որոնել աշխատանք
                    </button>
                </div>
            </div>

            {/* --- ՆՈՐԱԳՈՒՅՆ ԱՇԽԱՏԱՆՔՆԵՐ --- */}
            <div>
                <h2 style={{
                    color: theme.navy,
                    fontSize: '30px',
                    marginBottom: '30px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    Նորագույն Աշխատանքներ
                </h2>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Բեռնվում է...</div>
                ) : latestJobs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {latestJobs.map((job: any) => (
                            <Link key={job.id} to={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    background: theme.white,
                                    padding: '25px',
                                    borderRadius: '20px',
                                    border: `1px solid ${theme.skyBlue}`,
                                    transition: '0.3s'
                                }}
                                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <h3 style={{ color: theme.navy, margin: '0 0 10px 0', fontSize: '20px' }}>{job.title}</h3>
                                    <p style={{ color: theme.teal, fontWeight: '600' }}>🏢 {job.company}</p>
                                    <div style={{ marginTop: '10px', color: '#888', fontSize: '14px' }}>
                                        📍 {job.location || 'Հայաստան'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: theme.teal }}>Այս պահին հայտնի գործատուներով նոր հաստիքներ չկան։</div>
                )}
            </div>
        </div>
    );
};

export default Home;