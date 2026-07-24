import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Compass } from 'lucide-react';
import { C } from '../../styles/colors';
import { journeyApi } from '../../services/journey';

type NodeState = 'done' | 'current' | 'future';

interface ActiveJourneyInfo {
    journeyId: string;
    journeyTitle: string;
    subtitle: string;
    nodes: { state: NodeState }[];
    xpEarned: number;
    xpMax: number;
    secondaryStat: { value: string; label: string };
}

function computeGateCurrentDay(activatedAt: string): number {
    const elapsedDays = Math.floor((Date.now() - new Date(activatedAt).getTime()) / 86_400_000) + 1;
    return Math.min(7, Math.max(1, elapsedDays));
}


async function resolveActiveJourney(): Promise<ActiveJourneyInfo | null> {
    const { areas } = await journeyApi.getAvailableJourneys();
    const journeys = areas.flatMap(a => a.journeys);

    const inWorlds = journeys.find(j => {
        const uj = j.userJourneys?.[0];
        return uj && uj.status !== 'completado';
    });

    if (inWorlds) {
        const sortedWorlds = inWorlds.worlds.slice().sort((a, b) => a.orderIndex - b.orderIndex);
        const isStationCompleted = (s: (typeof sortedWorlds)[0]['stations'][0]) =>
            s.userProgress?.[0]?.isCompleted === true;

        const ordered = sortedWorlds.flatMap(w => w.stations
            .slice().sort((a, b) => a.orderIndex - b.orderIndex)
            .map(s => ({ station: s, worldId: w.id })));

        const isUnlocked = (idx: number) => idx === 0 || isStationCompleted(ordered[idx - 1].station);
        const currentIdx = ordered.findIndex((s, idx) => isUnlocked(idx) && !isStationCompleted(s.station));
        const currentWorldId = currentIdx >= 0 ? ordered[currentIdx].worldId : null;

        const worldNodes: { state: NodeState }[] = sortedWorlds.map(w => {
            const allDone = w.stations.length > 0 && w.stations.every(isStationCompleted);
            const isCurrent = w.id === currentWorldId;
            return { state: allDone ? 'done' : isCurrent ? 'current' : 'future' };
        });

        let currentWorldIdx = worldNodes.findIndex(n => n.state === 'current');
        if (currentWorldIdx < 0) currentWorldIdx = Math.max(0, worldNodes.findIndex(n => n.state !== 'done'));
        const currentWorld = sortedWorlds[currentWorldIdx] ?? sortedWorlds[0];

        const xpMax = sortedWorlds.reduce((s, w) => w.stations.reduce((ss, st) => ss + (st.xp || 0), s), 0);
        const totalBadges = sortedWorlds.reduce((s, w) => s + w.stations.filter(st => st.badgeName).length, 0);
        const earnedBadges = inWorlds.userJourneys?.[0]?.earnedBadges?.length ?? 0;

        return {
            journeyId: inWorlds.id,
            journeyTitle: inWorlds.title,
            subtitle: `Mundo ${currentWorldIdx + 1} de ${sortedWorlds.length} · ${currentWorld?.title ?? ''}`,
            nodes: worldNodes,
            xpEarned: inWorlds.userJourneys?.[0]?.totalXpEarned ?? 0,
            xpMax,
            secondaryStat: { value: `${earnedBadges}/${totalBadges}`, label: 'insignias' },
        };
    }

    const inGate = journeys.find(j => {
        const ug = j.gate?.userGates?.[0];
        return j.gate?.isActive && ug?.activatedAt && !ug.completedAt;
    });

    if (inGate) {
        const gate = inGate.gate!;
        const userGate = gate.userGates[0];
        const currentDay = computeGateCurrentDay(userGate.activatedAt!);
        const dayNodes: { state: NodeState }[] = Array.from({ length: 7 }, (_, i) => {
            const dayNum = i + 1;
            return { state: dayNum < currentDay ? 'done' : dayNum === currentDay ? 'current' : 'future' };
        });

        return {
            journeyId: inGate.id,
            journeyTitle: inGate.title,
            subtitle: `Día ${currentDay} de 7 · ${gate.title}`,
            nodes: dayNodes,
            xpEarned: userGate.totalXpEarned,
            xpMax: gate.xpPerDay * 7 + gate.xpBonusClose,
            secondaryStat: { value: `${Math.max(0, 8 - currentDay)}`, label: 'días restantes' },
        };
    }

    return null;
}

