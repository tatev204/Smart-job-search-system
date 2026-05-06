import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SearchJobs: React.FC = () => {
    // Վիճակները (States)
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<any[]>([]); // Զանգված աշխատանքների համար
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(''); // Սխալների ցուցադրման համար

    const handleAISearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchTerm.trim()) return;

        setLoading(true);
        setErrorMsg('');
        setJobs([]); // Մաքրում ենք նախորդ արդյունքները նոր որոնումից առաջ

        try {
            const res = await api.get(`/ai/elastic-search?q=${encodeURIComponent(searchTerm)}`);

            // Ստուգում ենք, արդյոք տվյալը եկել է և արդյոք զանգված է
            if (res.data && Array.isArray(res.data.jobs)) {
                setJobs(res.data.jobs);
            } else {
                console.warn("Backend didn't return an array of jobs:", res.data);
                setJobs([]);
            }
        } catch (error) {
            console.error("AI Search Error:", error);
            setErrorMsg("Ներողություն, որոնման ընթացքում սխալ տեղի ունեցավ: Ստուգեք կապը բեքենդի հետ:");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '50px auto', textAlign: 'center', padding: '0 20px' }}>
            <h1 style={{ fontSize: '36px', color: '#2F4156', fontWeight: '900' }}>
                🤖 AI Խելացի Որոնում
            </h1>

            {/* ՈՐՈՆՄԱՆ ԴԱՇՏ */}
            <form onSubmit={handleAISearch} style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto 20px' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ի՞նչ աշխատանք եք փնտրում... (օր.՝ վիդեո մոնտաժող)"
                    style={{
                        width: '100%', padding: '20px', borderRadius: '15px',
                        border: '2px solid #C8D9E6', fontSize: '18px', outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '20px', width: '100%', padding: '18px',
                        background: '#7b68ee', color: 'white', border: 'none',
                        borderRadius: '15px', fontSize: '20px', fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: '0.3s'
                    }}
                >
                    {loading ? '⏳ Որոնվում է (խնդրում ենք սպասել)...' : 'Որոնել'}
                </button>
            </form>

            {/* ՍԽԱԼԻ ՑՈՒՑԱԴՐՈՒՄ */}
            {errorMsg && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '10px', marginTop: '20px', fontWeight: 'bold' }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* ՈՉԻՆՉ ՉԳՏՆՎԵԼՈՒ ԴԵՊՔՈՒՄ */}
            {!loading && jobs.length === 0 && searchTerm && !errorMsg && (
                <div style={{ marginTop: '30px', color: '#567C8D', fontSize: '18px' }}>
                    Աշխատանքներ չեն գտնվել: Փորձեք այլ բառեր (օրինակ՝ "video", "developer"):
                </div>
            )}

            {/* ԱՐԴՅՈՒՆՔՆԵՐԻ ՔԱՐՏԵՐ */}
            {!loading && jobs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginTop: '40px', textAlign: 'left' }}>
                    {jobs.map((job) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'white', padding: '25px', borderRadius: '20px',
                                border: '1px solid #C8D9E6', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s', cursor: 'pointer', height: '100%',
                                boxSizing: 'border-box'
                            }}
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h3 style={{ color: '#2F4156', margin: '0 0 10px 0', fontSize: '18px' }}>{job.title}</h3>
                                <p style={{ color: '#567C8D', fontWeight: 'bold', fontSize: '14px', margin: '0 0 15px 0' }}>🏢 {job.company || 'Ընկերությունը նշված չէ'}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <span style={{ background: '#F5EFEB', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#2F4156' }}>
                                        📍 {job.location || 'Yerevan'}
                                    </span>
                                    <span style={{ background: '#E8F1F8', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', color: '#2D82B7' }}>
                                        💰 {job.salary_range || 'Պայմանագրային'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchJobs;