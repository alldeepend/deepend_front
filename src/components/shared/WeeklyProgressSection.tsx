import { C } from '../../styles/colors';
import type { ProgressHistory, WeekProgressStatus } from '../../types/weeklyChallenge';

const WEEK_STATUS_STYLE: Record<WeekProgressStatus, { label: string; color: string; bg: string }> = {
    superada: { label: 'Superada', color: C.red, bg: `${C.red}22` },
    cumplida: { label: 'Cumplida', color: C.green, bg: `${C.green}22` },
    semana_ligera: { label: 'Semana ligera', color: C.textMuted, bg: C.surface3 },
    current: { label: 'En curso', color: C.amber, bg: `${C.amber}22` },
    locked: { label: 'Bloqueada', color: C.label, bg: C.surface3 },
};

export default function WeeklyProgressSection({ history }: { history: Pick<ProgressHistory, 'weeks' | 'totals'> }) {
    const anyCurrent = history.weeks.some(w => w.status === 'current');
    return (
        <div className="rounded-3xl shadow-sm mb-8" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
            <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-1" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                    Tu progreso · 8 semanas
                </h2>
                <p className="text-sm mb-5" style={{ color: C.textMuted }}>
                    {anyCurrent ? 'La meta que pusiste y lo que registraste, semana a semana.' : 'Así te fue en tus 8 semanas — la meta que pusiste y lo que registraste.'}
                </p>

                <div className="flex flex-col gap-2.5">
                    {history.weeks.map(w => {
                        const style = WEEK_STATUS_STYLE[w.status];
                        const pct = w.status === 'locked' ? 0 : Math.min(100, w.percentage ?? 0);
                        const barColor = w.status === 'superada' ? C.red : w.status === 'cumplida' ? C.green : w.status === 'current' ? C.amber : C.textMuted;
                        return (
                            <div
                                key={w.weekNumber}
                                className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3 rounded-2xl"
                                style={{ background: C.surface2, border: `1px solid ${C.border}`, opacity: w.status === 'locked' ? 0.55 : 1 }}
                            >
                                <div>
                                    <p className="text-[11px]" style={{ color: C.label }}>Semana</p>
                                    <p className="text-lg font-bold" style={{ color: C.text }}>{w.weekNumber}</p>
                                </div>
                                <div className="min-w-0">
                                    <div className="w-full h-1.5 rounded-full mb-1.5 overflow-hidden" style={{ background: C.surface3 }}>
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                                    </div>
                                    <p className="text-xs" style={{ color: C.textMuted }}>
                                        {w.status === 'locked' ? (
                                            'Aún no comienza'
                                        ) : (
                                            <>
                                                <span className="font-semibold" style={{ color: C.text }}>{w.minutesLogged}</span>
                                                {' '}/ {w.goalMinutes ?? '—'} min · meta
                                            </>
                                        )}
                                    </p>
                                </div>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap"
                                    style={{ color: style.color, background: style.bg }}
                                >
                                    {style.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-5">
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
        </div>
    );
}
