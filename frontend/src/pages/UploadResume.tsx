import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const UploadResume: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);

    const theme = {
        navy: '#2F4156',
        teal: '#567C8D',
        skyBlue: '#C8D9E6',
        beige: '#F5EFEB',
        white: '#FFFFFF'
    };

    const handleUpload = async (type: 'standard' | 'ai') => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file); // Սա համապատասխանում է Go-ի r.FormFile("resume")-ին[cite: 4]

        try {
            // 🚀 ՈՒՂՂՎԱԾ ENDPOINT-ՆԵՐ (համընկնում են քո Go կոդի հետ)[cite: 5]
            const endpoint = type === 'ai' ? '/ai/upload' : '/upload-resume';

            const token = localStorage.getItem('token'); // Վերցնում ենք տոկենը հարցման համար[cite: 2]

            const res = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // Անհրաժեշտ է AuthMiddleware-ի համար[cite: 5]
                }
            });
            console.log("Full Backend Response:", res.data);
            // 🚀 ՈՒՂՂՎԱԾ ՏՎՅԱԼՆԵՐԻ ՍՏԱՑՈՒՄ (ըստ UploadResumeHandler-ի)[cite: 4]
            // Բեքենդը վերադարձնում է "recommended_jobs" բանալիով[cite: 4]
            setRecommendedJobs(res.data.recommended_jobs || []);

        } catch (error: any) {
            console.error("Error details:", error);
            const status = error.response?.status;

            if (status === 404) {
                alert("Սխալ 404: Բեքենդում հասցեն չի գտնվել: Ստուգիր api.ts-ի baseURL-ը կամ Go-ի endpoint-ը:");
            } else if (status === 401) {
                alert("Սխալ 401: Խնդրում ենք նախ մուտք գործել համակարգ:");
            } else {
                alert("Ինչ-որ բան այն չէ: Ստուգիր բեքենդի կապը կամ URL-ը:");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>

            {/* ԳԼԽԱՎՈՐ BOX */}
            <div style={{
                background: theme.white,
                padding: '60px',
                borderRadius: '40px',
                border: `2px dashed ${theme.skyBlue}`,
                textAlign: 'center',
                boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                marginBottom: '50px'
            }}>
                <h2 style={{ color: theme.navy, fontSize: '36px', marginBottom: '40px', fontWeight: '900' }}>
                    Վերբեռնել <span style={{ color: theme.teal }}>CV</span>
                </h2>

                {/* ՖԱՅԼԻ ԸՆՏՐՈՒԹՅՈՒՆ */}
                <div style={{ marginBottom: file ? '40px' : '0' }}>
                    <label style={{
                        background: theme.beige,
                        color: theme.navy,
                        padding: '18px 40px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: `1px solid ${theme.skyBlue}`
                    }}>
                        📁 {file ? file.name : 'Ընտրել ֆայլը'}
                        <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                {/* ԿՈՃԱԿՆԵՐԸ (ցուցադրվում են միայն ֆայլը կցելուց հետո) */}
                {file && !loading && (
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                        <button
                            onClick={() => handleUpload('standard')}
                            style={{
                                background: theme.teal, color: 'white', padding: '16px 30px',
                                borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            Սկսել վերլուծությունը
                        </button>
                        <button
                            onClick={() => handleUpload('ai')}
                            style={{
                                background: theme.navy, color: 'white', padding: '16px 30px',
                                borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            ✨ AI Վերլուծություն
                        </button>
                    </div>
                )}

                {/* LOADING ԻՆԴԻԿԱՏՈՐ */}
                {loading && (
                    <div style={{ marginTop: '30px', color: theme.teal, fontWeight: 'bold', fontSize: '18px' }}>
                        ⏳ վերլուծվում է... խնդրում ենք սպասել
                    </div>
                )}
            </div>

            {/* ԱՐԴՅՈՒՆՔՆԵՐ (ԱՇԽԱՏԱՆՔՆԵՐԻ ՑՈՒՑԱԿ) */}
            {recommendedJobs.length > 0 && (
                <div style={{ padding: '0 20px' }}>
                    <h2 style={{ color: theme.navy, marginBottom: '30px', fontWeight: '800' }}>🎯 Քեզ համապատասխանող աշխատանքները</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {recommendedJobs.map((job: any) => (
                            <Link key={job.id} to={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    background: theme.white, padding: '25px', borderRadius: '20px',
                                    border: `1px solid ${theme.skyBlue}`, transition: '0.3s'
                                }}
                                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <h3 style={{ color: theme.navy, margin: '0 0 10px 0', fontSize: '20px' }}>{job.title}</h3>
                                    <p style={{ color: theme.teal, fontWeight: '600' }}>🏢 {job.company}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                        <span style={{ color: '#888', fontSize: '14px' }}>📍 {job.location || 'Հայաստան'}</span>
                                        {/* Ցույց ենք տալիս համապատասխանության տոկոսը[cite: 4] */}
                                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{job.match_percentage}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadResume;