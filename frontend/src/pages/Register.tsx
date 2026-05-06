import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const theme = { navy: '#2F4156', teal: '#567C8D', skyBlue: '#C8D9E6', beige: '#F5EFEB', white: '#FFFFFF' };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData.firstName, formData.lastName, formData.email, formData.password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: theme.beige }}>
            <div style={{ background: theme.white, padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: `1px solid ${theme.skyBlue}` }}>
                <h2 style={{ textAlign: 'center', color: theme.navy, marginBottom: '25px' }}>📝 Գրանցում</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input placeholder="Անուն" onChange={e => setFormData({...formData, firstName: e.target.value})} required style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${theme.skyBlue}` }} />
                    <input placeholder="Ազգանուն" onChange={e => setFormData({...formData, lastName: e.target.value})} required style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${theme.skyBlue}` }} />
                    <input type="email" placeholder="Էլ. փոստ" onChange={e => setFormData({...formData, email: e.target.value})} required style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${theme.skyBlue}` }} />
                    <input type="password" placeholder="Գաղտնաբառ" onChange={e => setFormData({...formData, password: e.target.value})} required style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${theme.skyBlue}` }} />
                    <button type="submit" style={{ background: theme.navy, color: 'white', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>Ստեղծել հաշիվ</button>
                </form>
                {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/login" style={{ color: theme.teal, textDecoration: 'none', fontWeight: '600' }}>Արդեն ունե՞ք հաշիվ: Մուտք</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;