// import React from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { getJobById } from '../services/jobs'
// import api from '../services/api'
//
// // --- ԽԵԼԱՑԻ ՖԻԼՏՐ (Ուղղված է TypeScript-ի սխալը) ---
// // Ավելացրել ենք ? նշանը (text?: string), որպեսզի այն ընդունի նաև undefined
// const cleanAndFormatDescription = (text?: string) => {
//     if (!text) return 'Նկարագրությունը բացակայում է:';
//
//     let result = text;
//
//     // 1. Գտնում ենք բուն նկարագրության սկիզբը և կտրում ենք վերևի ողջ աղբը
//     const startRegex = /(Job Description:|Job responsibilities:|Required qualifications:|Աշխատանքի նկարագրություն:|Պարտականություններ:|Описание работы:)/i;
//     const startMatch = result.match(startRegex);
//     if (startMatch && startMatch.index !== undefined) {
//         result = result.substring(startMatch.index);
//     } else {
//         const langMenu = result.match(/ՀԱՅ\n/);
//         if (langMenu && langMenu.index !== undefined) {
//             result = result.substring(langMenu.index + 4);
//         }
//     }
//
//     // 2. Կտրում ենք ներքևի աղբը
//     const endRegex = /(Apply Now\s*Your application|Դիմել հիմա|First name\*|To apply by email|Salary\n.*USD|Learn more about this company|Professional Skills\nAdobe)/i;
//     const endMatch = result.match(endRegex);
//     if (endMatch && endMatch.index !== undefined) {
//         result = result.substring(0, endMatch.index);
//     }
//
//     // 3. Գեղեցկացնում ենք ենթավերնագրերը
//     const headers = [
//         "Job Description:", "Job responsibilities:", "Required qualifications:",
//         "Additional Information:", "Professional Skills", "Soft skills",
//         "Աշխատանքի նկարագրություն:", "Պարտականություններ:", "Պահանջվող որակավորումներ:",
//         "Обязанности:", "Требования:", "What You Will Actually Create", "Who We Are Looking For", "What We Offer", "How To Apply"
//     ];
//
//     headers.forEach(header => {
//         const regex = new RegExp(`(${header})`, 'gi');
//         result = result.replace(regex, '<br/><br/><strong style="color: #667eea; font-size: 18px; display: block; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">$1</strong>');
//     });
//
//     // 4. Սարքում ենք նոր տողերը
//     result = result.replace(/\n/g, '<br/>');
//
//     // 5. Մաքրում ենք ավելորդ դատարկ տողերը
//     result = result.replace(/(<br\/>\s*){3,}/g, '<br/><br/>');
//
//     return result.trim();
// }
//
// const VacancyDetail: React.FC = () => {
//     const { id } = useParams<{ id: string }>()
//     const navigate = useNavigate()
//
//     const { data, isLoading, error } = useQuery({
//         queryKey: ['job', id],
//         queryFn: () => getJobById(id!),
//         enabled: !!id,
//     })
//
//     const handleSaveJob = async () => {
//         if (!data) return;
//         try {
//             const token = localStorage.getItem('token');
//             await api.post('/save-job', { job_id: data.id }, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             alert('Աշխատանքը հաջողությամբ պահպանվեց Ձեր էջում!');
//         } catch (error) {
//             console.error("Չհաջողվեց պահպանել", error);
//             alert('Խնդրում ենք մուտք գործել համակարգ աշխատանքը պահելու համար:');
//         }
//     };
//
//     if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Բեռնվում է...</div>
//     if (error || !data) return <div style={{ padding: '40px', textAlign: 'center' }}>❌ Աշխատանքը չի գտնվել</div>
//
//     // Ապահովագրում ենք կանչը դատարկ տողով ("")
//     const formattedDesc = cleanAndFormatDescription(data.full_description || data.description || "");
//
//     return (
//         <div style={{ maxWidth: '900px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
//
//             <button
//                 onClick={() => navigate(-1)}
//                 style={{ marginBottom: '24px', padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
//             >
//                 ← Հետ
//             </button>
//
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
//                 <h2 style={{ margin: 0, color: '#333', fontSize: '26px', lineHeight: '1.4' }}>{data.title}</h2>
//                 <button
//                     onClick={handleSaveJob}
//                     title="Պահել աշխատանքը"
//                     style={{
//                         background: '#fff', border: '2px solid #ff9800', borderRadius: '50%',
//                         width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: '22px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, marginLeft: '16px'
//                     }}
//                 >
//                     🔖
//                 </button>
//             </div>
//
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #eee' }}>
//                 <div>
//                     <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Ընկերություն</p>
//                     <h3 style={{ margin: 0, color: '#764ba2', fontSize: '18px' }}>{data.company || 'Չի նշված'}</h3>
//                 </div>
//                 <div>
//                     <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Վայր</p>
//                     <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>📍 {data.location || 'Չի նշված'}</p>
//                 </div>
//                 <div>
//                     <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Աշխատավարձ</p>
//                     <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#4caf50' }}>💰 {data.salary_range || 'Negotiable'}</p>
//                 </div>
//             </div>
//
//             {/* ՄԱՔՐՎԱԾ ԵՎ ԳԵՂԵՑԿԱՑՎԱԾ ՆԿԱՐԱԳՐՈՒԹՅՈՒՆ */}
//             <div>
//                 <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '20px' }}>📋 Նկարագրություն և Պահանջներ</h3>
//                 <div
//                     style={{
//                         background: '#f8f9fa',
//                         padding: '24px',
//                         borderRadius: '8px',
//                         color: '#34495e',
//                         lineHeight: '1.8',
//                         fontSize: '15px',
//                         border: '1px solid #e0e0e0',
//                         overflowWrap: 'break-word'
//                     }}
//                     dangerouslySetInnerHTML={{ __html: formattedDesc }}
//                 />
//             </div>
//
//             {/* ՀԵՌԱԽՈՍԱՀԱՄԱՐԸ ՁԱԽ ԿՈՂՄՈՒՄ */}
//             <div style={{ marginTop: '32px', textAlign: 'left' }}>
//                 <button
//                     style={{
//                         padding: '14px 32px',
//                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '8px',
//                         fontSize: '16px',
//                         fontWeight: 'bold',
//                         cursor: 'pointer',
//                         boxShadow: '0 4px 6px rgba(102, 126, 234, 0.4)'
//                     }}
//                 >
//                     {data.phone_number ? `📞 ${data.phone_number}` : '📞 Հեռախոսահամարը նշված չէ'}
//                 </button>
//             </div>
//         </div>
//     )
// }
//
// export default VacancyDetail


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

