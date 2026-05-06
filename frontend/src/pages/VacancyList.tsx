import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const VacancyList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [category, setCategory] = useState('all');
    const [specialTag, setSpecialTag] = useState('all');
    const [level, setLevel] = useState('all');
    const [salaryStatus, setSalaryStatus] = useState('all');
    const [jobType, setJobType] = useState('all');
    const [condition, setCondition] = useState('all');
    const [city, setCity] = useState('all');

    const theme = {
        navy: '#2F4156', teal: '#567C8D', skyBlue: '#C8D9E6',
        beige: '#F5EFEB', white: '#FFFFFF'
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['vacancies'],
        queryFn: async () => {
            const res = await api.get('/jobs');
            return res.data || [];
        }
    });

    const filteredVacancies = useMemo(() => {
        return jobs.filter((job: any) => {
            // 🚀 ՄԻԱԿ ՓՈՓՈԽՈՒԹՅՈՒՆԸ. Որոնման ստուգում
            const searchLower = debouncedSearch.toLowerCase();
            const jobTitle = (job.title || '').toLowerCase();
            const jobCompany = (job.company || '').toLowerCase();

            if (debouncedSearch && !jobTitle.includes(searchLower) && !jobCompany.includes(searchLower)) {
                return false;
            }

            // ՄՆԱՑԱԾ ԲՈԼՈՐ ՖԻԼՏՐԵՐԸ ՄՆՈՒՄ ԵՆ ԱՆՓՈՓՈԽ[cite: 3]
            const jobDesc = (job.description || '').toLowerCase();
            const jobLoc = (job.location || '').toLowerCase();
            const jobSalary = (job.salary_range || '').toLowerCase();

            if (category !== 'all' && !jobTitle.includes(category.toLowerCase()) && !jobDesc.includes(category.toLowerCase())) return false;
            if (specialTag !== 'all' && !jobDesc.includes(specialTag.toLowerCase())) return false;
            if (level !== 'all' && !jobTitle.includes(level.toLowerCase()) && !jobDesc.includes(level.toLowerCase())) return false;
            if (salaryStatus === 'specified' && (!jobSalary || jobSalary.includes('պայմանագրային') || jobSalary.includes('negotiable'))) return false;
            if (salaryStatus === 'unspecified' && jobSalary && !jobSalary.includes('պայմանագրային') && !jobSalary.includes('negotiable')) return false;
            if (jobType !== 'all' && !jobTitle.includes(jobType.toLowerCase()) && !jobDesc.includes(jobType.toLowerCase())) return false;
            if (condition !== 'all' && !jobDesc.includes(condition.toLowerCase()) && !jobTitle.includes(condition.toLowerCase())) return false;
            if (city !== 'all') {
                if (city !== 'Հայաստան (Բոլոր քաղաքները)' && !jobLoc.includes(city.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });
    }, [jobs, debouncedSearch, category, specialTag, level, salaryStatus, jobType, condition, city]);

    const clearFilters = () => {
        setSearchTerm(''); setCategory('all'); setSpecialTag('all');
        setLevel('all'); setSalaryStatus('all'); setJobType('all');
        setCondition('all'); setCity('all');
    };

    const hasActiveFilters = searchTerm || category !== 'all' || specialTag !== 'all' || level !== 'all' || salaryStatus !== 'all' || jobType !== 'all' || condition !== 'all' || city !== 'all';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', color: theme.navy, marginBottom: '30px', fontSize: '36px', fontWeight: '800' }}>
                Գտեք Ձեր Երազանքի Աշխատանքը
            </h2>

            <div style={{ background: theme.white, padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(47, 65, 86, 0.05)', border: `1px solid ${theme.skyBlue}`, marginBottom: '40px' }}>
                <input
                    type="text"
                    placeholder="Որոնել ըստ պաշտոնի կամ ընկերության անվանման..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '16px 25px', borderRadius: '15px', border: `2px solid ${theme.skyBlue}`, outline: 'none', fontSize: '16px', marginBottom: '25px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Աշխատանքի կատեգորիա</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլոր կատեգորիաները</option>
                            <option value="Վաճառք">Վաճառքի/սպասարկման կազմակերպում</option>
                            <option value="Բանկային">Բանկային/Վարկային</option>
                            <option value="Մարքեթինգ">Մարքեթինգ/Գովազդ</option>
                            <option value="Ադմինիստրատիվ">Ադմինիստրատիվ/օֆիսային</option>
                            <option value="Հաշվապահություն">Հաշվապահություն/Հաշվետարություն/Դրամարկղ</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Հատուկ թեգեր</label>
                        <select value={specialTag} onChange={(e) => setSpecialTag(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլորը</option>
                            <option value="Բակալավր">Բակալավրի աստիճան</option>
                            <option value="Ուսուցում">Ուսուցումը տրամադրվում է</option>
                            <option value="Նորավարտին">Նորավարտին հարմար</option>
                            <option value="Վկայական">Մասնագիտական վկայական</option>
                            <option value="Ճկուն գրաֆիկ">Ճկուն գրաֆիկ</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Մասնագետի մակարդակ</label>
                        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլոր մակարդակները</option>
                            <option value="Ուսանող">Ուսանող</option>
                            <option value="Կրտսեր">Կրտսեր (Junior)</option>
                            <option value="Միջին">Միջին մակարդակ (Mid)</option>
                            <option value="Ավագ">Ավագ (Senior)</option>
                            <option value="C մակարդակ">C մակարդակ (C-level)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Աշխատավարձ</label>
                        <select value={salaryStatus} onChange={(e) => setSalaryStatus(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլորը</option>
                            <option value="specified">Նշված է</option>
                            <option value="unspecified">Նշված չէ</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Աշխատանքի տեսակ</label>
                        <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլոր տեսակները</option>
                            <option value="Ամբողջ դրույք">Ամբողջ դրույք</option>
                            <option value="Կես դրույք">Կես դրույք</option>
                            <option value="Պրակտիկա">Պրակտիկա</option>
                            <option value="Թրեյնինգ">Թրեյնինգ</option>
                            <option value="Ժամկետային">Ժամկետային պայմանագիր</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Աշխատանքի պայմաններ</label>
                        <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլոր պայմանները</option>
                            <option value="Մշտական">Մշտական</option>
                            <option value="Ժամանակավոր">Ժամանակավոր</option>
                            <option value="Ֆրիլանս">Ֆրիլանս</option>
                            <option value="Պայմանագրային">Պայմանագրային</option>
                            <option value="Այլ">Այլ</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: theme.navy, fontWeight: '600', fontSize: '14px' }}>Քաղաք</label>
                        <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.skyBlue}`, outline: 'none', cursor: 'pointer' }}>
                            <option value="all">Բոլոր քաղաքները</option>
                            <option value="Երևան">Երևան</option>
                            <option value="Գյումրի">Գյումրի</option>
                            <option value="Աբովյան">Աբովյան</option>
                            <option value="Վանաձոր">Վանաձոր</option>
                            <option value="Հայաստան">Հայաստան (Բոլոր քաղաքները)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', borderTop: `1px solid ${theme.skyBlue}`, paddingTop: '20px' }}>
                    <div style={{ color: theme.teal, fontWeight: '700', fontSize: '16px' }}>
                        Գտնվել է {filteredVacancies.length} աշխատանք
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            ✖ Մաքրել ֆիլտրերը
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: theme.teal }}>⏳ Բեռնվում է...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                    {filteredVacancies.map((job: any) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ background: theme.white, padding: '25px', borderRadius: '20px', border: `1px solid ${theme.skyBlue}`, transition: '0.3s' }}>
                                <h3 style={{ color: theme.navy, margin: '0 0 10px 0', fontSize: '20px' }}>{job.title}</h3>
                                <p style={{ color: theme.teal, fontWeight: '500' }}>🏢 {job.company || 'Չի նշված'}</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <span style={{ background: theme.beige, padding: '6px 14px', borderRadius: '10px', fontSize: '13px' }}>📍 {job.location || 'Հայաստան'}</span>
                                    <span style={{ background: '#E8F1F8', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', color: '#2D82B7' }}>💰 {job.salary_range || 'Պայմանագրային'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VacancyList;