import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

interface RecommendedJob {
  id: number
  title: string
  company: string
  match_percentage: number
  matched_skills: string
}

const UploadResume: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [loading, setLoading] = useState(false)
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Validation
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type)) {
        setMessage(t('upload.invalidFileType'))
        setMessageType('error')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage(t('upload.fileTooLarge'))
        setMessageType('error')
        return
      }
      setFile(selectedFile)
      setMessage(null)
      setRecommendedJobs([])
      setShowRecommendations(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage(t('upload.selectFile'))
      setMessageType('error')
      return
    }
    const form = new FormData()
    form.append('resume', file)
    setLoading(true)
    setMessage(null)
    try {
      console.log('Sending upload request to:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088'}/upload-cv`)
      console.log('File being uploaded:', file.name, file.size, file.type)

      const res = await api.post('/upload-cv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log('Upload response:', res.data)

      if (res.data.recommended_jobs && res.data.recommended_jobs.length > 0) {
        setRecommendedJobs(res.data.recommended_jobs)
        setShowRecommendations(true)
        setMessage(t('upload.successWithRecommendations'))
      } else {
        setMessage(t('upload.success'))
      }
      setMessageType('success')
      setFile(null)
    } catch (err: any) {
      console.error('Upload error:', err)
      console.error('Error response:', err?.response?.data)
      console.error('Error status:', err?.response?.status)

      setMessage(t('upload.error') + ': ' + (err?.response?.data || err.message))
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px', color: 'var(--text-primary)', transition: 'background 0.3s ease, color 0.3s ease' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow)', marginBottom: '20px' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '8px' }}>📄 {t('upload.title')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('upload.description')}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{
              border: '2px dashed #667eea',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: 'var(--bg-tertiary)',
              position: 'relative'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#764ba2'
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
                {t('upload.clickToUpload')}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                {t('upload.fileTypes')}
              </p>
            </div>

            {file && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#e8f5e9',
                borderRadius: '8px',
                borderLeft: '4px solid #4caf50',
              }}>
                <p style={{ margin: 0, color: '#2e7d32', fontWeight: '500' }}>
                  ✓ {t('upload.selected')}: {file.name}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#558b2f' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading || !file ? 'not-allowed' : 'pointer',
                opacity: loading || !file ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '⏳ ' + t('upload.uploading') : '📤 ' + t('upload.uploadButton')}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: messageType === 'success' ? '#e8f5e9' : '#ffebee',
              color: messageType === 'success' ? '#2e7d32' : '#c62828',
              borderLeft: `4px solid ${messageType === 'success' ? '#4caf50' : '#f44336'}`,
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </div>

        {showRecommendations && recommendedJobs.length > 0 && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px', textAlign: 'center' }}>
              🎯 {t('upload.recommendationsTitle')}
            </h3>

            <div style={{ display: 'grid', gap: '16px' }}>
              {recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    padding: '16px',
                    borderLeft: '4px solid #667eea',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#667eea', fontSize: '16px' }}>{job.title}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{job.company}</p>
                    </div>
                    <div style={{
                      background: job.match_percentage >= 80 ? '#4caf50' : job.match_percentage >= 60 ? '#ff9800' : '#f44336',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {job.match_percentage}% {t('upload.match')}
                    </div>
                  </div>

                  {job.matched_skills && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {t('upload.matchedSkills')}:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {job.matched_skills.split(', ').map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              background: '#e3f2fd',
                              color: '#1976d2',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadResume
