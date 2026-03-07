import React from 'react'
import { useTranslation } from 'react-i18next'
import Hero from '../components/Hero'
import ProfessionsSection from '../components/ProfessionsSection'
import Footer from '../components/Footer'

const VacancyList: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        <Hero />
      </div>

      {/* Professions Section */}
      <ProfessionsSection />


      {/* Footer */}
      <Footer />
    </div>
  )
}

export default VacancyList
