import { Lock, Check, Circle } from 'lucide-react';
import { C } from '../../styles/colors';
import type { ProgressHistory, WeekProgress } from '../../types/weeklyChallenge';

const STATUS_ICON: Record<WeekProgress['status'], typeof Lock> = {
    locked: Lock,
    current: Circle,
    superada: Check,
    cumplida: Check,
    semana_ligera: Circle,
};

const STATUS_COLOR: Record<WeekProgress['status'], string> = {
    locked: C.label,
    current: C.amber,
    superada: C.red,
    cumplida: C.green,
    semana_ligera: C.textMuted,
};

export default function WeeklyChallengeGrid({ history }: { history: Pick<ProgressHistory, 'weeks' | 'totals'> }) {
    const current = history.weeks.find(w => w.status === 'current');

    return (
        <div className="space-y-5">
            {current && (
                <div className="rounded-3xl p-6 md:p-8 relative overflow-hidden" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                    <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-full -mr-8 -mt-8 opacity-20" style={{ background: C.red }} />
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1 relative z-10" style={{ color: C.red }}>
                        Semana activa · {current.weekNumber} de 12
                    </p>
                    <h2 className="text-xl font-bold mb-4 relative z-10" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                        Tu progreso esta semana
                    </h2>

                    <div className="relative z-10 space-y-3">
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-bold" style={{ color: (current.percentage ?? 0) > 100 ? C.red : C.text }}>
                                {current.percentage ?? 0}%
                            </span>
                            {(current.percentage ?? 0) > 100 && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full mb-1" style={{ color: C.red, background: `${C.red}22` }}>
                                    ¡Meta superada!
                                </span>
                            )}
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, current.percentage ?? 0)}%`, background: C.red }}
                            />
                        </div>
                        <div className="flex justify-between text-sm" style={{ color: C.textMuted }}>
                            <span><span className="font-semibold" style={{ color: C.red }}>{current.minutesLogged} min</span> registrados</span>
                            {current.goalMinutes && (
                                <span>Meta: <span className="font-semibold" style={{ color: C.red }}>{current.goalMinutes} min</span></span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {history.weeks.map(w => {
                    const Icon = STATUS_ICON[w.status];
                    const color = STATUS_COLOR[w.status];
                    const isCurrent = w.status === 'current';
                    return (
                        <div
                            key={w.weekNumber}
                            className="rounded-2xl border p-4 flex flex-col gap-3"
                            style={{
                                background: isCurrent ? `${C.amber}14` : C.surface1,
                                borderColor: isCurrent ? C.amber : C.border,
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: C.surface2, color }}
                            >
                                <Icon size={13} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: C.label }}>
                                    Semana {w.weekNumber}
                                </p>
                                <p className="text-sm font-semibold mt-0.5" style={{ color: isCurrent ? C.text : C.textMuted }}>
                                    {w.status === 'locked' ? 'Aún no llega' :
                                        w.status === 'current' ? 'En curso' :
                                            w.status === 'superada' ? 'Superada' :
                                                w.status === 'cumplida' ? 'Cumplida' : 'Semana ligera'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl p-3 text-center" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                    <p className="text-xl font-bold" style={{ color: C.text }}>{history.totals.totalMinutes}</p>
                    <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.label }}>Min. totales</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                    <p className="text-xl font-bold" style={{ color: C.text }}>{history.totals.weeksCompleted}</p>
                    <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.label }}>Semanas cumplidas</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                    <p className="text-xl font-bold" style={{ color: C.text }}>{history.totals.weeksLight}</p>
                    <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.label }}>Semanas ligeras</p>
                </div>
            </div>
        </div>
    );
}