// Եթե ունես առանձնացված Hero, Footer կոմպոնենտներ, կարող ես ապամեկնաբանել այս տողերը
// import Hero from '../components/Hero';
// import ProfessionsSection from '../components/ProfessionsSection';
// import Footer from '../components/Footer';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    salary_range: string;
    description: string;
}

const VacancyList: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    // API-ից տվյալների բեռնման ֆունկցիա
    const fetchJobs = async (): Promise<Job[]> => {
        const res = await api.get('/jobs');
        return res.data || [];
    };

    // React Query v5 սինտաքս
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs'],
        queryFn: fetchJobs,
    });

    // Որոնման լոգիկա (ըստ վերնագրի կամ ընկերության)
    const filteredJobs = jobs?.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f5f7fa)', display: 'flex', flexDirection: 'column' }}>

            {/* Եթե ունես Hero Section կամ ProfessionsSection, դրանք կգան այստեղ */}
            {/* <Hero /> */}
            {/* <ProfessionsSection /> */}

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', width: '100%', flexGrow: 1 }}>

                {/* Որոնման Բաժին */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px', fontWeight: 'bold' }}>
                        {t('jobs.browse', 'Գտեք Ձեր Երազանքի Աշխատանքը')}
                    </h2>
                    <input
                        type="text"
                        placeholder={t('jobs.searchPlaceholder', 'Որոնել ըստ մասնագիտության կամ ընկերության...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '600px',
                            padding: '16px 24px',
                            borderRadius: '50px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            fontSize: '16px',
                            outline: 'none',
                            transition: 'box-shadow 0.3s'
                        }}
                    />
                </div>

                {/* Բեռնման վիճակ */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
                        ⏳ Բեռնվում են աշխատանքները...
                    </div>
                )}

                {/* Սխալի վիճակ */}
                {error && (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#c62828' }}>
                        ❌ Տվյալների բեռնման սխալ տեղի ունեցավ: Ստուգեք կապը սերվերի հետ:
                    </div>
                )}

                {/* Աշխատանքների Ցուցակ */}
                {!isLoading && !error && (
                    <>
                        <div style={{ marginBottom: '20px', color: '#666', fontWeight: '500' }}>
                            Գտնվել է <span style={{ color: '#667eea', fontWeight: 'bold' }}>{filteredJobs.length}</span> աշխատանք
                        </div>

                        {filteredJobs.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '24px'
                            }}>
                                {filteredJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                        style={{
                                            background: '#fff',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                            cursor: 'pointer',
                                            border: '1px solid #eaeaea',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.1)';
                                            e.currentTarget.style.borderColor = '#667eea';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                                            e.currentTarget.style.borderColor = '#eaeaea';
                                        }}
                                    >
                                        <div>
                                            <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '20px', lineHeight: '1.4' }}>
                                                {job.title}
                                            </h3>
                                            <p style={{ margin: '0 0 16px 0', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                🏢 {job.company || 'Ընկերությունը նշված չէ'}
                                            </p>

                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                                <span style={{ background: '#f0f4f8', color: '#4a5568', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>
                                                    📍 {job.location || 'Հեռավար'}
                                                </span>
                                                <span style={{ background: '#e6fffa', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                                                    💰 {job.salary_range || 'Պայմանագրային'}
                                                </span>
                                            </div>

                                            <p style={{
                                                color: '#718096',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {job.description ? job.description.replace(/(<([^>]+)>)/gi, "") : 'Նկարագրությունը բացակայում է...'}
                                            </p>
                                        </div>

                                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                                            <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '14px' }}>
                                                Դիտել մանրամասները →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px dashed #ccc' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Աշխատանք չի գտնվել</h3>
                                <p style={{ color: '#666', margin: 0 }}>Փորձեք փոխել որոնման բառերը կամ դատարկել որոնման դաշտը:</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* <Footer /> */}
        </div>
    );
}

export default VacancyList;