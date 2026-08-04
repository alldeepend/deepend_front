import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { C } from '../../styles/colors';
import { weeklyChallengeApi } from '../../services/weeklyChallenge';

export const WeeklyChallengeProgressCard = () => {
    const navigate = useNavigate();

    const { data: me, isLoading } = useQuery({
        queryKey: ['weekly-challenge-me'],
        queryFn: weeklyChallengeApi.getMe,
    });

    const { data: progress } = useQuery({
        queryKey: ['weekly-challenge-progress'],
        queryFn: weeklyChallengeApi.getProgress,
        enabled: !!me?.isParticipant && !me?.needsIntro && !me?.showGoalPopup,
    });

    if (isLoading) return null;

    if (!me?.isParticipant) {
        return (
            <div
                className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden"
                style={{ background: '#1E1A1B', borderColor: '#333330' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: C.red }} />
                <p className="text-xs font-semibold uppercase tracking-wide relative z-10" style={{ color: C.red }}>Reto Semanal</p>
                <h3 className="text-lg font-bold relative z-10" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                    A tu ritmo, sin fecha de cierre
                </h3>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: '#A8A29E' }}>
                    Ponte una meta semanal y registra tu movimiento. Cada 12 semanas, revisas tu punto de partida de nuevo.
                </p>
                <button
                    onClick={() => navigate('/reto-semanal')}
                    className="relative z-10 mt-1 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: C.red }}
                >
                    Comenzar mi reto
                </button>
            </div>
        );
    }

    // Arrancó un ciclo global nuevo — hay que responder el cuestionario de nuevo
    if (me.needsIntro && me.isRetake) {
        return (
            <div
                className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden"
                style={{ background: '#1E1A1B', borderColor: '#333330' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: '#EF9F27' }} />
                <p className="text-xs font-semibold uppercase tracking-wide relative z-10" style={{ color: '#EF9F27' }}>Reto Semanal · Ciclo {me.cycleNumber}</p>
                <h3 className="text-lg font-bold relative z-10" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                    Empezó un nuevo ciclo de 12 semanas
                </h3>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: '#A8A29E' }}>
                    Responde de nuevo tu punto de partida para seguir.
                </p>
                <button
                    onClick={() => navigate('/reto-semanal')}
                    className="relative z-10 mt-1 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: '#EF9F27', color: '#161211' }}
                >
                    Empezar el siguiente ciclo
                </button>
            </div>
        );
    }

    if (me.showGoalPopup || !progress?.isParticipant) {
        return (
            <div
                className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden"
                style={{ background: '#1E1A1B', borderColor: '#333330' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: '#EF9F27' }} />
                <p className="text-xs font-semibold uppercase tracking-wide relative z-10" style={{ color: '#EF9F27' }}>Reto Semanal · Semana {me.weekNumber}</p>
                <h3 className="text-lg font-bold relative z-10" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                    Falta confirmar tu meta
                </h3>
                <button
                    onClick={() => navigate('/reto-semanal')}
                    className="relative z-10 mt-1 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: '#EF9F27', color: '#161211' }}
                >
                    Poner mi meta
                </button>
            </div>
        );
    }

    const { weekNumber, minutesThisWeek, goalMinutes, percentage, activeDays } = progress;
    const pct = percentage ?? 0;
    const barWidth = Math.min(100, pct);
    const exceeded = pct > 100;

    return (
        <div className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col justify-center gap-4 relative overflow-hidden" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: C.red }} />

            <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: C.red }}>
                    Reto Semanal · Semana {weekNumber} de 12
                </p>
                <button onClick={() => navigate('/reto-semanal')} className="text-left">
                    <h3 className="text-xl font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Tu progreso semanal</h3>
                </button>
            </div>

            <div className="relative z-10 space-y-3">
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold" style={{ color: exceeded ? C.red : '#F5F0E8' }}>
                        {pct}%
                    </span>
                    {exceeded && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full mb-1" style={{ color: C.red, background: '#EE2A2822' }}>
                            ¡Meta superada!
                        </span>
                    )}
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#252020' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, background: C.red }}
                    />
                </div>

                <div className="flex justify-between text-sm" style={{ color: '#A8A29E' }}>
                    <span>
                        <span className="font-semibold" style={{ color: C.red }}>{minutesThisWeek} min</span> registrados
                    </span>
                    {goalMinutes && (
                        <span>Meta: <span className="font-semibold" style={{ color: C.red }}>{goalMinutes} min</span></span>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: '#333330' }}>
                    <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors"
                                style={i < (activeDays ?? 0)
                                    ? { background: C.red, color: '#fff' }
                                    : { background: '#252020', color: '#666' }}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs ml-1" style={{ color: '#A8A29E' }}>
                        <span className="font-semibold" style={{ color: '#F5F0E8' }}>{activeDays ?? 0}</span> de 7 días
                    </span>
                </div>
            </div>
        </div>
    );
};
