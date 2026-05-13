import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { journeyApi } from '../../../services/journey'
import type { Area, Journey, UserJourneyProgress } from '../../../types/journey'
import { useAuth } from '../../../store/useAuth'

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

const HEADER_H = '30vh'

export default function WorldsHome() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [areas, setAreas] = useState<Area[]>([])
    const [loading, setLoading] = useState(true)
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

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

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const fadeOpacity = Math.max(0, 1 - scrollY / (vh * 0.3))

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
                <div
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }}
                />
            </div>
        )
    }

    if (allJourneys.length === 0) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center"
                style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
            >
                <p className="text-lg mb-2" style={{ fontFamily: 'Georgia, serif', color: C.textMuted }}>
                    Próximamente
                </p>
                <p className="text-sm" style={{ color: C.textMuted }}>
                    Los retos de esta sección están en preparación.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-8 text-sm px-4 py-2 rounded-lg"
                    style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                >
                    ← Volver
                </button>
            </div>
        )
    }

    return (
        <div style={{ background: C.bg, fontFamily: 'Montserrat, sans-serif' }}>

            {/* ── Fixed header with background image ── */}
            <div
                className="fixed top-0 left-0 right-0 bg-cover overflow-hidden"
                style={{
                    height: HEADER_H,
                    backgroundImage: 'url(/frank-van-hulst-dVaJ-yJjUvs-unsplash.jpg)',
                    backgroundPosition: 'center 30%',
                    opacity: fadeOpacity,
                    pointerEvents: fadeOpacity < 0.05 ? 'none' : 'auto',
                    zIndex: 30,
                }}
            >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(35,31,32,0.2), rgba(35,31,32,0.98))' }} />
                <div className="relative z-10 h-full px-6 flex items-center justify-between">
                    <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.textMuted }}>
                        DEEP END·&nbsp;{user?.membership?.toUpperCase() ?? 'TEST'}
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-xs px-3 py-1.5 rounded-lg transition"
                        style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                    >
                        ← Volver
                    </button>
                </div>
            </div>

            {/* ── Journey screens (no background image) ── */}
            {allJourneys.map((journey, idx) => (
                <JourneyScreen
                    key={journey.id}
                    journey={journey}
                    totalStations={totalStations(journey)}
                    totalXpMax={totalXpMax(journey)}
                    topOffset={idx === 0 ? HEADER_H : 0}
                    isFirst={idx === 0}
                    index={idx}
                    onStart={() => navigate(`/worlds/${journey.id}`)}
                />
            ))}
        </div>
    )
}

function JourneyScreen({
    journey,
    totalStations,
    totalXpMax,
    topOffset,
    isFirst,
    index,
    onStart,
}: {
    journey: Journey & { areaName: string }
    totalStations: number
    totalXpMax: number
    topOffset: string | number
    isFirst: boolean
    index: number
    onStart: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [imageOpacity, setImageOpacity] = useState(0)

    useEffect(() => {
        if (isFirst) return
        const onScroll = () => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const vh = window.innerHeight
            const imageH = vh * 0.30
            const fadeIn  = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.35)))
            const fadeOut = Math.min(1, Math.max(0, 1 + rect.top / (imageH * 0.6)))
            setImageOpacity(Math.min(fadeIn, fadeOut))
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [isFirst])

    const userJourney = (journey as any).userJourneys?.[0] as UserJourneyProgress | undefined
    const isStarted = !!userJourney
    const isCompleted = userJourney?.status === 'completado'
    const xpEarned = userJourney?.totalXpEarned ?? 0
    const progress = totalXpMax > 0 ? Math.round((xpEarned / totalXpMax) * 100) : 0
    const worldTitle = journey.worlds?.[0]?.title ?? 'Mundo 1'
    const numDays = (journey.worlds?.length ?? 0) * 2 || 7
    const ctaLabel = isCompleted ? 'Ver mi historia' : isStarted ? 'Continuar mi viaje' : 'Comenzar mi viaje'


    return (
        <div
            ref={containerRef}
            className="relative min-h-screen flex flex-col overflow-hidden"
            style={{ color: C.text, paddingTop: topOffset }}
        >
            {/* Hero image with area info overlaid — non-first screens */}
            {!isFirst && (
                <>
                    {/* Hero image */}
                    <div className="relative overflow-hidden" style={{ height: '30vh' }}>
                        <img
                            src="/frank-van-hulst-dVaJ-yJjUvs-unsplash.jpg"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            style={{ opacity: imageOpacity }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{ background: 'linear-gradient(to bottom, rgba(35,31,32,0.9) 0%, rgba(35,31,32,0.1) 30%, rgba(35,31,32,0.1) 55%, rgba(35,31,32,1) 100%)' }}
                        />
                    </div>

                    {/* Area + world label — below image, not touching gradient */}
                    <div className="relative flex flex-col items-center text-center px-6 pt-5 pb-2">
                        <span
                            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center pointer-events-none select-none"
                            style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontSize: '28vw',
                                fontWeight: 700,
                                color: C.text,
                                opacity: 0.06,
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="relative z-10 text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: C.textMuted }}>
                            {journey.areaName}
                        </p>
                        <div className="relative z-10 flex items-center gap-3 w-full max-w-xs mt-2">
                            <div className="flex-1 h-px" style={{ background: C.border }} />
                            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                                {worldTitle}
                            </span>
                            <div className="flex-1 h-px" style={{ background: C.border }} />
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col items-center text-center gap-4 px-6 pt-10 pb-10">

                {isFirst && (
                    <p className="text-xs tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                        {journey.areaName} · {worldTitle}
                    </p>
                )}

                <h1
                    className="text-4xl font-bold leading-tight max-w-xs"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                    {journey.title}
                </h1>

                {journey.description && (
                    <p className="text-sm leading-relaxed max-w-xs" style={{ color: C.textMuted }}>
                        {journey.description}
                    </p>
                )}

                {/* Stats */}
                <div
                    className="w-full max-w-xs rounded-xl grid grid-cols-3 divide-x divide-[#333330]"
                    style={{ border: `1px solid ${C.border}` }}
                >
                    <StatCell value={String(totalStations)} label="estaciones" />
                    <StatCell value={String(numDays)} label="días" />
                    <StatCell value={String(totalXpMax)} label="XP máx" amber />
                </div>

                {/* Progress */}
                {isStarted && (
                    <div className="w-full max-w-xs space-y-2">
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
                                🔥 Racha activa:{' '}
                                <span style={{ color: C.amber }}>{userJourney!.currentStreak} días</span>
                            </p>
                        )}
                    </div>
                )}

                {/* CTA */}
                <div className="w-full max-w-xs flex flex-col items-center gap-3 mt-2">
                    <button
                        onClick={onStart}
                        className="w-full py-4 rounded-full font-semibold text-sm tracking-wide transition-opacity hover:opacity-90 active:opacity-80"
                        style={{ background: C.red, color: '#fff' }}
                    >
                        {ctaLabel}
                    </button>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                        Puedes pausar cuando quieras
                    </p>
                </div>

            </div>
        </div>
    )
}

function StatCell({ value, label, amber }: { value: string; label: string; amber?: boolean }) {
    return (
        <div className="py-4 flex flex-col items-center gap-1">
            <span
                className="text-xl font-bold"
                style={{ fontFamily: 'monospace', color: amber ? C.amber : C.text }}
            >
                {value}
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                {label}
            </span>
        </div>
    )
}
