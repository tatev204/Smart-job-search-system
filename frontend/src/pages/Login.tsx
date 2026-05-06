import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Գունային գամմա[cite: 4]
    const theme = {
        navy: '#2F4156',
        teal: '#567C8D',
        skyBlue: '#C8D9E6',
        beige: '#F5EFEB',
        white: '#FFFFFF'
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err?.response?.data || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: theme.beige }}>
            <div style={{
                background: theme.white,
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 15px 35px rgba(47, 65, 86, 0.1)',
                width: '100%',
                maxWidth: '400px',
                border: `1px solid ${theme.skyBlue}`
            }}>
                <h2 style={{ textAlign: 'center', color: theme.navy, marginBottom: '30px' }}>
                    🔐 {t('login.title') || 'Մուտք'}
                </h2>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', color: theme.teal }}>{t('login.email') || 'Էլ. փոստ'}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            required
                            style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${theme.skyBlue}`, outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', color: theme.teal }}>{t('login.password') || 'Գաղտնաբառ'}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${theme.skyBlue}`, outline: 'none' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: theme.navy,
                            color: theme.white,
                            padding: '15px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px',
                            transition: '0.3s'
                        }}
                    >
                        {loading ? '...' : (t('login.submit') || 'Մուտք գործել')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link to="/register" style={{ color: theme.teal, textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                        Դեռ հաշիվ չունե՞ք։ Գրանցվել
                    </Link>
                    <a href="#" style={{ color: '#999', textDecoration: 'none', fontSize: '12px' }}>
                        {t('login.forgotPassword') || 'Մոռացե՞լ եք գաղտնաբառը'}
                    </a>
                </div>

                {error && <div style={{ marginTop: '20px', color: '#ff4d4f', textAlign: 'center', fontWeight: '600' }}>❌ {String(error)}</div>}
            </div>
        </div>
    );
};

export default Login;