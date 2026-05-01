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
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

            <div>
                <h3 className="text-xl font-bold text-slate-800 text-center">Tu Gráfica de la Vida</h3>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                </div>
            ) : isError || isEmpty ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
                    <p className="text-sm font-semibold text-slate-700 leading-snug">
                        Completa tu pasaporte para ver tu gráfica
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
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
