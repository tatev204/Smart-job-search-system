import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// ԲՈԼՈՐ ԷՋԵՐԻ ՃԻՇՏ IMPORT-ՆԵՐԸ
import Home from './pages/Home';
import VacancyList from './pages/VacancyList';
import VacancyDetail from './pages/VacancyDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResume from './pages/UploadResume';
import SearchJobs from './pages/search_jobs';

const App: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const theme = {
        navy: '#2F4156',
        teal: '#567C8D',
        skyBlue: '#C8D9E6',
        beige: '#F5EFEB',
        white: '#FFFFFF'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: theme.beige }}>

            {/* --- ՎԵՐԵՎԻ ՄԵՆՅՈՒՆ (HEADER) --- */}
            <header style={{
                background: theme.navy, padding: '12px 40px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>
                    {/* ԼՈԳՈՆ. Տանում է գլխավոր Home էջ */}
                    <Link to="/" style={{ color: theme.white, textDecoration: 'none', fontWeight: '800', fontSize: '26px' }}>
                        MyJobs
                    </Link>

                    <nav style={{ display: 'flex', gap: '20px' }}>
                        {/* ԱՇԽԱՏԱՆՔՆԵՐԸ. Տանում է ֆիլտրերով ցուցակի էջ */}
                        <Link to="/jobs" style={{ color: theme.white, textDecoration: 'none', fontWeight: '500' }}>Աշխատանքներ</Link>
                        <Link to="/upload" style={{ color: theme.white, textDecoration: 'none', fontWeight: '500' }}>Վերբեռնել CV</Link>
                        <Link to="/ai-search" style={{ color: theme.white, textDecoration: 'none', fontWeight: '500' }}>AI Որոնում</Link>
                    </nav>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {user ? (
                        <button onClick={() => navigate('/profile')} style={{ background: theme.teal, color: 'white', border: 'none', padding: '10px 22px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                            👤 {user.firstName || 'Իմ Էջը'}
                        </button>
                    ) : (
                        <button onClick={() => navigate('/login')} style={{ background: theme.white, color: theme.navy, border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                            Մուտք
                        </button>
                    )}
                </div>
            </header>

            {/* --- ԷՋԵՐԻ ԲԵՌՆՄԱՆ ՀԱՏՎԱԾԸ (ROUTES) --- */}
            <main style={{ flex: 1, padding: '30px 40px' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/jobs" element={<VacancyList />} />
                    <Route path="/jobs/:id" element={<VacancyDetail />} />

                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/upload" element={<UploadResume />} />
                    <Route path="/ai-search" element={<SearchJobs />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;