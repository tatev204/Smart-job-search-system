import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJobById } from '../services/jobs'
import api from '../services/api'

// --- ԽԵԼԱՑԻ ՖԻԼՏՐ (Ուղղված է TypeScript-ի սխալը) ---
const cleanAndFormatDescription = (text?: string) => {
    if (!text) return 'Նկարագրությունը բացակայում է:';

    let result = text;

    // 1. Գտնում ենք բուն նկարագրության սկիզբը և կտրում ենք վերևի ողջ աղբը (մենյուները, դիտումները)
    const startRegex = /(Job Description:|Job responsibilities:|Required qualifications:|Աշխատանքի նկարագրություն:|Պարտականություններ:|Описание работы:)/i;
    const startMatch = result.match(startRegex);
    if (startMatch && startMatch.index !== undefined) {
        result = result.substring(startMatch.index);
    } else {
        // Եթե ստանդարտ վերնագիր չկա, գոնե կտրենք staff.am-ի լեզուների մենյուն
        const langMenu = result.match(/ՀԱՅ\n/);
        if (langMenu && langMenu.index !== undefined) {
            result = result.substring(langMenu.index + 4);
        }
    }

    // 2. Կտրում ենք ներքևի աղբը (դիմելու ֆորմաները, input-ները)
    const endRegex = /(Apply Now\s*Your application|Դիմել հիմա|First name\*|To apply by email|Salary\n.*USD|Learn more about this company|Professional Skills\nAdobe)/i;
    const endMatch = result.match(endRegex);
    if (endMatch && endMatch.index !== undefined) {
        result = result.substring(0, endMatch.index);
    }

    // 3. Գեղեցկացնում ենք ենթավերնագրերը՝ դարձնելով դրանք մեծ և գունավոր
    const headers = [
        "Job Description:", "Job responsibilities:", "Required qualifications:",
        "Additional Information:", "Professional Skills", "Soft skills",
        "Աշխատանքի նկարագրություն:", "Պարտականություններ:", "Պահանջվող որակավորումներ:",
        "Обязанности:", "Требования:", "What You Will Actually Create", "Who We Are Looking For", "What We Offer", "How To Apply"
    ];

    headers.forEach(header => {
        const regex = new RegExp(`(${header})`, 'gi');
        result = result.replace(regex, '<br/><br/><strong style="color: #667eea; font-size: 18px; display: block; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">$1</strong>');
    });

    // 4. Սարքում ենք նոր տողերը (<br/>)
    result = result.replace(/\n/g, '<br/>');

    // 5. Մաքրում ենք ավելորդ դատարկ տողերը
    result = result.replace(/(<br\/>\s*){3,}/g, '<br/><br/>');

    return result.trim();
}

const VacancyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data, isLoading, error } = useQuery({
        queryKey: ['job', id],
        queryFn: () => getJobById(id!),
        enabled: !!id,
    })

    const handleSaveJob = async () => {
        if (!data) return;
        try {
            const token = localStorage.getItem('token');
            await api.post('/save-job', { job_id: data.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Աշխատանքը հաջողությամբ պահպանվեց Ձեր էջում!');
        } catch (error) {
            console.error("Չհաջողվեց պահպանել", error);
            alert('Խնդրում ենք մուտք գործել համակարգ աշխատանքը պահելու համար:');
        }
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Բեռնվում է...</div>
    if (error || !data) return <div style={{ padding: '40px', textAlign: 'center' }}>❌ Աշխատանքը չի գտնվել</div>

    // Կիրառում ենք մեր խելացի ֆիլտրը (Այլևս չի տա TypeScript-ի սխալ)
    const formattedDesc = cleanAndFormatDescription(data.full_description || data.description || "");

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

            <button
                onClick={() => navigate(-1)}
                style={{ marginBottom: '24px', padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
                ← Հետ
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#333', fontSize: '26px', lineHeight: '1.4' }}>{data.title}</h2>
                <button
                    onClick={handleSaveJob}
                    title="Պահել աշխատանքը"
                    style={{
                        background: '#fff', border: '2px solid #ff9800', borderRadius: '50%',
                        width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, marginLeft: '16px'
                    }}
                >
                    🔖
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #eee' }}>
                <div>
                    <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Ընկերություն</p>
                    <h3 style={{ margin: 0, color: '#764ba2', fontSize: '18px' }}>{data.company || 'Չի նշված'}</h3>
                </div>
                <div>
                    <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Վայր</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>📍 {data.location || 'Չի նշված'}</p>
                </div>
                <div>
                    <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Աշխատավարձ</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#4caf50' }}>💰 {data.salary_range || 'Negotiable'}</p>
                </div>
            </div>

            {/* ՄԱՔՐՎԱԾ ԵՎ ԳԵՂԵՑԿԱՑՎԱԾ ՆԿԱՐԱԳՐՈՒԹՅՈՒՆ */}
            <div>
                <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '20px' }}>📋 Նկարագրություն և Պահանջներ</h3>
                <div
                    style={{
                        background: '#f8f9fa',
                        padding: '24px',
                        borderRadius: '8px',
                        color: '#34495e',
                        lineHeight: '1.8',
                        fontSize: '15px',
                        border: '1px solid #e0e0e0',
                        overflowWrap: 'break-word'
                    }}
                    dangerouslySetInnerHTML={{ __html: formattedDesc }}
                />
            </div>

            {/* ՀԵՌԱԽՈՍԱՀԱՄԱՐԸ ՁԱԽ ԿՈՂՄՈՒՄ */}
            <div style={{ marginTop: '32px', textAlign: 'left' }}>
                <button
                    style={{
                        padding: '14px 32px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(102, 126, 234, 0.4)'
                    }}
                >
                    {data.phone_number ? `📞 ${data.phone_number}` : '📞 Հեռախոսահամարը նշված չէ'}
                </button>
            </div>
        </div>
    )
}

export default VacancyDetail