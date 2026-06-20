import { useQuery } from '@tanstack/react-query';
import { MiradasSlider } from './MiradasSlider';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

export const StatsCard = () => {
    const { data: miradas, isLoading, isError } = useQuery({
        queryKey: ['balance-chart-history'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/user/balance-chart-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch chart history');
            return await res.json();
        }
    });

    const isEmpty = !isLoading && !isError && Array.isArray(miradas) && miradas.length === 0;

    return (
        <div className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col justify-between relative overflow-hidden" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-20" style={{ background: '#52B788' }}></div>

            <div>
                <h3 className="text-xl font-bold text-center" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Tu Gráfica de la Vida</h3>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin h-6 w-6 rounded-full border-2 border-t-transparent" style={{ borderColor: '#52B788', borderTopColor: 'transparent' }}></div>
                </div>
            ) : isError || isEmpty ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
                    <p className="text-sm font-semibold leading-snug" style={{ color: '#F5F0E8' }}>
                        Completa tu pasaporte para ver tu gráfica
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#A8A29E' }}>
                        Responde las áreas de tu vida y tu mapa tomará forma aquí.
                    </p>
                </div>
            ) : (
                <div className="relative z-10">
                    <MiradasSlider miradas={miradas} />
                </div>
            )}
        </div>
    );
};
