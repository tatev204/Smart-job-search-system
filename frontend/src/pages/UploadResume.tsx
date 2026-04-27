import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface RecommendedJob {
    id: number
    title: string
    company: string
    match_percentage: string
    matched_skills: string
}

const UploadResume: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [file, setFile] = useState<File | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
    const [loading, setLoading] = useState(false)

    const [uploadMode, setUploadMode] = useState<'standard' | 'ai'>('standard')

    // ԱՌԱՆՁՆԱՑՎԱԾ ՀԻՇՈՂՈՒԹՅՈՒՆ ԵՐԿՈՒ ՌԵԺԻՄՆԵՐԻ ՀԱՄԱՐ
    const [standardJobs, setStandardJobs] = useState<RecommendedJob[]>([])
    const [aiJobs, setAiJobs] = useState<RecommendedJob[]>([])
    const [aiSummary, setAiSummary] = useState<string | null>(null)
    const [aiProfession, setAiProfession] = useState<string | null>(null)

    // Կարդում ենք պահպանված տվյալները SessionStorage-ից
    useEffect(() => {
        const savedState = sessionStorage.getItem('resumeAnalysisStateV2')
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                if (parsed.standardJobs) setStandardJobs(parsed.standardJobs)
                if (parsed.aiJobs) setAiJobs(parsed.aiJobs)
                if (parsed.aiSummary !== undefined) setAiSummary(parsed.aiSummary)
                if (parsed.aiProfession !== undefined) setAiProfession(parsed.aiProfession)
                if (parsed.uploadMode) setUploadMode(parsed.uploadMode)
            } catch (e) {
                console.error("Failed to parse saved state", e)
            }
        }
    }, [])

    // Պահպանում ենք տվյալները ամեն փոփոխությունից հետո
    useEffect(() => {
        const stateToSave = { standardJobs, aiJobs, aiSummary, aiProfession, uploadMode }
        sessionStorage.setItem('resumeAnalysisStateV2', JSON.stringify(stateToSave))
    }, [standardJobs, aiJobs, aiSummary, aiProfession, uploadMode])

    // Ռեժիմը փոխելիս ԱՅԼԵՎՍ ՉԵՆՔ ՄԱՔՐՈՒՄ տվյալները կամ ֆայլը
    const handleModeSwitch = (mode: 'standard' | 'ai') => {
        setUploadMode(mode)
        setMessage(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setMessage(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        const form = new FormData()
        form.append('resume', file)
        setLoading(true)
        setMessage(null)

        const endpoint = uploadMode === 'ai' ? '/ai/match-cv' : '/upload-resume'

        try {
            const token = localStorage.getItem('token')
            const res = await api.post(endpoint, form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            })

            if (uploadMode === 'ai') {
                if (res.data.ai_summary) {
                    setAiSummary(res.data.ai_summary)
                    setAiProfession(res.data.ai_profession)
                }
                setAiJobs(res.data.recommended_jobs || [])
            } else {
                setStandardJobs(res.data.recommended_jobs || [])
            }

            setMessage(`CV-ն հաջողությամբ վերլուծվեց (${uploadMode === 'ai' ? 'AI' : 'Ստանդարտ'} ռեժիմով):`)
            setMessageType('success')
        } catch (err: any) {
            setMessage(t('upload.error') + ': ' + (err?.response?.data || err.message))
            setMessageType('error')
        } finally {
            setLoading(false)
            // ՖԱՅԼԸ ՉԵՆՔ ՄԱՔՐՈՒՄ, որպեսզի օգտատերը կարողանա մյուս ռեժիմով էլ փորձել
        }
    }

    // Որոշում ենք, թե որ ցուցակն ենք ցույց տալու այս պահին
    const currentJobs = uploadMode === 'standard' ? standardJobs : aiJobs;
    const hasResults = currentJobs.length > 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px', color: 'var(--text-primary)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow)', marginBottom: '20px' }}>

                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📄 {t('upload.title')}</h2>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => handleModeSwitch('standard')}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                                fontWeight: uploadMode === 'standard' ? 'bold' : 'normal',
                                background: uploadMode === 'standard' ? '#667eea' : '#e2e8f0',
                                color: uploadMode === 'standard' ? '#fff' : '#333'
                            }}
                        >
                            Ստանդարտ Որոնում {standardJobs.length > 0 && `(${standardJobs.length})`}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleModeSwitch('ai')}
                            style={{
                                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: 'none',
                                fontWeight: uploadMode === 'ai' ? 'bold' : 'normal',
                                background: uploadMode === 'ai' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#e2e8f0',
                                color: uploadMode === 'ai' ? '#fff' : '#333'
                            }}
                        >
                            🤖 AI Խելացի Որոնում {aiJobs.length > 0 && `(${aiJobs.length})`}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            border: `2px dashed ${uploadMode === 'ai' ? '#38ef7d' : '#667eea'}`,
                            borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer',
                            backgroundColor: 'var(--bg-tertiary)', position: 'relative'
                        }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📁</div>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{t('upload.clickToUpload')}</p>
                        </div>

                        {file && <div style={{ marginTop: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}><p>✓ Ընտրված է: {file.name}</p></div>}

                        <button type="submit" disabled={loading || !file} style={{
                            marginTop: '24px', width: '100%', padding: '12px 24px',
                            background: uploadMode === 'ai' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600,
                            cursor: loading || !file ? 'not-allowed' : 'pointer', opacity: loading || !file ? 0.6 : 1
                        }}>
                            {loading ? '⏳ Վերլուծվում է...' : `📤 Վերլուծել ${uploadMode === 'ai' ? 'AI' : 'Ստանդարտ'} ռեժիմով`}
                        </button>
                    </form>

                    {message && <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: messageType === 'success' ? '#e8f5e9' : '#ffebee', color: messageType === 'success' ? '#2e7d32' : '#c62828', textAlign: 'center' }}>{message}</div>}
                </div>

                {/* ԱՐԴՅՈՒՆՔՆԵՐԻ ՑՈՒՑԱԴՐՈՒՄ */}
                {(hasResults || (uploadMode === 'ai' && aiSummary)) && (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow)' }}>
                        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                            🎯 {uploadMode === 'ai' ? 'AI Որոնման' : 'Ստանդարտ Որոնման'} Արդյունքներ
                        </h3>

                        {/* AI ԱՄՓՈՓՈՒՄԻ ԲԼՈԿ */}
                        {uploadMode === 'ai' && aiSummary && (
                            <div style={{ background: '#f3e5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #9c27b0' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#7b1fa2' }}>🤖 Դիագնոստիկա: {aiProfession}</h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#4a148c', lineHeight: '1.5' }}>{aiSummary}</p>
                            </div>
                        )}

                        {/* ՔԱՐՏԵՐԸ (Նույն դիզայնով երկուսի համար էլ) */}
                        {hasResults ? (
                            currentJobs.map((job) => (
                                <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '16px', borderLeft: `4px solid ${uploadMode === 'ai' ? '#38ef7d' : '#667eea'}`, marginBottom: '16px', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', color: uploadMode === 'ai' ? '#11998e' : '#667eea' }}>{job.title}</h4>
                                            <p style={{ margin: 0, fontSize: '14px' }}>{job.company}</p>
                                        </div>
                                        <div style={{ background: uploadMode === 'ai' ? '#38ef7d' : '#4caf50', color: uploadMode === 'ai' ? '#000' : 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', height: 'fit-content' }}>
                                            {job.match_percentage} {t('upload.match')}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#1976d2', background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>{job.matched_skills}</div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Ոչ մի աշխատանք չի գտնվել այս ռեժիմով:</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UploadResume