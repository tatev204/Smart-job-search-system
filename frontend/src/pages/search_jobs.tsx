import React, { useState } from 'react';
import api from '../services/api'; // Օգտագործում է քո սահմանած axios service-ը

const SearchJobs: React.FC = () => {
    const [query, setQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ֆունկցիա, որը կատարում է հարցումը դեպի բեքենդ
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setAiResponse(null);

        try {
            // Կանչում ենք GET /ai/elastic-search?q=...
            const res = await api.get('/ai/elastic-search', {
                params: { q: query }
            });

            // Բեքենդը վերադարձնում է {"ai_response": "..."}
            if (res.data && res.data.ai_response) {
                setAiResponse(res.data.ai_response);
            } else {
                setAiResponse("Արդյունք չգտնվեց:");
            }
        } catch (err: any) {
            setError("Սերվերի սխալ: Համոզվեք, որ Go բեքենդը աշխատում է 8088 պորտի վրա:");
        } finally {
            setIsLoading(false);
        }
    };

    // Ֆունկցիա տեքստի ֆորմատավորման համար (համարժեք Postman-ի արդյունքին)
    const formatText = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> bold
            .replace(/\n/g, '<br/>'); // \n -> new line
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>🤖 AI Խելացի Որոնում</h2>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Գրեք Ձեր հարցումը (օր.՝ Risk Management Specialist)..."
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Քո նախընտրած գրադիենտը
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        {isLoading ? '⏳' : 'Որոնել'}
                    </button>
                </form>

                {error && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{error}</p>}

                {aiResponse && (
                    <div style={{
                        marginTop: '30px',
                        padding: '20px',
                        background: '#f9f9f9',
                        borderRadius: '10px',
                        borderLeft: '5px solid #667eea',
                        lineHeight: '1.6'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#764ba2' }}>Արդյունք՝</h4>
                        <div
                            style={{ color: '#444' }}
                            dangerouslySetInnerHTML={{ __html: formatText(aiResponse) }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchJobs;