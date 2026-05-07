import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { journeyApi } from '../../../services/journey'
import type { Block, BlockInteractResult, JourneyDetailsResponse, Station } from '../../../types/journey'

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

const BLOCK_LABELS: Record<string, string> = {
    punto_partida:      'Punto de Partida',
    capsula:            'Cápsula',
    activacion:         'Activación',
    opciones_respuesta: 'Reflexión',
    accion_real:        'Acción Real',
    evidencia:          'Evidencia',
    refuerzo:           'Refuerzo',
    recompensa:         'Recompensa',
    cierre:             'Cierre',
}

function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function WorldsStation() {
    const { journeyId, stationId } = useParams<{ journeyId: string; stationId: string }>()
    const navigate = useNavigate()

    const [data, setData] = useState<JourneyDetailsResponse | null>(null)
    const [loading, setLoading] = useState(true)

    // Block navigation
    const [blockIndex, setBlockIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, any>>({})
    const [submitting, setSubmitting] = useState(false)
    const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set())
    const [completionResult, setCompletionResult] = useState<BlockInteractResult | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [showWorldCompletion, setShowWorldCompletion] = useState(false)
    const [worldCompletionData, setWorldCompletionData] = useState<{
        world: any; nextWorld: any; xpEarned: number; badges: string[]; currentBadge: string | null; streak: number
    } | null>(null)
    const [xpFlash, setXpFlash] = useState<number | null>(null)

    const topRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!journeyId) return
        journeyApi.getJourneyDetails(journeyId)
            .then(d => {
                setData(d)
                // Mark already-completed blocks
                const done = new Set(
                    d.progress.blockInteractions
                        .filter(bi => bi.isCompleted)
                        .map(bi => bi.blockId)
                )
                setCompletedBlockIds(done)
                // Pre-populate previous responses
                const saved: Record<string, any> = {}
                d.progress.blockInteractions.forEach(bi => {
                    if (bi.responses != null) saved[bi.blockId] = bi.responses
                })
                setResponses(saved)
                // Start at first incomplete block
                const station = findStation(d, stationId!)
                if (station) {
                    const firstIncomplete = station.blocks
                        .slice()
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .findIndex(b => !done.has(b.id))
                    setBlockIndex(firstIncomplete >= 0 ? firstIncomplete : 0)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [journeyId, stationId])

    const station: Station | undefined = data ? findStation(data, stationId!) : undefined
    const blocks = station?.blocks.slice().sort((a, b) => a.orderIndex - b.orderIndex) ?? []
    const currentBlock = blocks[blockIndex]

    const XP_EXCLUDED = ['punto_partida', 'cierre']
    const eligibleBlocks = blocks.filter(b => !XP_EXCLUDED.includes(b.type))
    const xpPerBlock = eligibleBlocks.length > 0
        ? Math.floor((station?.xp ?? 0) / eligibleBlocks.length)
        : 0

    const sortedWorlds = data
        ? data.journey.worlds.slice().sort((a, b) => a.orderIndex - b.orderIndex)
        : []
    const allStationsOrdered = sortedWorlds.flatMap(w =>
        w.stations.slice().sort((a, b) => a.orderIndex - b.orderIndex)
    )
    const currentStationIdx = allStationsOrdered.findIndex(s => s.id === stationId)
    const nextStation = currentStationIdx >= 0 && currentStationIdx < allStationsOrdered.length - 1
        ? allStationsOrdered[currentStationIdx + 1]
        : null

    const currentWorld = sortedWorlds.find(w => w.stations.some(s => s.id === stationId)) ?? null
    const nextStationWorld = nextStation
        ? sortedWorlds.find(w => w.stations.some(s => s.id === nextStation.id)) ?? null
        : null
    const nextStationIsNewWorld = !!nextStation && !!nextStationWorld && nextStationWorld.id !== currentWorld?.id

    const stationAlreadyCompleted = data
        ? data.progress.stationProgress.some(sp => sp.stationId === stationId && sp.isCompleted)
        : false

    const handleSubmitBlock = async (skipCelebration = false): Promise<BlockInteractResult | null> => {
        if (!currentBlock || submitting) return null
        setSubmitting(true)
        try {
            const result: BlockInteractResult = await journeyApi.interactWithBlock(
                currentBlock.id,
                responses[currentBlock.id]
            )
            setCompletedBlockIds(prev => new Set([...prev, currentBlock.id]))

            if (!XP_EXCLUDED.includes(currentBlock.type) && xpPerBlock > 0) {
                const isLastEligible = eligibleBlocks[eligibleBlocks.length - 1]?.id === currentBlock.id
                const remainder = (station?.xp ?? 0) - xpPerBlock * (eligibleBlocks.length - 1)
                setXpFlash(isLastEligible ? remainder : xpPerBlock)
                setTimeout(() => setXpFlash(null), 1800)
            }

            if (result.stationCompleted && !skipCelebration) {
                // Check if the whole world is now complete
                const sortedWorlds = data!.journey.worlds
                    .slice().sort((a, b) => a.orderIndex - b.orderIndex)
                const currentWorld = sortedWorlds.find(w =>
                    w.stations.some((s: any) => s.id === stationId)
                )
                const prevCompleted = new Set(
                    data!.progress.stationProgress
                        .filter((sp: any) => sp.isCompleted)
                        .map((sp: any) => sp.stationId)
                )
                prevCompleted.add(stationId!)

                const worldComplete = currentWorld &&
                    currentWorld.stations.every((s: any) => prevCompleted.has(s.id))

                if (worldComplete && currentWorld) {
                    const worldIdx = sortedWorlds.findIndex((w: any) => w.id === currentWorld.id)
                    const nextWorld = sortedWorlds[worldIdx + 1] ?? null

                    const prevXp = data!.progress.stationProgress
                        .filter((sp: any) => sp.isCompleted && currentWorld.stations.some((s: any) => s.id === sp.stationId))
                        .reduce((sum: number, sp: any) => sum + (sp.xpEarned ?? 0), 0)

                    const worldBadges = currentWorld.stations
                        .map((s: any) => s.badgeName)
                        .filter(Boolean) as string[]

                    setWorldCompletionData({
                        world: currentWorld,
                        nextWorld,
                        xpEarned: prevXp + (result.xpEarned ?? 0),
                        badges: worldBadges,
                        currentBadge: result.badgeEarned ?? null,
                        streak: result.newStreak ?? 0,
                    })
                    setShowWorldCompletion(true)
                } else {
                    setCompletionResult(result)
                    setShowCelebration(true)
                }
            } else if (!result.stationCompleted) {
                const next = blockIndex + 1
                if (next < blocks.length) {
                    setBlockIndex(next)
                    topRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
            }
            return result
        } catch (e) {
            console.error(e)
            return null
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }} />
            </div>
        )
    }

    if (!station) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.text }}>
                <p>Estación no encontrada.</p>
            </div>
        )
    }

    if (showCelebration && completionResult) {
        return (
            <CelebrationScreen
                station={station}
                result={completionResult}
                nextStation={nextStation}
                onGoToNext={nextStation
                    ? () => navigate(`/worlds/${journeyId}/station/${nextStation.id}`)
                    : undefined}
                onContinue={() => navigate(`/worlds/${journeyId}`)}
            />
        )
    }

    if (showWorldCompletion && worldCompletionData) {
        return (
            <WorldCompletionScreen
                data={worldCompletionData}
                onContinue={() => navigate(`/worlds/${journeyId}`)}
            />
        )
    }

    if (stationAlreadyCompleted) {
        const xpEarned = data?.progress.stationProgress
            .find(sp => sp.stationId === stationId)?.xpEarned ?? 0

        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
                style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
            >
                <div className="space-y-6 max-w-sm mx-auto w-full">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: `${C.green}20`, border: `2px solid ${C.green}` }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: C.green }}>
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                            {station.title}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                            Ya completaste esta estación
                        </p>
                    </div>

                    {xpEarned > 0 && (
                        <div
                            className="rounded-xl px-5 py-3 flex items-center justify-between"
                            style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                        >
                            <span className="text-xs tracking-widest uppercase" style={{ color: C.textMuted }}>XP ganado</span>
                            <span className="font-bold font-mono text-xl" style={{ color: C.amber }}>+{xpEarned}</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        {nextStationIsNewWorld && nextStationWorld && (
                            <button
                                onClick={() => navigate(`/worlds/${journeyId}/station/${nextStation!.id}`)}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm"
                                style={{ background: C.red, color: '#fff' }}
                            >
                                Continuar al Mundo {nextStationWorld.orderIndex} →
                            </button>
                        )}
                        {!nextStationIsNewWorld && nextStation && (
                            <button
                                onClick={() => navigate(`/worlds/${journeyId}/station/${nextStation.id}`)}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm"
                                style={{ background: C.red, color: '#fff' }}
                            >
                                Siguiente estación →
                            </button>
                        )}
                        <button
                            onClick={() => navigate(`/worlds/${journeyId}`)}
                            className="w-full py-3.5 rounded-xl text-sm"
                            style={{ background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
                        >
                            ← Volver al mundo
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const completedCount = blocks.filter(b => completedBlockIds.has(b.id)).length
    const stationProgress = blocks.length > 0 ? Math.round((completedCount / blocks.length) * 100) : 0
    const blockAlreadyDone = currentBlock ? completedBlockIds.has(currentBlock.id) : false

    const earnedEligibleCount = eligibleBlocks.filter(b => completedBlockIds.has(b.id)).length
    const allEligibleDone = earnedEligibleCount === eligibleBlocks.length && eligibleBlocks.length > 0
    const visualXpEarned = allEligibleDone
        ? (station?.xp ?? 0)
        : earnedEligibleCount * xpPerBlock

    return (
        <div
            ref={topRef}
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            {/* Top bar */}
            <div
                className="px-6 pt-6 pb-4 flex items-center justify-between gap-4"
                style={{ borderBottom: `1px solid ${C.border}` }}
            >
                <button
                    onClick={() => navigate(`/worlds/${journeyId}`)}
                    className="text-sm shrink-0"
                    style={{ color: C.textMuted }}
                >
                    ← Volver
                </button>
                <div className="flex-1 min-w-0 text-center">
                    <p className="text-xs tracking-[0.12em] uppercase truncate" style={{ color: C.textMuted }}>
                        {station.title}
                    </p>
                </div>
                <span className="text-xs font-mono shrink-0" style={{ color: C.amber }}>
                    {station.xp} XP
                </span>
            </div>

            {/* Station progress bar */}
            <div className="px-6 pt-3 pb-1">
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: C.textMuted }}>
                    <span>Bloque {Math.min(blockIndex + 1, blocks.length)} / {blocks.length}</span>
                    <div className="relative flex items-center gap-2">
                        {xpFlash && (
                            <span
                                className="font-bold font-mono text-[11px] animate-bounce"
                                style={{ color: C.amber }}
                            >
                                +{xpFlash} XP
                            </span>
                        )}
                        <span style={{ color: C.amber, fontFamily: 'monospace' }}>
                            {visualXpEarned} / {station?.xp ?? 0} XP
                        </span>
                    </div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${stationProgress}%`, background: C.red }}
                    />
                </div>
            </div>

            {/* Block dots */}
            <div className="flex gap-1.5 px-6 py-3">
                {blocks.map((b, i) => (
                    <div
                        key={b.id}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                            background: completedBlockIds.has(b.id)
                                ? C.green
                                : i === blockIndex
                                    ? C.red
                                    : C.border,
                        }}
                    />
                ))}
            </div>

            {/* Block content */}
            <div className="flex-1 px-6 pb-8 max-w-2xl mx-auto w-full">
                {currentBlock ? (
                    <BlockPlayer
                        key={currentBlock.id}
                        block={currentBlock}
                        station={station}
                        response={responses[currentBlock.id]}
                        onResponse={val =>
                            setResponses(prev => ({ ...prev, [currentBlock.id]: val }))
                        }
                        alreadyDone={blockAlreadyDone}
                        onSubmit={handleSubmitBlock}
                        submitting={submitting}
                        onNext={() => {
                            const next = blockIndex + 1
                            if (next < blocks.length) {
                                setBlockIndex(next)
                                topRef.current?.scrollIntoView({ behavior: 'smooth' })
                            }
                        }}
                        onPrev={() => {
                            const prev = blockIndex - 1
                            if (prev >= 0) {
                                setBlockIndex(prev)
                                topRef.current?.scrollIntoView({ behavior: 'smooth' })
                            }
                        }}
                        canGoPrev={blockIndex > 0}
                        canGoNext={blockIndex < blocks.length - 1}
                        isLast={blockIndex === blocks.length - 1}
                        nextStationId={nextStation?.id ?? null}
                        journeyId={journeyId!}
                        onCierreSubmit={async (destination: 'next' | 'world') => {
                            await handleSubmitBlock(true)
                            if (destination === 'next' && nextStation) {
                                navigate(`/worlds/${journeyId}/station/${nextStation.id}`)
                            } else {
                                navigate(`/worlds/${journeyId}`)
                            }
                        }}
                    />
                ) : null}
            </div>
        </div>
    )
}

// ─── Block Player ─────────────────────────────────────────────────────────────

function BlockPlayer({
    block,
    station,
    response,
    onResponse,
    alreadyDone,
    onSubmit,
    submitting,
    onNext,
    onPrev,
    canGoPrev,
    canGoNext,
    isLast,
    nextStationId,
    journeyId,
    onCierreSubmit,
}: {
    block: Block
    station: Station
    response: any
    onResponse: (val: any) => void
    alreadyDone: boolean
    onSubmit: () => Promise<BlockInteractResult | null>
    submitting: boolean
    onNext: () => void
    onPrev: () => void
    canGoPrev: boolean
    canGoNext: boolean
    isLast: boolean
    nextStationId: string | null
    journeyId: string
    onCierreSubmit: (destination: 'next' | 'world') => void
}) {
    const label = BLOCK_LABELS[block.type] ?? block.type
    const c = block.content ?? {}

    const isCierre = block.type === 'cierre'

    return (
        <div className="space-y-6 pt-2">
            {/* Block type label */}
            {block.type !== 'refuerzo' && (
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                    {label}
                </p>
            )}

            {/* Block title */}
            {block.title && block.type !== 'refuerzo' && (
                <h2
                    className="text-xl font-bold leading-snug"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                    {block.title}
                </h2>
            )}

            {/* Type-specific content */}
            {block.type === 'punto_partida' && <PuntoPartida content={c} />}
            {block.type === 'capsula' && (
                <Capsula content={c} value={response} onChange={onResponse} disabled={alreadyDone} />
            )}
            {block.type === 'activacion' && (
                <Activacion content={c} value={response} onChange={onResponse} disabled={alreadyDone} />
            )}
            {block.type === 'opciones_respuesta' && (
                <OpcionesRespuesta content={c} value={response} onChange={onResponse} disabled={alreadyDone} />
            )}
            {block.type === 'accion_real' && (
                <AccionReal content={c} value={response} onChange={onResponse} disabled={alreadyDone} />
            )}
            {block.type === 'evidencia' && (
                <Evidencia content={c} value={response} onChange={onResponse} disabled={alreadyDone} />
            )}
            {block.type === 'refuerzo' && <Refuerzo content={c} station={station} />}
            {block.type === 'recompensa' && <Recompensa content={c} />}
            {isCierre && (
                <Cierre
                    content={c}
                    submitting={submitting}
                    hasNextStation={!!nextStationId}
                    onGoToNextStation={() => onCierreSubmit('next')}
                    onGoToWorld={() => onCierreSubmit('world')}
                />
            )}

            {/* CTA — oculto para cierre (maneja su propia navegación) */}
            {!isCierre && (
                <div className="space-y-2 pt-1">
                    {!alreadyDone && (
                        <button
                            onClick={() => onSubmit()}
                            disabled={submitting}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-80"
                            style={{ background: C.red, color: '#fff', opacity: submitting ? 0.6 : 1 }}
                        >
                            {submitting ? 'Guardando...' : block.type === 'refuerzo' ? 'Continuar mi viaje →' : isLast ? 'Completar estación' : 'Continuar'}
                        </button>
                    )}

                    {alreadyDone && canGoNext && (
                        <button
                            onClick={onNext}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm"
                            style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                        >
                            Siguiente →
                        </button>
                    )}

                    {canGoPrev && (
                        <button
                            onClick={onPrev}
                            className="w-full py-3 rounded-xl text-sm"
                            style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                        >
                            ← Anterior
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Block type renderers ─────────────────────────────────────────────────────

function PuntoPartida({ content }: { content: any }) {
    return (
        <div className="space-y-4">
            {content.text && (
                <p className="text-base leading-relaxed" style={{ color: C.text }}>
                    {content.text}
                </p>
            )}
            {content.quote && (
                <blockquote
                    className="border-l-4 pl-4 py-1 italic text-sm"
                    style={{ borderColor: C.red, color: C.textMuted }}
                >
                    "{content.quote}"
                    {content.quoteAuthor && (
                        <footer className="mt-1 not-italic text-xs" style={{ color: C.textMuted }}>
                            — {content.quoteAuthor}
                        </footer>
                    )}
                </blockquote>
            )}
        </div>
    )
}

function parseBold(text: string): React.ReactNode {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
}

function Capsula({
    content, value, onChange, disabled,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
    const v = value ?? {}
    const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null

    const inputStyle = {
        background: C.surface2,
        border: `1px solid ${C.border}`,
        color: C.text,
        opacity: disabled ? 0.6 : 1,
    }

    const userField = (
        label: string,
        key: string,
        placeholder: string,
        multiline?: boolean,
        rows?: number
    ) => (
        <div key={key} className="space-y-1">
            <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: C.textMuted }}>
                {label}
            </p>
            {multiline ? (
                <textarea
                    rows={rows ?? 3}
                    placeholder={placeholder}
                    value={v[key] ?? ''}
                    onChange={e => onChange({ ...v, [key]: e.target.value })}
                    disabled={disabled}
                    className="w-full rounded-xl p-3 text-sm resize-none outline-none placeholder:opacity-30"
                    style={inputStyle}
                />
            ) : (
                <input
                    placeholder={placeholder}
                    value={v[key] ?? ''}
                    onChange={e => onChange({ ...v, [key]: e.target.value })}
                    disabled={disabled}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                    style={inputStyle}
                />
            )}
        </div>
    )

    return (
        <div className="space-y-5">
            {/* Texto del admin */}
            {content.text && (
                <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                    {parseBold(content.text)}
                </p>
            )}

            {/* Video opcional */}
            {embedUrl && (
                <div className="rounded-xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video de cápsula"
                    />
                </div>
            )}
            {content.videoUrl && !embedUrl && (
                <video src={content.videoUrl} controls className="w-full rounded-xl"
                    style={{ background: C.surface2 }} />
            )}

            {/* Transición al input */}
            <p
                className="text-sm leading-relaxed italic text-center px-2"
                style={{ color: C.textMuted, fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
                Lo que acabas de leer no es teoría — es un espejo. Ponlo en tus palabras.
            </p>

            {/* Inputs del usuario */}
            <div
                className="rounded-xl p-4 space-y-4"
                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
            >
                {userField('Concepto del libro (100–150 palabras)', 'concept',
                    'Escribe la idea central del libro que conecta con esta estación...', true, 5)}
                {userField('Cita literal del libro', 'quote',
                    '"Frase exacta del libro (máx 30 palabras)..."', true, 3)}
                {userField('Fuente', 'quoteSource',
                    'Nombre del libro — Autor')}
                {userField('Frase puente', 'bridge',
                    'Frase que conecta la idea del libro con tu realidad...', true, 3)}
            </div>
        </div>
    )
}

function Activacion({
    content, value, onChange, disabled,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
    const question = content.question ?? content.prompt ?? ''
    const options: string[] = content.options ?? []
    const multiple = content.selectionType === 'multiple'

    // value shape: { mode: 'text'|'select', text: string, selected: string[] }
    // handle legacy string value
    const v = typeof value === 'string'
        ? { mode: 'text', text: value, selected: [] }
        : (value ?? { mode: 'text', text: '', selected: [] })

    const mode: string = v.mode ?? 'text'
    const setMode = (m: string) => onChange({ ...v, mode: m })

    const toggleOption = (opt: string) => {
        if (disabled) return
        const current: string[] = v.selected ?? []
        if (multiple) {
            onChange({ ...v, selected: current.includes(opt) ? current.filter((x: string) => x !== opt) : [...current, opt] })
        } else {
            onChange({ ...v, selected: [opt] })
        }
    }

    const isSelected = (opt: string) =>
        multiple ? (v.selected ?? []).includes(opt) : (v.selected ?? [])[0] === opt

    const TABS = [
        { id: 'text',   label: 'Escribir', enabled: true },
        { id: 'select', label: 'Elegir',   enabled: options.length > 0 },
        { id: 'audio',  label: 'Audio',    enabled: false },
    ]

    return (
        <div className="space-y-4">
            {question && (
                <p className="text-base leading-relaxed" style={{ color: C.text }}>
                    {question}
                </p>
            )}

            {/* Mode tabs */}
            <div className="flex gap-2">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => tab.enabled && setMode(tab.id)}
                        disabled={!tab.enabled || disabled}
                        className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all"
                        style={{
                            border: `1px solid ${mode === tab.id && tab.enabled ? C.red : C.border}`,
                            color: mode === tab.id && tab.enabled ? C.red : tab.enabled ? C.text : C.border,
                            background: C.surface2,
                            cursor: tab.enabled && !disabled ? 'pointer' : 'default',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Escribir */}
            {mode === 'text' && (
                <textarea
                    rows={5}
                    placeholder="Escribe tu respuesta aquí..."
                    value={v.text ?? ''}
                    onChange={e => onChange({ ...v, text: e.target.value })}
                    disabled={disabled}
                    className="w-full rounded-xl p-4 text-sm resize-none outline-none transition placeholder:opacity-30"
                    style={{
                        background: C.surface2,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
            )}

            {/* Elegir */}
            {mode === 'select' && (
                <div className="space-y-2">
                    {options.map((opt, i) => {
                        const isOtra = opt === 'Otra — escribo yo'
                        const sel = isSelected(opt)
                        return (
                            <div key={i} className="space-y-2">
                                <button
                                    onClick={() => toggleOption(opt)}
                                    disabled={disabled}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                    style={{
                                        background: sel ? C.red + '20' : C.surface2,
                                        border: `1px solid ${sel ? C.red : C.border}`,
                                        color: sel ? C.text : C.textMuted,
                                        opacity: disabled && !sel ? 0.5 : 1,
                                    }}
                                >
                                    <span
                                        className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3 shrink-0"
                                        style={{
                                            borderColor: sel ? C.red : C.border,
                                            background: sel ? C.red : 'transparent',
                                            color: '#fff',
                                        }}
                                    >
                                        {sel ? '✓' : ''}
                                    </span>
                                    {opt}
                                </button>
                                {isOtra && sel && (
                                    <input
                                        autoFocus
                                        maxLength={20}
                                        placeholder="Escribe aquí (máx. 20 caracteres)"
                                        value={v.otherText ?? ''}
                                        onChange={e => onChange({ ...v, otherText: e.target.value })}
                                        disabled={disabled}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none placeholder:opacity-30"
                                        style={{
                                            background: C.surface2,
                                            border: `1px solid ${C.red}`,
                                            color: C.text,
                                            opacity: disabled ? 0.6 : 1,
                                        }}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Audio — deshabilitado */}
            {mode === 'audio' && (
                <div
                    className="rounded-xl p-6 flex flex-col items-center justify-center gap-2"
                    style={{ background: C.surface1, border: `1px dashed ${C.border}`, opacity: 0.38 }}
                >
                    <p className="text-xs text-center" style={{ color: C.textMuted }}>
                        Nota de voz — próximamente
                    </p>
                </div>
            )}
        </div>
    )
}

function OpcionesRespuesta({
    content, value, onChange, disabled,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
    const options: string[] = content.options ?? []
    const multiple: boolean = content.multiple ?? false
    const prompt = content.prompt ?? content.question ?? ''

    const toggle = (opt: string) => {
        if (disabled) return
        if (multiple) {
            const current: string[] = value ?? []
            onChange(
                current.includes(opt) ? current.filter(x => x !== opt) : [...current, opt]
            )
        } else {
            onChange(opt)
        }
    }

    const isSelected = (opt: string) => {
        if (multiple) return (value ?? []).includes(opt)
        return value === opt
    }

    return (
        <div className="space-y-4">
            {prompt && <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{prompt}</p>}
            <div className="space-y-2">
                {options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => toggle(opt)}
                        disabled={disabled}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                        style={{
                            background: isSelected(opt) ? C.red + '20' : C.surface2,
                            border: `1px solid ${isSelected(opt) ? C.red : C.border}`,
                            color: isSelected(opt) ? C.text : C.textMuted,
                            opacity: disabled && !isSelected(opt) ? 0.5 : 1,
                        }}
                    >
                        <span
                            className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3"
                            style={{
                                borderColor: isSelected(opt) ? C.red : C.border,
                                background: isSelected(opt) ? C.red : 'transparent',
                                color: '#fff',
                            }}
                        >
                            {isSelected(opt) ? '✓' : ''}
                        </span>
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}

function AccionReal({
    content, value, onChange, disabled,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
    const phrase = content.phrase ?? ''

    const TABS = [
        { id: 'text',  label: 'Texto app',   enabled: true },
        { id: 'photo', label: 'Foto escrita', enabled: false },
        { id: 'audio', label: 'Audio',        enabled: false },
    ]

    return (
        <div className="space-y-5">
            {/* Phrase box */}
            {phrase && (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    <div className="px-4 pt-4 pb-2" style={{ background: C.surface1 }}>
                        <p className="text-[10px] tracking-[0.16em] uppercase mb-3" style={{ color: C.textMuted }}>
                            Tu frase
                        </p>
                        <p
                            className="text-base leading-relaxed italic mb-3"
                            style={{ color: C.text, fontFamily: 'Georgia, "Times New Roman", serif' }}
                        >
                            "{phrase}"
                        </p>
                    </div>
                    <div className="px-4 pb-4" style={{ background: C.surface1 }}>
                        <textarea
                            rows={3}
                            placeholder="completa aquí..."
                            value={value ?? ''}
                            onChange={e => onChange(e.target.value)}
                            disabled={disabled}
                            className="w-full rounded-lg p-3 text-sm resize-none outline-none"
                            style={{
                                background: C.surface2,
                                border: `1px solid ${C.border}`,
                                color: C.text,
                                opacity: disabled ? 0.6 : 1,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Evidence tabs */}
            <div className="space-y-3">
                <p className="text-sm" style={{ color: C.textMuted }}>¿Cómo envías tu evidencia?</p>
                <div className="flex gap-2">
                    {TABS.map(tab => (
                        <div
                            key={tab.id}
                            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold text-center"
                            style={{
                                border: `1px solid ${tab.id === 'text' ? C.red : C.border}`,
                                color: tab.id === 'text' ? C.red : C.border,
                                background: C.surface2,
                                cursor: 'default',
                            }}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>

                {/* Photo placeholder — siempre visible, deshabilitado */}
                <div
                    className="rounded-xl p-6 flex flex-col items-center justify-center gap-2"
                    style={{ background: C.surface1, border: `1px dashed ${C.border}`, opacity: 0.38 }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: C.textMuted }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p className="text-xs text-center" style={{ color: C.textMuted }}>
                        Sube foto de lo escrito<br />a mano — opcional
                    </p>
                </div>
            </div>
        </div>
    )
}

function Evidencia({
    content, value, onChange, disabled,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
    const prompt = content.prompt ?? content.instruction ?? ''

    return (
        <div className="space-y-4">
            {prompt && <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{prompt}</p>}
            <textarea
                rows={4}
                placeholder="Describe tu evidencia, aprendizajes o reflexiones..."
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full rounded-xl p-4 text-sm resize-none outline-none"
                style={{
                    background: C.surface2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    opacity: disabled ? 0.6 : 1,
                }}
            />
        </div>
    )
}

function Refuerzo({ content, station }: { content: any; station: Station }) {
    const msg1 = content.message1 ?? content.message ?? ''
    const msg2 = content.message2 ?? ''
    const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null

    return (
        <div className="space-y-6">
            {/* XP + station completed */}
            <div className="flex flex-col items-center gap-3 py-2">
                <div
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                    style={{ background: C.surface1, border: `2px solid ${C.amber}40` }}
                >
                    <span className="text-2xl font-bold font-mono" style={{ color: C.amber }}>
                        +{station.xp}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase" style={{ color: C.amber }}>
                        XP
                    </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: C.green }}>
                    {station.title} completada
                </p>
            </div>

            {/* Refuerzo messages */}
            {(msg1 || msg2) && (
                <div
                    className="rounded-xl p-4 space-y-3"
                    style={{ background: C.surface1, border: `1px solid ${C.green}40` }}
                >
                    <p className="text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ color: C.green }}>
                        Refuerzo
                    </p>
                    {msg1 && (
                        <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                            "{parseBold(msg1)}"
                        </p>
                    )}
                    {msg1 && msg2 && (
                        <div style={{ height: '1px', background: `${C.green}20` }} />
                    )}
                    {msg2 && (
                        <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                            "{parseBold(msg2)}"
                        </p>
                    )}
                </div>
            )}

            {/* Video opcional */}
            {embedUrl && (
                <div className="rounded-xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video de refuerzo"
                    />
                </div>
            )}
            {content.videoUrl && !embedUrl && (
                <video src={content.videoUrl} controls className="w-full rounded-xl"
                    style={{ background: C.surface2 }} />
            )}
        </div>
    )
}

function Recompensa({ content }: { content: any }) {
    return (
        <div className="space-y-4 text-center">
            {content.message && (
                <p
                    className="text-lg leading-relaxed"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.text }}
                >
                    {content.message}
                </p>
            )}
            {content.xp && (
                <div
                    className="inline-block px-6 py-2 rounded-full font-mono font-bold text-xl"
                    style={{ background: C.amber + '20', color: C.amber }}
                >
                    +{content.xp} XP
                </div>
            )}
        </div>
    )
}

function Cierre({
    content,
    submitting,
    hasNextStation,
    onGoToNextStation,
    onGoToWorld,
}: {
    content: any
    submitting: boolean
    hasNextStation: boolean
    onGoToNextStation: () => void
    onGoToWorld: () => void
}) {
    const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null

    return (
        <div className="space-y-5">
            {content.text && (
                <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                    {content.text}
                </p>
            )}

            {embedUrl && (
                <div className="rounded-xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video de cierre"
                    />
                </div>
            )}

            {content.videoUrl && !embedUrl && (
                <video
                    src={content.videoUrl}
                    controls
                    className="w-full rounded-xl"
                    style={{ background: C.surface2 }}
                />
            )}

            <div className="space-y-3 pt-2">
                {hasNextStation && (
                    <button
                        onClick={onGoToNextStation}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-80"
                        style={{ background: C.red, color: '#fff', opacity: submitting ? 0.6 : 1 }}
                    >
                        {submitting ? 'Guardando...' : 'Siguiente estación →'}
                    </button>
                )}
                <button
                    onClick={onGoToWorld}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{ background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}`, opacity: submitting ? 0.6 : 1 }}
                >
                    ← Volver al mundo
                </button>
            </div>
        </div>
    )
}

// ─── World completion screen ──────────────────────────────────────────────────

function WorldCompletionScreen({
    data,
    onContinue,
}: {
    data: { world: any; nextWorld: any; xpEarned: number; badges: string[]; currentBadge: string | null; streak: number }
    onContinue: () => void
}) {
    const { world, nextWorld, xpEarned, badges, currentBadge, streak } = data
    const worldNum = world.orderIndex ?? 1

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            {/* Red header */}
            <div
                className="flex flex-col items-center justify-center gap-3 px-6 pt-12 pb-10"
                style={{ background: C.red }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#231F20' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h1
                    className="text-2xl font-bold text-center leading-tight"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#fff' }}
                >
                    {world.title}
                </h1>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Mundo {worldNum} completado
                    {streak > 0 ? ` · ${streak} días · racha intacta` : ''}
                </p>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full space-y-6">
                {/* XP total */}
                <div
                    className="rounded-xl px-5 py-4 flex items-center justify-between"
                    style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                >
                    <span className="text-xs tracking-[0.14em] uppercase" style={{ color: C.textMuted }}>
                        XP Total
                    </span>
                    <span className="text-3xl font-bold font-mono" style={{ color: C.amber }}>
                        {xpEarned}
                    </span>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: C.textMuted }}>
                            Insignias ganadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((b, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-3 py-1.5 rounded-full font-semibold"
                                    style={{
                                        border: `1px solid ${b === currentBadge ? C.red : C.border}`,
                                        color: b === currentBadge ? C.red : C.textMuted,
                                        background: C.surface1,
                                    }}
                                >
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={onContinue}
                        className="w-full py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{ background: C.red, color: '#fff' }}
                    >
                        {nextWorld ? `Continuar al Mundo ${nextWorld.orderIndex}` : 'Completar viaje'}
                    </button>
                    {nextWorld && (
                        <p className="text-xs text-center" style={{ color: C.textMuted }}>
                            Próximo:{' '}
                            <span style={{ color: C.green }}>{nextWorld.title}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Celebration screen ───────────────────────────────────────────────────────

function CelebrationScreen({
    station,
    result,
    nextStation,
    onGoToNext,
    onContinue,
}: {
    station: Station
    result: BlockInteractResult
    nextStation: { id: string; title: string } | null
    onGoToNext?: () => void
    onContinue: () => void
}) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            <div className="space-y-6 max-w-sm mx-auto">
                <div className="text-5xl">🎉</div>

                <h1
                    className="text-3xl font-bold leading-tight"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                    ¡Estación completada!
                </h1>

                <p className="text-sm" style={{ color: C.textMuted }}>
                    {station.title}
                </p>

                {/* XP earned */}
                <div
                    className="rounded-2xl p-6 space-y-4"
                    style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold font-mono" style={{ color: C.amber }}>
                            +{result.xpEarned ?? 0}
                        </span>
                        <span className="text-lg" style={{ color: C.amber }}>XP</span>
                    </div>

                    {(result.streakBonus ?? 0) > 0 && (
                        <div
                            className="rounded-lg px-4 py-2 text-sm"
                            style={{ background: C.amber + '15', color: C.amber }}
                        >
                            🔥 Bonus racha: +{result.streakBonus} XP
                        </div>
                    )}

                    {result.newStreak && result.newStreak > 0 && (
                        <p className="text-sm" style={{ color: C.textMuted }}>
                            Racha actual: <span style={{ color: C.amber }}>{result.newStreak} días</span>
                        </p>
                    )}

                    {result.badgeEarned && (
                        <div
                            className="rounded-lg px-4 py-2 text-sm"
                            style={{ background: C.green + '15', color: C.green }}
                        >
                            🏅 ¡Obtuviste el badge "{result.badgeEarned}"!
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {nextStation && onGoToNext && (
                        <button
                            onClick={onGoToNext}
                            className="w-full py-4 rounded-xl font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                            style={{ background: C.red, color: '#fff' }}
                        >
                            Siguiente estación →
                        </button>
                    )}
                    {nextStation && (
                        <p className="text-xs" style={{ color: C.textMuted }}>
                            Próxima:{' '}
                            <span style={{ color: C.green }}>{nextStation.title}</span>
                        </p>
                    )}
                    <button
                        onClick={onContinue}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                        style={{
                            background: nextStation ? C.surface2 : C.red,
                            color: nextStation ? C.textMuted : '#fff',
                            border: nextStation ? `1px solid ${C.border}` : 'none',
                        }}
                    >
                        {nextStation ? '← Volver al mundo' : 'Continuar mi viaje →'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findStation(data: JourneyDetailsResponse, stationId: string) {
    for (const world of data.journey.worlds) {
        for (const station of world.stations) {
            if (station.id === stationId) return station
        }
    }
    return undefined
}
