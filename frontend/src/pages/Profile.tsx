import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

type TabType = 'profile' | 'applications' | 'notifications' | 'messages' | 'settings'

const Profile: React.FC = () => {
    const { userEmail, firstName, lastName, logout } = useAuth()
    const { isDarkMode, toggleDarkMode } = useTheme()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TabType>('profile')

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '12px', color: 'var(--text-primary)', transition: 'background 0.3s ease, color 0.3s ease' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '14px', marginBottom: '12px', boxShadow: 'var(--shadow)', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: '24px', color: '#667eea' }}>
                            {firstName} {lastName}
                        </h1>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '12px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            {t('profile.logout')}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', boxShadow: 'var(--shadow)', padding: '8px', height: 'fit-content', color: 'var(--text-primary)' }}>
                        {['profile', 'applications', 'notifications', 'messages', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as TabType)}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    color: activeTab === tab ? '#667eea' : 'var(--text-muted)',
                                    borderLeft: activeTab === tab ? '4px solid #667eea' : 'none',
                                    paddingLeft: activeTab === tab ? '6px' : '10px',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'left',
                                    marginBottom: tab === 'settings' ? '0px' : '2px'
                                }}
                            >
                                {t(`profile.tabs.${tab}`)}
                            </button>
                        ))}
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', boxShadow: 'var(--shadow)', padding: '14px', color: 'var(--text-primary)' }}>
                        {activeTab === 'profile' && (
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '16px' }}>{t('profile.profileInfo')}</h2>
                                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                                    <p style={{ margin: '3px 0', color: 'var(--text-primary)' }}><strong>{t('profile.firstName')}:</strong> {firstName}</p>
                                    <p style={{ margin: '3px 0', color: 'var(--text-primary)' }}><strong>{t('profile.lastName')}:</strong> {lastName}</p>
                                    <p style={{ margin: '3px 0', color: 'var(--text-primary)' }}><strong>{t('profile.email')}:</strong> {userEmail}</p>
                                </div>
                                <button style={{ padding: '6px 12px', background: 'var(--button-secondary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '11px', color: 'var(--text-primary)' }}>
                                    {t('profile.editProfile')}
                                </button>
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '16px' }}>{t('profile.myApplications')}</h2>
                                <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '14px', margin: 0 }}>📋</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{t('profile.noApplications')}</p>
                                    <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#bbb' }}>{t('profile.noApplicationsHint')}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '16px' }}>{t('profile.notifications')}</h2>
                                <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '14px', margin: 0 }}>🔔</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{t('profile.noNotifications')}</p>
                                    <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#bbb' }}>{t('profile.noNotificationsHint')}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '16px' }}>{t('profile.messages')}</h2>
                                <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '14px', margin: 0 }}>💬</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{t('profile.noMessages')}</p>
                                    <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#bbb' }}>{t('profile.noMessagesHint')}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '16px' }}>{t('profile.settings')}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{t('profile.emailNotifications')}</p>
                                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>{t('profile.emailNotificationsHint')}</p>
                                        </div>
                                        <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                                    </div>

                                    <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{t('profile.darkMode')}</p>
                                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>{t('profile.darkModeHint')}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isDarkMode}
                                            onChange={toggleDarkMode}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                    </div>

                                    <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{t('profile.twoFactor')}</p>
                                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>{t('profile.twoFactorHint')}</p>
                                        </div>
                                        <button style={{ padding: '4px 10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 500 }}>
                                            {t('profile.enable')}
                                        </button>
                                    </div>

                                    <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '8px', marginTop: '6px' }}>
                                        <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: '12px', color: '#856404' }}>{t('profile.dangerZone')}</p>
                                        <button style={{ padding: '4px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 500 }}>
                                            {t('profile.deleteAccount')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile