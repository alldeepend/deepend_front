import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { journeyApi } from '../../../services/journey'
import type { Area, Journey, UserJourneyProgress } from '../../../types/journey'
import { useAuth } from '../../../store/useAuth'

// ─── DeepEnd brand colors ─────────────────────────────────────────────────────
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

export default function WorldsHome() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [areas, setAreas] = useState<Area[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const allJourneys: (Journey & { areaName: string })[] = areas.flatMap(a =>
        a.journeys.map(j => ({ ...j, areaName: a.name }))
    )

    const totalStations = (j: Journey) =>
        (j.worlds ?? []).reduce((s, w) => s + (w.stations?.length ?? 0), 0)

    const totalXpMax = (j: Journey) =>
        (j.worlds ?? []).reduce((s, w) => (w.stations ?? []).reduce((ss, st) => ss + (st.xp || 0), s), 0)

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            {/* Top bar con banner */}
            <div
                className="px-6 pt-8 pb-4 flex items-center justify-between relative overflow-hidden bg-center md:bg-[center_40%]"
                style={{
                    borderBottom: `1px solid ${C.border}`,
                    backgroundImage: 'url(/frank-van-hulst-dVaJ-yJjUvs-unsplash.jpg)',
                    backgroundSize: 'cover',
                }}
            >
                <div className="absolute inset-0" style={{ background: 'rgba(35,31,32,0.72)' }} />
                <div className="relative z-10 flex items-center justify-between w-full">
                <div>
                    <p className="text-xs tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                        DEEPEND · {user?.membership?.toUpperCase() || 'TEST'}
                    </p>
                    <h1
                        className="text-3xl font-bold mt-1"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                        Mi Viaje
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm px-4 py-2 rounded-lg transition"
                    style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                >
                    ← Volver
                </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }} />
                    </div>
                ) : allJourneys.length === 0 ? (
                    <div className="text-center py-16" style={{ color: C.textMuted }}>
                        <p className="text-lg mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                            Próximamente
                        </p>
                        <p className="text-sm">Los retos de esta sección están en preparación.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {allJourneys.map(journey => (
                            <JourneyCard
                                key={journey.id}
                                journey={journey}
                                totalStations={totalStations(journey)}
                                totalXpMax={totalXpMax(journey)}
                                onStart={() => navigate(`/worlds/${journey.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Journey card ─────────────────────────────────────────────────────────────

function JourneyCard({
    journey,
    totalStations,
    totalXpMax,
    onStart,
}: {
    journey: Journey & { areaName: string }
    totalStations: number
    totalXpMax: number
    onStart: () => void
}) {
    const userJourney = (journey as any).userJourneys?.[0] as UserJourneyProgress | undefined
    const isStarted = !!userJourney
    const isCompleted = userJourney?.status === 'completado'
    const xpEarned = userJourney?.totalXpEarned ?? 0
    const progress = totalXpMax > 0 ? Math.round((xpEarned / totalXpMax) * 100) : 0

    return (
        <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: C.surface1, border: `1px solid ${C.border}` }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p
                        className="text-[10px] tracking-[0.15em] uppercase mb-2"
                        style={{ color: C.textMuted }}
                    >
                        {journey.areaName} · {(journey.worlds?.length ?? 0) > 0 ? journey.worlds[0].title : 'Mundo 1'}
                    </p>
                    <h2
                        className="text-2xl font-bold leading-tight"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.text }}
                    >
                        {journey.title}
                    </h2>
                    {journey.description && (
                        <p className="text-sm mt-2 leading-relaxed" style={{ color: C.textMuted }}>
                            {journey.description}
                        </p>
                    )}
                </div>
                {isCompleted && (
                    <span
                        className="text-xs px-3 py-1 rounded-full font-semibold shrink-0"
                        style={{ background: C.green + '20', color: C.green }}
                    >
                        Completado
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
                <Stat value={String(totalStations)} label="estaciones" />
                <Stat value={`${(journey.worlds?.length ?? 0) * 2 || 7}`} label="días" />
                <Stat
                    value={`${totalXpMax}`}
                    label="XP máx"
                    amber
                />
            </div>

            {/* Progress bar (if started) */}
            {isStarted && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs" style={{ color: C.textMuted }}>
                        <span>Progreso</span>
                        <span style={{ color: C.amber, fontFamily: 'monospace' }}>
                            {xpEarned} / {totalXpMax} XP
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: C.amber }}
                        />
                    </div>
                    {(userJourney?.currentStreak ?? 0) > 0 && (
                        <p className="text-xs" style={{ color: C.textMuted }}>
                            🔥 Racha activa: <span style={{ color: C.amber }}>{userJourney!.currentStreak} días</span>
                        </p>
                    )}
                </div>
            )}

            {/* CTA */}
            <button
                onClick={onStart}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-80"
                style={{ background: C.red, color: '#fff' }}
            >
                {isCompleted ? 'Ver mi historia' : isStarted ? 'Continuar mi viaje' : 'Comenzar mi viaje'}
            </button>
        </div>
    )
}

function Stat({ value, label, amber }: { value: string; label: string; amber?: boolean }) {
    return (
        <div className="text-center">
            <p
                className="text-xl font-bold"
                style={{
                    fontFamily: 'monospace',
                    color: amber ? C.amber : C.text,
                }}
            >
                {value}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                {label}
            </p>
        </div>
    )
}
