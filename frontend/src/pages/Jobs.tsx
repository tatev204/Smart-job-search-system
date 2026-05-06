import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobs, searchJobs } from '../services/jobs'

// Նկարի ներմուծում
import heroBg from '../photo_5454050288135247977_x.jpg'

const Jobs: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const [filters, setFilters] = useState({
        region: '',
        category: '',
        level: '',
        type: ''
    })

    const colors = {
        deepBrown: '#582508',
        softBrown: '#8d5a3e',
        brightGold: '#f0d975',
        paleGold: '#fdfbf7',
        white: '#ffffff'
    }

    useEffect(() => {
        document.body.style.backgroundColor = colors.paleGold
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
        return () => {
            clearTimeout(timer)
            document.body.style.backgroundColor = ''
        }
    }, [searchTerm, colors.paleGold])

    // Տվյալների ստացում API-ից
    const { data: jobsResult, isLoading } = useQuery({
        queryKey: ['jobs', debouncedSearch],
        queryFn: async () => {
            if (debouncedSearch.trim() === '') {
                return await getJobs()
            }
            const result = await searchJobs({ q: debouncedSearch, limit: 200 })
            return Array.isArray(result) ? result : (result as any).items || []
        },
    })

    // Ֆիլտրման տրամաբանություն
    const filteredJobs = useMemo(() => {
        const jobs = jobsResult || []
        return jobs.filter((job: any) => {
            const matchRegion = !filters.region || (job.location || '').includes(filters.region)
            const matchLevel = !filters.level || (job.title || '').includes(filters.level)
            return matchRegion && matchLevel
        })
    }, [jobsResult, filters])

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: colors.paleGold,
            fontFamily: 'sans-serif',
            color: colors.deepBrown,
            padding: 0
        }}>

            {/* --- HERO SECTION: FULL WIDTH --- */}
            <div style={{
                width: '100%',
                height: '450px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}>
                <img
                    src={heroBg}
                    alt="Hero Background"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1
                    }}
                />

                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '30px',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '56px',
                        fontWeight: '900',
                        color: colors.brightGold,
                        textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        MyJobs
                    </h1>
                    <p style={{ fontSize: '24px', fontWeight: '600', color: colors.white }}>
                        Գտեք Ձեր երազանքի աշխատանքը
                    </p>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div style={{ maxWidth: '1200px', margin: '-60px auto 0', padding: '0 20px 60px', position: 'relative', zIndex: 10 }}>

                {/* SEARCH BOX */}
                <div style={{
                    background: colors.white,
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: `1px solid ${colors.brightGold}`,
                    marginBottom: '40px'
                }}>
                    <input
                        type="text"
                        placeholder="Որոնել..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '15px 25px', border: `2px solid ${colors.brightGold}`,
                            borderRadius: '50px', fontSize: '17px', outline: 'none'
                        }}
                    />
                </div>

                {/* JOBS LIST RENDERING[cite: 1] */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>⏳ Բեռնվում է...</p>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job: any) => (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                style={{
                                    background: colors.white, borderRadius: '20px', padding: '25px',
                                    border: '1px solid #eee', cursor: 'pointer', transition: '0.3s'
                                }}
                            >
                                <h3 style={{ color: colors.deepBrown, marginBottom: '10px' }}>{job.title}</h3>
                                <p style={{ color: colors.softBrown }}>🏢 {job.company}</p>
                                <div style={{ marginTop: '15px' }}>
                                    <span style={{ background: colors.paleGold, padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>
                                         {job.location || 'Երևան'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>🔍 Աշխատանքներ չգտնվեցին</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Jobs