import { C } from '../../styles/colors';
import type { WeeklyPodium as WeeklyPodiumData, WeeklyPodiumEntry } from '../../types/weeklyChallenge';

const RANK_COLORS = ['#EF9F27', '#9CA3A8', '#B9713F'];

function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function daysLabel(n: number): string {
    return `${n} ${n === 1 ? 'día' : 'días'}`;
}

function PodiumColumn({ entry, isFirst }: { entry: WeeklyPodiumEntry; isFirst: boolean }) {
    const color = RANK_COLORS[entry.rank - 1] ?? C.border;
    const barHeight = isFirst ? 104 : entry.rank === 2 ? 72 : 54;
    const avatarSize = isFirst ? 72 : 56;

    return (
        <div className="flex flex-col items-center gap-2.5" style={{ width: isFirst ? 176 : 152 }}>
            {isFirst && (
                <svg width="26" height="26" viewBox="0 0 24 24" fill={C.amber} stroke={C.amber} strokeWidth={1}>
                    <path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" />
                </svg>
            )}
            <div
                className="rounded-full flex items-center justify-center font-bold"
                style={{
                    width: avatarSize, height: avatarSize,
                    background: C.surface2, border: `3px solid ${color}`,
                    color: C.text, fontSize: isFirst ? 20 : 17,
                    boxShadow: isFirst ? `0 0 0 5px ${color}24` : undefined,
                }}
            >
                {initials(entry.displayName)}
            </div>
            <div className="text-center">
                <p className="truncate max-w-[150px]" style={{ fontSize: isFirst ? 16 : 14, fontWeight: isFirst ? 800 : 700, color: C.text }}>
                    {entry.displayName}
                </p>
                <p style={{ fontSize: isFirst ? 12 : 11, fontWeight: isFirst ? 700 : 400, color: isFirst ? C.amber : C.textMuted }}>
                    {daysLabel(entry.daysActive)}
                </p>
            </div>
            <div
                className="w-full rounded-t-xl flex items-start justify-center"
                style={{ height: barHeight, paddingTop: isFirst ? 10 : 8, background: `linear-gradient(180deg, ${color}, ${color}bb)` }}
            >
                <span style={{ fontSize: isFirst ? 30 : 24, fontWeight: 800, color: '#201400' }}>{entry.rank}</span>
            </div>
        </div>
    );
}

export default function WeeklyPodium({
    podium, isLoading, onRegister,
}: { podium?: WeeklyPodiumData; isLoading: boolean; onRegister: () => void }) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }} />
            </div>
        );
    }

    const top = podium?.top ?? [];
    const [first, second, third] = top;
    const rest = top.slice(3);
    const me = podium?.me ?? null;
    const meShown = !!me && top.some(t => t.userId === me.userId);
    const showGapBanner = !!me && !meShown && top.length >= 3;
    const gapToThird = showGapBanner ? Math.max(1, (third!.daysActive - me!.daysActive) + 1) : 0;
    const gapPct = showGapBanner ? Math.min(100, Math.round((me!.daysActive / (third!.daysActive + 1)) * 100)) : 0;

    return (
        <div className="rounded-3xl p-8 space-y-6 relative overflow-hidden" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
            <div className="absolute top-0 right-0 w-36 h-36 rounded-bl-full -mr-4 -mt-4" style={{ background: C.amber, opacity: 0.1 }} />

            <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth={2}>
                        <path d="M4 4h16v3a8 8 0 0 1-8 8 8 8 0 0 1-8-8V4z" />
                        <path d="M4 4a2 2 0 0 0-2 2 4 4 0 0 0 4 4" />
                        <path d="M20 4a2 2 0 0 1 2 2 4 4 0 0 1-4 4" />
                        <path d="M9 20h6" />
                        <path d="M12 15v5" />
                    </svg>
                    <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: C.amber }}>Se reinicia cada lunes</p>
                </div>
                <h2 className="text-2xl font-bold mt-1.5" style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}>
                    Podio de la semana
                </h2>
                <p className="text-sm mt-1.5 max-w-md mx-auto leading-relaxed" style={{ color: C.textMuted }}>
                    Por días distintos que registraste actividad — no importa qué tan intenso fue cada uno, solo que vuelvas a registrar tu movimiento.
                </p>
            </div>

            {top.length === 0 ? (
                <p className="text-center text-sm py-8 relative z-10" style={{ color: C.textMuted }}>
                    Todavía nadie ha registrado actividad esta semana — ¡sé el primero!
                </p>
            ) : (
                <>
                    <div className="flex items-end justify-center gap-3.5 relative z-10">
                        {second && <PodiumColumn entry={second} isFirst={false} />}
                        {first && <PodiumColumn entry={first} isFirst />}
                        {third && <PodiumColumn entry={third} isFirst={false} />}
                    </div>

                    {rest.length > 0 && (
                        <div className="space-y-1.5 relative z-10">
                            {rest.map(r => (
                                <div key={r.userId} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl" style={{ background: C.surface2 }}>
                                    <span
                                        className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ borderColor: C.border, color: C.textMuted }}
                                    >
                                        {r.rank}
                                    </span>
                                    <p className="flex-1 text-sm font-semibold truncate" style={{ color: C.textMuted }}>{r.displayName}</p>
                                    <span className="text-xs font-semibold" style={{ color: C.label }}>{daysLabel(r.daysActive)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {showGapBanner && (
                <div
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl relative z-10"
                    style={{ background: `linear-gradient(120deg, ${C.red}24, ${C.amber}14)`, border: `1px solid ${C.red}55` }}
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.red }}>Vas en el puesto #{me!.rank}</p>
                        <p className="text-sm font-bold mt-1" style={{ color: C.text }}>
                            Te falta{gapToThird === 1 ? '' : 'n'} {gapToThird} {gapToThird === 1 ? 'día' : 'días'} más para llegar al podio
                        </p>
                        <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ width: 220, background: C.surface2 }}>
                            <div className="h-full rounded-full" style={{ width: `${gapPct}%`, background: `linear-gradient(90deg, ${C.red}, ${C.amber})` }} />
                        </div>
                    </div>
                    <button
                        onClick={onRegister}
                        className="shrink-0 px-5 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                        style={{ background: C.red }}
                    >
                        + Registrar actividad
                    </button>
                </div>
            )}
        </div>
    );
}
