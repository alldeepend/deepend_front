import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Lock, Award } from 'lucide-react'
import { journeyApi } from '../../../services/journey'
import type { JourneyDetailsResponse, StationProgress } from '../../../types/journey'

function PinIcon({ color, size = 32 }: { color: string; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C7.03 2 3 6.03 3 11c0 6.5 9 17 9 17s9-10.5 9-17c0-4.97-4.03-9-9-9z" fill={color} />
            <circle cx="12" cy="11" r="3.5" fill="white" />
        </svg>
    )
}

const C = {
    bg:       '#231F20',
    surface1: '#1E1A1B',
    surface2: '#252020',
    text:     '#F5F0E8',
    textMuted:'#A8A29E',
    red:      '#EE2A28',
    amber:    '#EF9F27',
    green:    '#52B788',
    border:   '#333330',
}

export default function WorldsJourney() {
    const { journeyId } = useParams<{ journeyId: string }>()
    const navigate = useNavigate()

    const [data, setData] = useState<JourneyDetailsResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!journeyId) return
        journeyApi.getJourneyDetails(journeyId)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [journeyId])

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: C.bg }}
            >
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }} />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.text }}>
                <p>No se encontró el reto.</p>
            </div>
        )
    }

    const { journey, progress } = data
    const { userJourney, stationProgress } = progress

    const totalXpMax = journey.worlds.reduce(
        (s, w) => w.stations.reduce((ss, st) => ss + (st.xp || 0), s), 0
    )
    const xpEarned = userJourney?.totalXpEarned ?? 0
    const overallProgress = totalXpMax > 0 ? Math.round((xpEarned / totalXpMax) * 100) : 0

    const progressMap = new Map<string, StationProgress>(
        stationProgress.map(sp => [sp.stationId, sp])
    )

    // Build flat ordered station list to determine unlock state
    const allStationsOrdered = journey.worlds
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .flatMap(w =>
            w.stations.slice().sort((a, b) => a.orderIndex - b.orderIndex).map(s => s.id)
        )

    const isStationCompleted = (stationId: string) =>
        progressMap.get(stationId)?.isCompleted === true

    const isStationUnlocked = (stationId: string) => {
        const idx = allStationsOrdered.indexOf(stationId)
        if (idx === 0) return true
        return isStationCompleted(allStationsOrdered[idx - 1])
    }

    const currentStationId = allStationsOrdered.find(
        id => isStationUnlocked(id) && !isStationCompleted(id)
    ) ?? null


    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            {/* Top bar con banner */}
            <div
                className="px-6 pt-8 pb-4 relative overflow-hidden bg-center md:bg-[center_40%]"
                style={{
                    borderBottom: `1px solid ${C.border}`,
                    backgroundImage: 'url(/frank-van-hulst-dVaJ-yJjUvs-unsplash.jpg)',
                    backgroundSize: 'cover',
                }}
            >
                <div className="absolute inset-0" style={{ background: 'rgba(35,31,32,0.72)' }} />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                            {journey.area?.name || 'Área'} · Reto
                        </p>
                        <h1
                            className="text-2xl font-bold mt-1 leading-tight"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                        >
                            {journey.title}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/worlds')}
                        className="text-sm px-4 py-2 rounded-lg transition shrink-0"
                        style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                    >
                        ← Volver
                    </button>
                </div>
            </div>

            {/* XP progress bar */}
            {userJourney && (
                <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="flex justify-between text-xs mb-2" style={{ color: C.textMuted }}>
                        <span>Progreso total</span>
                        <span style={{ color: C.amber, fontFamily: 'monospace' }}>
                            {xpEarned} / {totalXpMax} XP  ·  {overallProgress}%
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${overallProgress}%`, background: C.amber }}
                        />
                    </div>
                    {(userJourney.currentStreak ?? 0) > 0 && (
                        <p className="text-xs mt-2" style={{ color: C.textMuted }}>
                            🔥 Racha activa: <span style={{ color: C.amber }}>{userJourney.currentStreak} días</span>
                        </p>
                    )}
                </div>
            )}

            {/* World & station map */}
            <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
                {(() => {
                    const sortedWorlds = journey.worlds
                        .slice()
                        .sort((a, b) => a.orderIndex - b.orderIndex)

                    // Build flat list: world headers + stations interleaved
                    type TrackItem =
                        | { kind: 'world'; world: typeof sortedWorlds[0]; wIdx: number; hasStarted: boolean }
                        | { kind: 'station'; station: typeof sortedWorlds[0]['stations'][0]; world: typeof sortedWorlds[0] }

                    const items: TrackItem[] = []
                    sortedWorlds.forEach((world, wIdx) => {
                        const ids = world.stations.map(s => s.id)
                        const hasStarted = ids.some(id => isStationCompleted(id) || id === currentStationId)
                        items.push({ kind: 'world', world, wIdx, hasStarted })
                        world.stations
                            .slice()
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .forEach(station => items.push({ kind: 'station', station, world }))
                    })

                    return (
                        <div className="ml-1">
                            {items.map((item, itemIdx) => {
                                const isLastItem = itemIdx === items.length - 1

                                // ── World header row ──
                                if (item.kind === 'world') {
                                    const lineColor = item.hasStarted ? C.green : C.border
                                    return (
                                        <div key={`world-${item.world.id}`} className="flex gap-4 items-center">
                                            {/* Track: line → number circle → line */}
                                            <div className="flex flex-col items-center" style={{ width: 28, flexShrink: 0 }}>
                                                {itemIdx > 0 && (
                                                    <div style={{ width: 2, height: 10, borderLeft: `2px dashed ${lineColor}` }} />
                                                )}
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{ background: item.hasStarted ? C.red : C.surface2, color: item.hasStarted ? '#fff' : C.textMuted, border: `1px solid ${item.hasStarted ? C.red : C.border}` }}
                                                >
                                                    {item.wIdx + 1}
                                                </div>
                                                <div style={{ width: 2, height: 10, borderLeft: `2px dashed ${lineColor}` }} />
                                            </div>
                                            {/* World label */}
                                            <div className="py-1">
                                                <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: C.textMuted }}>
                                                    Mundo {item.wIdx + 1}
                                                </p>
                                                <h2
                                                    className="font-bold text-sm leading-tight"
                                                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: item.hasStarted ? C.text : C.textMuted }}
                                                >
                                                    {item.world.title}
                                                </h2>
                                            </div>
                                        </div>
                                    )
                                }

                                // ── Station row ──
                                const { station } = item
                                const sp = progressMap.get(station.id)
                                const completed = sp?.isCompleted === true
                                const unlocked = isStationUnlocked(station.id)
                                const isCurrent = station.id === currentStationId
                                const xpSp = sp?.xpEarned ?? 0
                                const statusColor = completed ? C.green : isCurrent ? C.red : C.border

                                // Check if next item is also a station (to decide line style)
                                const nextItem = items[itemIdx + 1]
                                const showLine = !isLastItem

                                return (
                                    <div key={station.id} className="flex gap-4">
                                        {/* Track: circle node + dotted line below */}
                                        <div className="flex flex-col items-center" style={{ width: 28, flexShrink: 0 }}>
                                            {isCurrent ? (
                                                <div style={{ filter: `drop-shadow(0 2px 10px ${C.red}99)` }}>
                                                    <PinIcon color={C.red} size={28} />
                                                </div>
                                            ) : (
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{
                                                        background: completed ? `${C.green}25` : unlocked ? `${C.red}15` : C.surface2,
                                                        border: `1.5px solid ${statusColor}`,
                                                        color: completed ? C.green : unlocked ? C.red : C.textMuted,
                                                    }}
                                                >
                                                    {completed ? '✓' : <Lock size={10} />}
                                                </div>
                                            )}
                                            {showLine && (
                                                <div
                                                    className="flex-1 my-1"
                                                    style={{
                                                        width: 2,
                                                        minHeight: nextItem?.kind === 'world' ? 14 : 28,
                                                        borderLeft: `2px dashed ${completed ? C.green : C.border}`,
                                                    }}
                                                />
                                            )}
                                        </div>
                                        {/* Card */}
                                        <div className="flex-1 pb-3">
                                            <StationCard
                                                title={station.title}
                                                xpMax={station.xp}
                                                xpEarned={xpSp}
                                                badgeName={station.badgeName}
                                                blockCount={station.blocks?.length ?? 0}
                                                completed={completed}
                                                unlocked={unlocked}
                                                isCurrent={isCurrent}
                                                onClick={() => {
                                                    if (unlocked) navigate(`/worlds/${journeyId}/station/${station.id}`)
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })()}

                {/* Journey end */}
                <div className="flex flex-col items-center pb-6" style={{ marginLeft: '-24px', marginRight: '-24px' }}>
                    <div className="flex flex-col items-center gap-2 py-8">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.textMuted }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.textMuted }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.textMuted }} />
                    </div>
                    <p
                        className="text-xs tracking-[0.18em] uppercase"
                        style={{ color: C.textMuted, fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                        Sigue en tu próximo viaje
                    </p>
                </div>
            </div>
        </div>
    )
}

function StationCard({
    title,
    xpMax,
    xpEarned,
    badgeName,
    blockCount,
    completed,
    unlocked,
    isCurrent,
    onClick,
}: {
    title: string
    xpMax: number
    xpEarned: number
    badgeName: string | null
    blockCount: number
    completed: boolean
    unlocked: boolean
    isCurrent: boolean
    onClick: () => void
}) {
    const statusColor = completed ? C.green : unlocked ? C.red : C.border

    if (!unlocked) {
        return (
            <div
                className="w-full rounded-xl p-4 flex items-center gap-3"
                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
            >
                <Lock size={12} style={{ color: C.textMuted, flexShrink: 0 }} />
                <p className="text-sm font-semibold" style={{ color: C.textMuted }}>{title}</p>
            </div>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={onClick}
                className="w-full text-left rounded-xl p-4 transition-all duration-200"
                style={{
                    background: C.surface1,
                    border: `1px solid ${statusColor}`,
                    boxShadow: isCurrent ? `0 0 0 2px ${C.red}30` : undefined,
                }}
            >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-sm leading-snug" style={{ color: C.text }}>
                        {title}
                    </p>
                    {xpMax > 0 && (
                        <span className="text-xs font-mono shrink-0" style={{ color: completed ? C.green : C.amber }}>
                            {completed ? `+${xpEarned} XP` : `${xpMax} XP`}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[11px]" style={{ color: C.textMuted }}>{blockCount} bloques</span>
                    {badgeName && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: C.amber + '20', color: C.amber }}>
                            <Award size={10} className="inline mr-1" />{badgeName}
                        </span>
                    )}
                    {completed && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: C.green + '20', color: C.green }}>
                            Completada
                        </span>
                    )}
                </div>
            </button>
        </div>
    )
}
