import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { C } from '../../styles/colors';
import { weeklyChallengeApi } from '../../services/weeklyChallenge';
import PaywallModal from '../subscription/PaywallModal';

// Los 4 estados "sin progreso que mostrar todavía" comparten el mismo molde
// (blob de acento, eyebrow, título, descripción opcional, un botón) — solo
// cambian el color y el texto.
function ChallengeCtaCard({ accentColor, eyebrow, title, description, buttonLabel, buttonTextColor, onClick, locked }: {
    accentColor: string
    eyebrow: string
    title: string
    description?: string
    buttonLabel: string
    buttonTextColor?: string
    onClick: () => void
    locked?: boolean
}) {
    return (
        <div
            className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden"
            style={{ background: '#1E1A1B', borderColor: '#333330' }}
        >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: accentColor }} />
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide relative z-10" style={{ color: accentColor }}>
                {locked && <Lock size={12} />}
                {eyebrow}
            </p>
            <h3 className="text-lg font-bold relative z-10" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                {title}
            </h3>
            {description && (
                <p className="text-sm leading-relaxed relative z-10" style={{ color: '#A8A29E' }}>
                    {description}
                </p>
            )}
            <button
                onClick={onClick}
                className="relative z-10 mt-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: accentColor, color: buttonTextColor ?? '#fff' }}
            >
                {buttonLabel}
            </button>
        </div>
    );
}

export const WeeklyChallengeProgressCard = () => {
    const navigate = useNavigate();
    const goToReto = () => navigate('/reto-semanal');
    const [showPaywall, setShowPaywall] = useState(false);

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

    if (me?.locked) {
        return (
            <>
                <ChallengeCtaCard
                    accentColor={C.amber}
                    eyebrow="Reto Semanal"
                    title="Tu Reto Semanal te espera"
                    description="Desbloquea seguimiento semanal, metas y check-ins con Premium."
                    buttonLabel="Ver Premium"
                    buttonTextColor="#161211"
                    onClick={() => setShowPaywall(true)}
                    locked
                />
                <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
            </>
        );
    }

    if (!me?.isParticipant) {
        return (
            <ChallengeCtaCard
                accentColor={C.red}
                eyebrow="Reto Semanal"
                title="A tu ritmo, sin fecha de cierre"
                description="Ponte una meta semanal y registra tu movimiento. Cada 12 semanas, revisas tu punto de partida de nuevo."
                buttonLabel="Comenzar mi reto"
                onClick={goToReto}
            />
        );
    }

    // Arrancó un ciclo global nuevo — hay que responder el cuestionario de nuevo
    if (me.needsIntro && me.isRetake) {
        return (
            <ChallengeCtaCard
                accentColor="#EF9F27"
                eyebrow={`Reto Semanal · Ciclo ${me.cycleNumber}`}
                title="Empezó un nuevo ciclo de 12 semanas"
                description="Responde de nuevo tu punto de partida para seguir."
                buttonLabel="Empezar el siguiente ciclo"
                buttonTextColor="#161211"
                onClick={goToReto}
            />
        );
    }

    // Activó el reto pero nunca respondió el cuestionario de punto de partida
    // (needsIntro && isRetake ya se cubrió arriba — esto es la primera vez).
    if (me.needsIntro) {
        return (
            <ChallengeCtaCard
                accentColor="#EF9F27"
                eyebrow="Reto Semanal"
                title="Falta tu punto de partida"
                description="Responde el cuestionario inicial para empezar a registrar tu progreso."
                buttonLabel="Responder el cuestionario"
                buttonTextColor="#161211"
                onClick={goToReto}
            />
        );
    }

    if (me.showGoalPopup || !progress?.isParticipant) {
        return (
            <ChallengeCtaCard
                accentColor="#EF9F27"
                eyebrow={`Reto Semanal · Semana ${me.weekNumber}`}
                title="Falta confirmar tu meta"
                buttonLabel="Poner mi meta"
                buttonTextColor="#161211"
                onClick={goToReto}
            />
        );
    }

    const { weekNumber, minutesThisWeek, goalMinutes, percentage, logTimestamps } = progress;
    // Se cuenta por fecha local del dispositivo, no por fecha del servidor — así
    // un registro a las 8pm en Bogotá, México o donde sea cuenta para el día
    // correcto en vez de correrse a "mañana" por el huso horario del servidor.
    // Cerca de UTC+13/-12, el rango de 7 días del servidor puede pisar 8 fechas
    // locales distintas — se topa en 7 para no mostrar "8 de 7 días".
    const activeDays = Math.min(7, new Set((logTimestamps ?? []).map(ts => new Date(ts).toDateString())).size);
    const pct = percentage ?? 0;
    const barWidth = Math.min(100, pct);
    const exceeded = pct > 100;
    // Rojo al arrancar, ámbar a mitad de camino, verde al completar la meta.
    const progressColor = pct >= 100 ? C.green : pct >= 50 ? C.amber : C.red;

    return (
        <div className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col justify-center gap-4 relative overflow-hidden" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: C.red }} />

            <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: C.red }}>
                    Reto Semanal · Semana {weekNumber} de 12
                </p>
                <button onClick={goToReto} className="text-left">
                    <h3 className="text-xl font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Tu progreso semanal</h3>
                </button>
            </div>

            <div className="relative z-10 space-y-3">
                <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold" style={{ color: progressColor }}>
                        {pct}%
                    </span>
                    {exceeded && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full mb-1" style={{ color: C.green, background: `${C.green}22` }}>
                            ¡Meta superada!
                        </span>
                    )}
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#252020' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, background: progressColor }}
                    />
                </div>

                <div className="flex justify-between text-sm" style={{ color: '#A8A29E' }}>
                    <span>
                        <span className="font-semibold" style={{ color: progressColor }}>{minutesThisWeek} min</span> registrados
                    </span>
                    {goalMinutes && (
                        <span>Meta: <span className="font-semibold" style={{ color: C.green }}>{goalMinutes} min</span></span>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: '#333330' }}>
                    <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors"
                                style={i < (activeDays ?? 0)
                                    ? { background: C.green, color: '#fff' }
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
