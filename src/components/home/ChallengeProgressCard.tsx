import { useQuery } from '@tanstack/react-query';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

export const ChallengeProgressCard = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['challenge-progress'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenge/progress/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json();
        }
    });

    if (isLoading || !data?.isParticipant) return null;

    const { weekNumber, minutesThisWeek, goalMinutes, percentage } = data;
    const pct = percentage ?? 0;
    const barWidth = Math.min(100, pct);
    const exceeded = pct > 100;

    return (
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 opacity-60" />

            <div className="relative z-10">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
                    Reto Físico · Semana {weekNumber}
                </p>
                <h3 className="text-xl font-bold text-slate-800">Tu progreso semanal</h3>
            </div>

            <div className="relative z-10 space-y-3">
                {/* Percentage display */}
                <div className="flex items-end justify-between">
                    <span className={`text-4xl font-bold ${exceeded ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {pct}%
                    </span>
                    {exceeded && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mb-1">
                            ¡Meta superada!
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${exceeded ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                        style={{ width: `${barWidth}%` }}
                    />
                </div>

                {/* Minutes */}
                <div className="flex justify-between text-sm text-slate-500">
                    <span>
                        <span className="font-semibold text-slate-700">{minutesThisWeek} min</span> registrados
                    </span>
                    {goalMinutes && (
                        <span>Meta: <span className="font-semibold text-slate-700">{goalMinutes} min</span></span>
                    )}
                </div>
            </div>
        </div>
    );
};
