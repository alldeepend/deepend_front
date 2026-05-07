import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Lock, Compass } from 'lucide-react'
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
            <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-10">
                {(() => {
                    const sortedWorlds = journey.worlds
                        .slice()
                        .sort((a, b) => a.orderIndex - b.orderIndex)

                    const firstUnstartedIdx = sortedWorlds.findIndex(w => {
                        const ids = w.stations.map(s => s.id)
                        return !ids.some(id => isStationCompleted(id) || id === currentStationId)
                    })

                    // worlds to render individually: all started + first unstarted
                    const cutoff = firstUnstartedIdx === -1
                        ? sortedWorlds.length
                        : firstUnstartedIdx + 1

                    const visibleWorlds = sortedWorlds.slice(0, cutoff)
                    const hiddenWorlds = sortedWorlds.slice(cutoff)

                    return (
                        <>
                            {visibleWorlds.map((world, wIdx) => {
                                const worldStationIds = world.stations.map(s => s.id)
                                const worldHasStarted = worldStationIds.some(
                                    id => isStationCompleted(id) || id === currentStationId
                                )

                                return (
                                    <div key={world.id}>
                                        {/* World header */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                                style={{ background: worldHasStarted ? C.red : C.surface2, color: worldHasStarted ? '#fff' : C.textMuted, border: `1px solid ${worldHasStarted ? C.red : C.border}` }}
                                            >
                                                {wIdx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs tracking-[0.12em] uppercase" style={{ color: C.textMuted }}>
                                                    Mundo {wIdx + 1}
                                                </p>
                                                <h2
                                                    className="font-bold leading-tight"
                                                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: worldHasStarted ? C.text : C.textMuted }}
                                                >
                                                    {world.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Connector + stations */}
                                        <div className="ml-4 pl-6 border-l-2 space-y-3" style={{ borderColor: C.border }}>
                                            {worldHasStarted ? (
                                                world.stations
                                                    .slice()
                                                    .sort((a, b) => a.orderIndex - b.orderIndex)
                                                    .map((station, sIdx) => {
                                                        const sp = progressMap.get(station.id)
                                                        const completed = sp?.isCompleted === true
                                                        const unlocked = isStationUnlocked(station.id)
                                                        const xpSp = sp?.xpEarned ?? 0
                                                        return (
                                                            <StationCard
                                                                key={station.id}
                                                                index={sIdx + 1}
                                                                title={station.title}
                                                                xpMax={station.xp}
                                                                xpEarned={xpSp}
                                                                badgeName={station.badgeName}
                                                                blockCount={station.blocks?.length ?? 0}
                                                                completed={completed}
                                                                unlocked={unlocked}
                                                                isCurrent={station.id === currentStationId}
                                                                onClick={() => {
                                                                    if (unlocked) navigate(`/worlds/${journeyId}/station/${station.id}`)
                                                                }}
                                                            />
                                                        )
                                                    })
                                            ) : (
                                                <div
                                                    className="w-full rounded-xl p-4 flex items-center gap-3"
                                                    style={{ background: C.surface1, border: `1px solid ${C.border}`, minHeight: '72px' }}
                                                >
                                                    <Compass size={20} style={{ color: C.textMuted, flexShrink: 0 }} />
                                                    <p className="text-sm italic leading-snug" style={{ color: C.textMuted }}>
                                                        Sigue tu camino — este mundo se revelará cuando llegues aquí.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Mundos futuros colapsados */}
                            {hiddenWorlds.map((w, i) => (
                                <div key={w.id} style={{ opacity: 0.38 }}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                            style={{ background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
                                        >
                                            {cutoff + i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs tracking-[0.12em] uppercase" style={{ color: C.textMuted }}>
                                                Mundo {cutoff + i + 1}
                                            </p>
                                            <h2
                                                className="font-bold leading-tight"
                                                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.textMuted }}
                                            >
                                                {w.title}
                                            </h2>
                                        </div>
                                        <span className="ml-auto text-xs" style={{ color: C.border }}>
                                            {w.stations.length} estaciones
                                        </span>
                                    </div>
                                    <div className="ml-4 pl-6 border-l-2" style={{ borderColor: C.border }}>
                                        <div className="h-8" />
                                    </div>
                                </div>
                            ))}
                        </>
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
    index,
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
    index: number
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
                className="w-full rounded-xl p-4 flex flex-col items-center justify-center gap-1"
                style={{ background: C.surface1, border: `1px solid ${C.border}`, minHeight: '72px' }}
            >
                <p className="text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1" style={{ color: C.textMuted, letterSpacing: '0.16em' }}>
                    <Lock size={10} /> Siguiente parada
                </p>
                <p className="text-sm font-semibold text-center" style={{ color: C.textMuted }}>
                    {title}
                </p>
            </div>
        )
    }

    return (
        <div className="relative">
            {isCurrent && (
                <div className="absolute -top-4 right-3 z-10 flex items-center gap-1.5">
                    <span
                        className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: C.red, color: '#fff', letterSpacing: '0.12em' }}
                    >
                        Estás aquí
                    </span>
                    <div style={{ filter: `drop-shadow(0 2px 6px ${C.red}99)` }}>
                        <PinIcon color={C.red} size={32} />
                    </div>
                </div>
            )}
            <button
                onClick={onClick}
                disabled={!unlocked}
                className="w-full text-left rounded-xl p-4 transition-all duration-200"
                style={{
                    background: C.surface1,
                    border: `1px solid ${statusColor}`,
                    opacity: unlocked ? 1 : 0.45,
                    cursor: unlocked ? 'pointer' : 'default',
                    boxShadow: isCurrent ? `0 0 0 2px ${C.red}40` : undefined,
                    paddingTop: isCurrent ? '20px' : undefined,
                }}
            >
                <div className="flex items-start gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                        style={{
                            background: completed ? C.green + '30' : unlocked ? C.red + '20' : C.surface2,
                            color: completed ? C.green : unlocked ? C.red : C.textMuted,
                            border: `1px solid ${statusColor}`,
                        }}
                    >
                        {completed ? '✓' : unlocked ? index : '🔒'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-semibold text-sm leading-snug" style={{ color: unlocked ? C.text : C.textMuted }}>
                                {title}
                            </p>
                            {xpMax > 0 && (
                                <span className="text-xs font-mono shrink-0" style={{ color: completed ? C.green : C.amber }}>
                                    {completed ? `+${xpEarned} XP` : `${xpMax} XP`}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-[11px]" style={{ color: C.textMuted }}>{blockCount} bloques</span>
                            {badgeName && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: C.amber + '20', color: C.amber }}>
                                    🏅 {badgeName}
                                </span>
                            )}
                            {completed && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: C.green + '20', color: C.green }}>
                                    Completada
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </button>
        </div>
    )
}
