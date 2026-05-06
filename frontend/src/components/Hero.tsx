import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Hero: React.FC = () => {
    const { t } = useTranslation()

    return (
        <div style={{
            backgroundColor: '#a67c52',
            backgroundImage: `linear-gradient(rgba(166, 124, 82, 0.4), rgba(166, 124, 82, 0.4)), url("/photo_5454050288135247977_x.jpg")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '20px',
            padding: '80px 32px',
            color: 'white',
            textAlign: 'center',
            marginBottom: '40px',
            boxShadow: '0 8px 25px rgba(166, 124, 82, 0.15)',
            position: 'relative',
        }}>
            <h1 style={{
                fontSize: '52px',
                fontWeight: '800',
                marginBottom: '12px',
                color: '#fff',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                MyJobs
            </h1>
            <p style={{
                fontSize: '20px',
                marginBottom: '35px',
                opacity: 0.95,
                maxWidth: '600px',
                margin: '0 auto 35px auto'
            }}>
                Գտեք Ձեր երազանքի աշխատանքը
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link to="/upload" style={{
                    padding: '12px 30px',
                    background: '#fceabb',
                    color: '#7a5230',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: '700'
                }}>
                    {t('home.hero.uploadBtn')}
                </Link>
                <Link to="/jobs" style={{
                    padding: '12px 30px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    border: '1px solid white'
                }}>
                    {t('home.hero.browseBtn')}
                </Link>
            </div>
        </div>
    )
}

export default Hero