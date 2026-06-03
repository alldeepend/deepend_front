import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { journeyApi } from '../../../services/journey'
import type { Area, Journey, UserJourneyProgress } from '../../../types/journey'
import { useAuth } from '../../../store/useAuth'
import { HomeSidebar } from '../../home/HomeSidebar'

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
    forest: '#1B4332',
}

function parseInline(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*_[^_*]+_\*\*|_\*\*[^_*]+\*\*_|\*\*[^*]+\*\*|_[^_]+_)/g)
    return parts.map((part, i) => {
        if ((part.startsWith('**_') && part.endsWith('_**')) ||
            (part.startsWith('_**') && part.endsWith('**_')))
            return <strong key={i}><em>{part.slice(3, -3)}</em></strong>
        if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('_') && part.endsWith('_'))
            return <em key={i}>{part.slice(1, -1)}</em>
        return part
    })
}

function RichText({ text }: { text: string }) {
    return (
        <>
            {text.split('\n').map((line, i, arr) => (
                <span key={i}>
                    {parseInline(line)}
                    {i < arr.length - 1 && <br />}
                </span>
            ))}
        </>
    )
}

export default function WorldsHome() {
    const navigate  = useNavigate()
    const { user }  = useAuth()
    const [areas, setAreas]       = useState<Area[]>([])
    const [loading, setLoading]   = useState(true)
    const [currentIdx, setCurrentIdx] = useState(0)
    const [descOpenId, setDescOpenId] = useState<string | null>(null)

    useEffect(() => {
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const allJourneys: (Journey & { areaName: string })[] = areas
        .flatMap(a => a.journeys.map(j => ({ ...j, areaName: a.name })))
        .sort((a, b) => {
            const statusRank = (j: Journey) => {
                const uj = (j as any).userJourneys?.[0] as UserJourneyProgress | undefined
                if (uj && uj.status !== 'completado') return 0  // in-progress first
                if (!uj) return 1                               // not started second
                return 2                                        // completed last
            }
            return statusRank(a) - statusRank(b)
        })

    const totalStations = (j: Journey) =>
        (j.worlds ?? []).reduce((s, w) => s + (w.stations?.length ?? 0), 0)

    const totalXpMax = (j: Journey) =>
        (j.worlds ?? []).reduce((s, w) => (w.stations ?? []).reduce((ss, st) => ss + (st.xp || 0), s), 0)

    // section 0 = hero, sections 1..N = journeys
    const totalSections = 1 + allJourneys.length

    const goTo = (idx: number) => {
        setCurrentIdx(Math.max(0, Math.min(idx, totalSections - 1)))
    }

    // Restaura la sección guardada tras volver de un reto (por ID para sobrevivir el re-sort)
    useEffect(() => {
        if (allJourneys.length === 0) return
        const savedId = sessionStorage.getItem('worldsHomeJourneyId')
        if (savedId) {
            const idx = allJourneys.findIndex(j => j.id === savedId)
            if (idx >= 0) setCurrentIdx(idx + 1)
            sessionStorage.removeItem('worldsHomeJourneyId')
        }
    }, [allJourneys.length])

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

    return (
        <div className="flex" style={{ height: '100dvh', overflow: 'hidden', background: C.bg, fontFamily: 'Montserrat, sans-serif' }}>

            {/* Sidebar (desktop only) */}
            <div className="hidden md:block flex-shrink-0 h-full">
                <HomeSidebar activeTab="Mundos" dark />
            </div>

            {/* Slider viewport */}
            <div className="flex-1 flex justify-center overflow-hidden">
                <div className="w-full max-w-md md:max-w-none overflow-hidden relative">

                    {/* Sliding track */}
                    <div
                        style={{
                            transform: `translateY(calc(${-currentIdx} * 100dvh))`,
                            transition: 'transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)',
                            willChange: 'transform',
                        }}
                    >

                        {/* ── Sección 0: Hero ── */}
                        <div className="relative flex flex-col" style={{ height: '100dvh' }}>
                            {/* Imagen de fondo */}
                            <img
                                src="/frank-van-hulst-dVaJ-yJjUvs-unsplash.jpg"
                                className="absolute inset-0 w-full h-full object-cover object-center"
                                alt=""
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to bottom, rgba(35,31,32,0.5) 0%, rgba(35,31,32,0.2) 35%, rgba(35,31,32,0.6) 100%)' }}
                            />

                            {/* Top bar */}
                            <div className="relative z-10 flex items-center justify-between px-6 pt-10">
                                <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.textMuted }}>
                                    DEEP END · {user?.membership?.toUpperCase() ?? 'TEST'}
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-xs px-3 py-1.5 rounded-lg"
                                    style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                                >
                                    ← Volver
                                </button>
                            </div>

                            {/* Contenido central */}
                            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
                                <img
                                    src="/Logos_Variaciones-02.png"
                                    alt="DeepEnd"
                                    className="w-44 object-contain"
                                />
                                <h1
                                    className="text-3xl font-bold leading-snug"
                                    style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                                >
                                    Bienvenido a los Mundos
                                </h1>
                                {allJourneys.length > 0 && (
                                    <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.textMuted }}>
                                        {allJourneys.length} {allJourneys.length === 1 ? 'reto disponible' : 'retos disponibles'}
                                    </p>
                                )}
                            </div>

                            {/* Hint inferior */}
                            <div className="relative z-10 flex flex-col items-center pb-10 gap-2">
                                <p className="text-xs tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                                    Explora los retos
                                </p>
                            </div>
                        </div>

                        {/* ── Secciones 1..N: Retos ── */}
                        {allJourneys.map((journey, idx) => {
                            const userJourney = (journey as any).userJourneys?.[0] as UserJourneyProgress | undefined
                            const isStarted   = !!userJourney
                            const isCompleted = userJourney?.status === 'completado'
                            const xpEarned    = userJourney?.totalXpEarned ?? 0
                            const xpMax       = totalXpMax(journey)
                            const progress    = xpMax > 0 ? Math.round((xpEarned / xpMax) * 100) : 0
                            const worldTitle  = journey.worlds?.[0]?.title ?? 'Mundo 1'
                            const numDays     = (journey.worlds?.length ?? 0) * 2 || 7
                            const ctaLabel    = isCompleted ? 'Ver mi historia' : isStarted ? 'Continuar mi viaje' : 'Comenzar mi viaje'
                            const stations    = totalStations(journey)

                            return (
                                <div
                                    key={journey.id}
                                    className="flex flex-col overflow-hidden"
                                    style={{ height: '100dvh', background: C.bg }}
                                >
                                    {/* ── Zona superior: contador + área + título ── */}
                                    <div className="relative z-10 flex flex-col gap-4 px-6 pt-14 text-center">
                                        <p className="text-xs tracking-[0.3em] uppercase" style={{ color: C.textMuted }}>
                                            {String(idx + 1).padStart(2, '0')} / {String(allJourneys.length).padStart(2, '0')}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-px" style={{ background: C.border }} />
                                            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.textMuted }}>
                                                {journey.areaName} · {worldTitle}
                                            </p>
                                            <div className="flex-1 h-px" style={{ background: C.border }} />
                                        </div>
                                        <h1
                                            className="text-5xl font-bold leading-tight"
                                            style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                                        >
                                            {journey.title}
                                        </h1>
                                    </div>

                                    {/* ── Franja central: imagen + descripción + stats ── */}
                                    <div className="flex-1 flex flex-col justify-between px-6 py-5 relative">
                                        {/* Imagen de fondo */}
                                        <img
                                            src="/allison-saeng-hMPqCk0R1uk-unsplash-modified.jpg"
                                            className="absolute inset-x-6 inset-y-0 w-[calc(100%-3rem)] h-full object-cover object-center pointer-events-none rounded-xl"
                                            style={{ opacity: 0.45 }}
                                            alt=""
                                        />
                                        <div
                                            className="absolute inset-x-6 inset-y-0 rounded-xl pointer-events-none"
                                            style={{ background: 'linear-gradient(to bottom, rgba(35,31,32,0.3) 0%, transparent 25%, transparent 65%, rgba(35,31,32,0.6) 100%)' }}
                                        />

                                        {/* Descripción — truncada + botón */}
                                        {journey.description && (
                                            <div className="relative z-10 space-y-2 px-3">
                                                <div
                                                    className="text-sm leading-relaxed"
                                                    style={{
                                                        color: '#C4BDB6',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'pre-line',
                                                    }}
                                                >
                                                    <RichText text={journey.description} />
                                                </div>
                                                <button
                                                    onClick={() => setDescOpenId(journey.id)}
                                                    className="text-xs font-semibold tracking-wide transition-opacity hover:opacity-70"
                                                    style={{ color: C.red }}
                                                >
                                                    + Leer descripción completa
                                                </button>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div
                                            className="relative z-10 w-full rounded-xl grid grid-cols-3 divide-x divide-[#6B6560]"
                                            style={{ border: '1px solid #6B6560' }}
                                        >
                                            <StatCell value={String(stations)} label="estaciones" />
                                            <StatCell value={String(numDays)} label="días" />
                                            <StatCell value={String(xpMax)} label="XP máx" amber />
                                        </div>
                                    </div>

{/* ── Zona inferior: progreso + CTA ── */}
                                    <div className="relative z-10 flex flex-col gap-4 px-6 pt-5 pb-32">

                                        {/* Progreso */}
                                        {isStarted && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs" style={{ color: C.textMuted }}>
                                                    <span>Progreso</span>
                                                    <span style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                                                        {xpEarned} / {xpMax} XP
                                                    </span>
                                                </div>
                                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%`, background: C.amber }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <button
                                            onClick={() => {
                                                sessionStorage.setItem('worldsHomeJourneyId', journey.id)
                                                navigate(`/worlds/${journey.id}`)
                                            }}
                                            className="w-full py-4 rounded-full font-semibold text-sm tracking-wide transition-opacity hover:opacity-90 active:opacity-80"
                                            style={{ background: C.red, color: '#fff' }}
                                        >
                                            {ctaLabel}
                                        </button>

                                        <p className="text-xs text-center" style={{ color: C.textMuted }}>
                                            Puedes pausar cuando quieras
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Sheet: descripción completa */}
            {descOpenId && (() => {
                const j = allJourneys.find(j => j.id === descOpenId)
                if (!j?.description) return null
                return (
                    <div
                        className="fixed inset-0 z-[60] flex items-end justify-center"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setDescOpenId(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded-t-2xl p-6 overflow-y-auto"
                            style={{ maxHeight: '72vh', background: C.surface1, border: `1px solid ${C.border}` }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: C.border }} />
                            <p className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: C.textMuted }}>{j.areaName}</p>
                            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}>{j.title}</h3>
                            <div className="space-y-4">
                                {j.description.split(/\n\n+/).map((para, pi) => (
                                    <p key={pi} className="text-sm leading-relaxed" style={{ color: '#C4BDB6' }}>
                                        <RichText text={para} />
                                    </p>
                                ))}
                            </div>
                            <button
                                onClick={() => setDescOpenId(null)}
                                className="mt-6 w-full py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
                                style={{ background: C.border, color: C.textMuted }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )
            })()}

            {/* Botones de navegación */}
            <div className="fixed bottom-16 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-50 flex flex-row gap-3">
                {currentIdx > 0 && (
                    <button
                        onClick={() => goTo(currentIdx - 1)}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                        style={{ background: C.surface1, border: `1px solid ${C.border}`, color: C.text }}
                        aria-label="Sección anterior"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                    </button>
                )}
                {currentIdx < totalSections - 1 && (
                    <button
                        onClick={() => goTo(currentIdx + 1)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${currentIdx === 0 ? 'animate-bounce' : ''}`}
                        style={{ background: C.red, color: '#fff' }}
                        aria-label="Siguiente sección"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

function StatCell({ value, label, amber }: { value: string; label: string; amber?: boolean }) {
    return (
        <div className="py-4 flex flex-col items-center gap-1">
            <span
                className="text-xl font-bold"
                style={{ fontFamily: "'DM Mono', monospace", color: amber ? C.amber : C.text }}
            >
                {value}
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>
                {label}
            </span>
        </div>
    )
}