function RouteLine({ nodes }: { nodes: { state: NodeState }[] }) {
    return (
        <div className="flex items-center relative z-10">
            {nodes.map((n, i) => {
                const isLast = i === nodes.length - 1;
                const dotColor = n.state === 'done' ? C.green : n.state === 'current' ? C.red : 'transparent';
                const borderColor = n.state === 'done' ? C.green : n.state === 'current' ? C.red : '#4A4442';
                const lineColor = n.state === 'done' ? C.green : '#4A4442';
                return (
                    <div key={i} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                        <div
                            className="rounded-full shrink-0"
                            style={{
                                width: n.state === 'current' ? 12 : 8,
                                height: n.state === 'current' ? 12 : 8,
                                background: dotColor,
                                border: `2px solid ${borderColor}`,
                                boxShadow: n.state === 'current' ? `0 0 0 4px ${C.red}2E` : undefined,
                            }}
                        />
                        {!isLast && (
                            <div className="flex-1 h-[2px] mx-0.5" style={{ background: lineColor }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function StatCell({ value, label, color }: { value: string; label: string; color?: string }) {
    return (
        <div className="flex-1 py-3 flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold" style={{ fontFamily: "'DM Mono', monospace", color: color ?? '#F5F0E8' }}>
                {value}
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: '#A8A29E' }}>
                {label}
            </span>
        </div>
    );
}

export const CurrentJourneyCard = () => {
    const navigate = useNavigate();
    const [info, setInfo] = useState<ActiveJourneyInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        resolveActiveJourney()
            .then(result => { if (!cancelled) setInfo(result); })
            .catch(() => { if (!cancelled) setInfo(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true };
    }, []);

    if (loading) return null;

    if (!info) {
        return (
            <div
                className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col justify-center gap-4 relative overflow-hidden"
                style={{ background: '#1E1A1B', borderColor: '#333330' }}
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-20" style={{ background: C.red }} />
                <div className="relative z-10 flex flex-col items-center text-center gap-3 py-2">
                    <div
                        className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{ background: `${C.red}20`, border: `1px solid ${C.red}40` }}
                    >
                        <Compass size={20} style={{ color: C.red }} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                            Tu próximo viaje te espera
                        </h3>
                        <p className="text-sm leading-relaxed mt-1" style={{ color: '#A8A29E' }}>
                            Todavía no tienes un viaje en curso. Muy pronto vas a poder empezar el tuyo — vuelve a revisar por aquí.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const handleClick = () => {
        sessionStorage.setItem('worldsHomeJourneyId', info.journeyId);
        navigate('/worlds');
    };

    return (
        <button
            onClick={handleClick}
            className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col justify-between gap-6 relative overflow-hidden text-left transition-transform hover:scale-[1.01]"
            style={{ background: '#1E1A1B', borderColor: '#333330' }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-20" style={{ background: C.red }} />

            <div className="relative z-10 space-y-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: C.red }}>
                        Tu viaje en curso
                    </p>
                    <h3 className="text-xl font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                        {info.journeyTitle}
                    </h3>
                </div>

                <div className="space-y-2.5">
                    <RouteLine nodes={info.nodes} />
                    <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                        {info.subtitle}
                    </p>
                </div>

                <div className="flex items-stretch rounded-xl" style={{ border: '1px solid #333330' }}>
                    <StatCell value={`${info.xpEarned}`} label={`de ${info.xpMax} XP`} color={C.amber} />
                    <div style={{ width: 1, background: '#333330' }} />
                    <StatCell value={info.secondaryStat.value} label={info.secondaryStat.label} />
                </div>
            </div>

            <span
                className="relative z-10 block w-full text-center py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: C.red, color: '#fff' }}
            >
                Continuar mi viaje →
            </span>
        </button>
    );
};
