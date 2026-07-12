import { useState, useEffect } from 'react';
import { C } from '../../styles/colors';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');
const CHALLENGE_START = new Date('2026-06-01T00:00:00.000-05:00');

function useCountdown(target: Date) {
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(Math.max(0, target.getTime() - Date.now()));
        }, 1000);
        return () => clearInterval(interval);
    }, [target]);

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, done: timeLeft === 0 };
}

export const ChallengeProgressCard = () => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const countdown = useCountdown(CHALLENGE_START);

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

    // Estado bloqueado — tarea completada pero reto aún no arranca
    if (!data.challengeStarted) {
        return (
            <div className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-4 relative overflow-hidden" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: '#EF9F27' }} />

                <div className="relative z-10 flex flex-col items-center text-center gap-4 py-2 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#EF9F27' }}>
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>

                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#EF9F27' }}>Reto: Desde Aquí</p>

                    {!countdown.done && (
                        <div className="flex gap-3">
                            {[
                                { value: countdown.days, label: 'días' },
                                { value: countdown.hours, label: 'horas' },
                                { value: countdown.minutes, label: 'min' },
                                { value: countdown.seconds, label: 'seg' },
                            ].map(({ value, label }) => (
                                <div key={label} className="flex flex-col items-center">
                                    <span className="text-2xl font-bold tabular-nums w-12 text-center rounded-xl py-1.5" style={{ color: '#F5F0E8', background: '#252020' }}>
                                        {String(value).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] mt-1 font-medium" style={{ color: '#A8A29E' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                        ¡Ya completaste el punto de partida de tu reto! El conteo de progreso comienza el lunes 1 de junio. <span className="font-bold" style={{ color: '#EF9F27' }}>#YouOwnIt</span>
                    </p>
                </div>
            </div>
        );
    }

    const { weekNumber, minutesThisWeek, goalMinutes, percentage, activeDays, minimoViable } = data;
    const pct = percentage ?? 0;
    const barWidth = Math.min(100, pct);
    const exceeded = pct > 100;

    return (
        <>
            <div className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col gap-4 relative overflow-hidden" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: C.red }} />

                <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: C.red }}>
                        Reto Desde Aquí · Semana {weekNumber}
                    </p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Tu progreso semanal</h3>
                        <button
                            onClick={() => setIsInfoOpen(true)}
                            className="transition-colors flex-shrink-0"
                            style={{ color: '#666' }}
                            aria-label="¿Qué significa esto?"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <path d="M12 17h.01"/>
                            </svg>
                        </button>
                    </div>
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

                    {minimoViable && (
                        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: '#252020' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ color: '#A8A29E' }}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#A8A29E' }}>Tu mínimo viable</p>
                                <p className="text-sm font-bold text-red-400">{minimoViable}</p>
                            </div>
                        </div>
                    )}

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

            {isInfoOpen && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    style={{ background: '#000000b3', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsInfoOpen(false)}
                >
                    <div
                        className="rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in-up border"
                        style={{ background: '#1E1A1B', borderColor: '#333330' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setIsInfoOpen(false)} className="absolute top-4 right-4 transition-colors" style={{ color: '#A8A29E' }}>
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold mb-4" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Tu progreso semanal</h3>
                        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                            <p>Esta tarjeta muestra cómo vas en tu <strong style={{ color: '#F5F0E8' }}>Reto Desde Aquí de 8 semanas</strong>. Todo se reinicia cada lunes.</p>
                            <ul className="space-y-3 mt-2">
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: C.red }}></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>Porcentaje</strong> — minutos registrados vs tu meta. Llegar al 100% es el reto. Superarlo, es el extra.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: C.red }}></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>Min registrados</strong> — suma de todos los minutos de actividad física que registraste esta semana.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: C.red }}></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>Meta</strong> — los minutos semanales que te comprometiste a mover. Puedes ajustarla cada lunes.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>Mínimo viable</strong> — cuando la semana se complica, este es tu piso mínimo. No negociable.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#666' }}></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>Días activos</strong> — cuántos días de esta semana (lunes a domingo) registraste al menos una actividad.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
