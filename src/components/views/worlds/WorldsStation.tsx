import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Sparkles, Award, Flame } from 'lucide-react'
import { journeyApi } from '../../../services/journey'
import type { Block, BlockInteractResult, GateStatus, JourneyDetailsResponse, Station } from '../../../types/journey'

import { C } from '../../../styles/colors'
import WorldsRightSidebar, { badgesForJourney, badgeColorFor } from './WorldsRightSidebar'
import { HomeSidebar } from '../../home/HomeSidebar'
import { PhotoUploadField, AudioRecorderField, SkipCheckbox } from './EvidenceFields'
import { parseBold, parseText, parseTextWithRecalls } from './textParsing'
import { getRecalledAnswer, getRecalledGateAnswer, resolveRecallRef } from './recallUtils'

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
    const [gateStatus, setGateStatus] = useState<GateStatus | null>(null)

    // Block navigation
    const [blockIndex, setBlockIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, any>>({})
    const [submitting, setSubmitting] = useState(false)
    const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set())
    const [completionResult, setCompletionResult] = useState<BlockInteractResult | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [showWorldCompletion, setShowWorldCompletion] = useState(false)
    const [worldCompletionData, setWorldCompletionData] = useState<{
        world: any; nextWorld: any; xpEarned: number; badges: string[]; currentBadge: string | null; streak: number; completionImageUrl: string | null; completionVideoUrl: string | null
    } | null>(null)
    const [xpFlash, setXpFlash] = useState<number | null>(null)
    const [xpFlashGreen, setXpFlashGreen] = useState(false)
    const [reviewMode, setReviewMode] = useState(false)
    const [showExitWarning, setShowExitWarning] = useState(false)

    const topRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!journeyId) return
        // Reset all transient state when navigating to a new station
        setLoading(true)
        setShowCelebration(false)
        setShowWorldCompletion(false)
        setCompletionResult(null)
        setWorldCompletionData(null)
        setXpFlash(null)
        setBlockIndex(0)
        setCompletedBlockIds(new Set())
        setResponses({})
        setReviewMode(false)
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

    // Para poder recordar respuestas de la Puerta (7 días) dentro de un bloque
    useEffect(() => {
        if (!journeyId) return
        journeyApi.getGateStatus(journeyId).then(setGateStatus).catch(console.error)
    }, [journeyId])

    const station: Station | undefined = data ? findStation(data, stationId!) : undefined
    const blocks = station?.blocks.slice().sort((a, b) => a.orderIndex - b.orderIndex) ?? []
    const currentBlock = blocks[blockIndex]
    // Recordatorio legacy (un solo botón debajo del bloque) — bloques guardados
    // antes de que existieran los marcadores {N} dentro del texto.
    const legacyRecalledAnswer = !currentBlock?.content?.recallRefs
        ? (currentBlock?.content?.recallGateDayId
            ? getRecalledGateAnswer(gateStatus, currentBlock.content.recallGateDayId)
            : getRecalledAnswer(data, currentBlock?.content?.recallBlockId))
        : null
    // Recordatorios nuevos — se resuelven aquí y se insertan inline donde el
    // admin puso el marcador {N} dentro del campo de texto del bloque.
    const recalls: (string | null)[] = (currentBlock?.content?.recallRefs ?? [])
        .map((ref: string) => resolveRecallRef(ref, data ?? null, gateStatus))

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
            const rawResponse = responses[currentBlock.id]
            // Si el usuario marcó "omitir", se guarda el mensaje que definió el admin en vez del objeto de respuesta
            const responseToSubmit = (rawResponse && typeof rawResponse === 'object' && rawResponse.skipped)
                ? ((currentBlock.content as any)?.skipLabel || 'Prefiero no responder esta pregunta')
                : rawResponse

            const wasAlreadyDone = completedBlockIds.has(currentBlock.id)

            const result: BlockInteractResult = await journeyApi.interactWithBlock(
                currentBlock.id,
                responseToSubmit
            )
            setCompletedBlockIds(prev => new Set([...prev, currentBlock.id]))

            if (!wasAlreadyDone && !XP_EXCLUDED.includes(currentBlock.type) && xpPerBlock > 0) {
                const isLastEligible = eligibleBlocks[eligibleBlocks.length - 1]?.id === currentBlock.id
                const remainder = (station?.xp ?? 0) - xpPerBlock * (eligibleBlocks.length - 1)
                setXpFlash(isLastEligible ? remainder : xpPerBlock)
                setXpFlashGreen(true)
                setTimeout(() => setXpFlashGreen(false), 1400)
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
                        completionImageUrl: currentWorld.imageUrl ?? null,
                        completionVideoUrl: currentWorld.completionVideoUrl ?? null,
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
                onReview={() => { setReviewMode(true); setShowCelebration(false) }}
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

    if (stationAlreadyCompleted && !reviewMode) {
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
                        <h2 className="text-lg font-bold" style={{ fontFamily: "'American Typewriter', Georgia, serif" }}>
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
                            onClick={() => setReviewMode(true)}
                            className="w-full py-3.5 rounded-xl text-sm font-medium"
                            style={{ background: C.surface1, color: C.green, border: `1px solid ${C.green}` }}
                        >
                            Ver mis respuestas
                        </button>
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
    // Los bloques ya respondidos siguen editables mientras la estación no esté
    // completa del todo — solo se bloquean en modo revisión (estación ya cerrada).
    const blocksLocked = reviewMode

    const earnedEligibleCount = eligibleBlocks.filter(b => completedBlockIds.has(b.id)).length
    const allEligibleDone = earnedEligibleCount === eligibleBlocks.length && eligibleBlocks.length > 0
    const visualXpEarned = allEligibleDone
        ? (station?.xp ?? 0)
        : earnedEligibleCount * xpPerBlock

    return (
        <div className="flex" style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}>
        <HomeSidebar activeTab="Mundos" dark />
        <div
            ref={topRef}
            className="flex-1 flex flex-col min-h-screen"
        >
            {/* Exit warning popup */}
            {showExitWarning && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-6"
                    style={{ background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(4px)' }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 space-y-5"
                        style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                    >
                        <div className="space-y-2">
                            <h3
                                className="text-base font-bold leading-snug text-center"
                                style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                            >
                                ¿Salir de la estación?
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                                Tu progreso parcial se guarda, pero si no completas esta estación en los próximos{' '}
                                <span style={{ color: C.amber }}>7 días</span>, tendrás que comenzarla de nuevo desde el primer bloque.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowExitWarning(false)}
                                className="w-full py-3 rounded-xl font-semibold text-sm"
                                style={{ background: C.red, color: '#fff' }}
                            >
                                Continuar estación
                            </button>
                            <button
                                onClick={() => navigate(`/worlds/${journeyId}`)}
                                className="w-full py-3 rounded-xl text-sm"
                                style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                            >
                                Salir de todas formas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top bar */}
            <div
                className="px-6 pt-6 pb-4 flex items-center justify-between gap-4"
                style={{ borderBottom: `1px solid ${C.border}` }}
            >
                <button
                    onClick={() => stationAlreadyCompleted ? navigate(`/worlds/${journeyId}`) : setShowExitWarning(true)}
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
                <span className="text-xs shrink-0" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
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
                                className="font-bold text-[11px] animate-bounce"
                                style={{
                                    color: xpFlashGreen ? C.green : C.amber,
                                    fontFamily: "'DM Mono', monospace",
                                    transition: 'color 0.4s ease',
                                }}
                            >
                                +{xpFlash} XP
                            </span>
                        )}
                        <span style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
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
                        legacyRecalledAnswer={legacyRecalledAnswer}
                        recalls={recalls}
                        response={responses[currentBlock.id]}
                        onResponse={val =>
                            setResponses(prev => ({ ...prev, [currentBlock.id]: val }))
                        }
                        locked={blocksLocked}
                        onSubmit={handleSubmitBlock}
                        submitting={submitting}
                        isLastStation={nextStation === null}
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
                        nextBlockType={blocks[blockIndex + 1]?.type ?? null}
                        nextStationId={nextStation?.id ?? null}
                        journeyId={journeyId!}
                        onGoToNextStation={nextStation
                            ? () => navigate(`/worlds/${journeyId}/station/${nextStation.id}`)
                            : undefined}
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
        <WorldsRightSidebar mode="journey" journeyTitle={data?.journey.title} badges={data ? badgesForJourney(data.journey, data.progress.userJourney) : []} totalXp={data?.progress.userJourney?.totalXpEarned ?? 0} />
        </div>
    )
}

// ─── Response validation ──────────────────────────────────────────────────────

function isResponseValid(blockType: string, response: any): boolean {
    switch (blockType) {
        case 'punto_partida':
        case 'capsula':
        case 'refuerzo':
        case 'recompensa':
            return true

        case 'activacion': {
            const v = response ?? {}
            if (v.skipped) return true
            if (v.selectedRoute) {
                const answers: string[] = (v.allRouteAnswers ?? {})[v.selectedRoute] ?? []
                return answers.length > 0 && answers.every(a => !!(a?.trim()))
            }
            const mode = v.mode ?? 'text'
            if (mode === 'reescritura_guiada') {
                const completions: string[] = v.completions ?? []
                return completions.length === 4 && completions.every(c => c.trim())
            }
            if (mode === 'banco' || mode === 'texto') {
                const answers: any[] = v.answers ?? []
                return answers.length > 0 && answers.every(a => {
                    if (typeof a === 'string') return !!a.trim()
                    if (a?.guided) return !!(a.text?.trim())
                    return false
                })
            }
            if (mode === 'text') return !!(v.text?.trim())
            if (mode === 'select') {
                const selected: string[] = v.selected ?? []
                if (selected.length === 0) return false
                if (selected.includes('Otra — escribo yo')) return !!(v.otherText?.trim())
                return true
            }
            if (mode === 'audio') return !!v.audioUrl
            return false
        }

        case 'opciones_respuesta':
            if (response && typeof response === 'object' && !Array.isArray(response) && response.skipped) return true
            if (Array.isArray(response)) return response.length > 0
            return !!response

        case 'accion_real':
            if (typeof response === 'object' && response !== null) {
                if (response.skipped) return true
                if ('selected' in response) {
                    if (!response.selected) return false
                    if (response.selected === 'guided') return !!(response.guidedText?.trim())
                    return true
                }
                if ('activeTab' in response) {
                    if (response.activeTab === 'photo') return !!response.photoUrl
                    if (response.activeTab === 'audio') return !!response.audioUrl
                    return !!(response.text?.trim())
                }
                if ('text' in response) return !!(response.text?.trim())
            }
            return !!(typeof response === 'string' && response.trim())

        case 'evidencia':
            if (response && typeof response === 'object' && response.skipped) return true
            return !!(typeof response === 'string' && response.trim())

        default:
            return true
    }
}

// ─── Block Player ─────────────────────────────────────────────────────────────

function BlockPlayer({
    block,
    station,
    legacyRecalledAnswer,
    recalls,
    response,
    onResponse,
    locked,
    onSubmit,
    submitting,
    onNext,
    onPrev,
    canGoPrev,
    canGoNext,
    isLast,
    isLastStation,
    nextStationId,
    journeyId: _journeyId,
    nextBlockType,
    onCierreSubmit,
    onGoToNextStation,
}: {
    block: Block
    station: Station
    legacyRecalledAnswer: string | null
    recalls: (string | null)[]
    response: any
    onResponse: (val: any) => void
    locked: boolean
    onSubmit: () => Promise<BlockInteractResult | null>
    submitting: boolean
    onNext: () => void
    onPrev: () => void
    canGoPrev: boolean
    canGoNext: boolean
    isLast: boolean
    isLastStation: boolean
    nextStationId: string | null
    journeyId: string
    nextBlockType: string | null
    onCierreSubmit: (destination: 'next' | 'world') => void
    onGoToNextStation?: () => void
}) {
    const label = BLOCK_LABELS[block.type] ?? block.type
    const c = block.content ?? {}
    const [showLegacyRecall, setShowLegacyRecall] = useState(false)

    const isCierre = block.type === 'cierre'
    const canSubmit = isResponseValid(block.type, response)

    const showStation1Celebration = block.type === 'punto_partida' && station.orderIndex === 2
    const showLastStationCelebration = block.type === 'punto_partida' && isLastStation

    return (
        <div className="space-y-6 pt-2">
            {/* Micro-celebración estación 1 completada */}
            {showStation1Celebration && (
                <div
                    className="rounded-2xl px-5 py-4 flex items-center gap-4"
                    style={{ background: `${C.amber}12`, border: `1px solid ${C.amber}40` }}
                >
                    <span className="text-2xl shrink-0">⭐</span>
                    <div>
                        <p className="text-xs font-bold tracking-wide uppercase" style={{ color: C.amber }}>
                            ¡Estación 1 completada!
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>
                            Diste el primer paso. Eso ya dice mucho de ti.
                        </p>
                    </div>
                </div>
            )}

            {/* Micro-celebración última estación */}
            {showLastStationCelebration && (
                <div
                    className="rounded-2xl px-5 py-4 flex items-center gap-4"
                    style={{ background: `${C.red}12`, border: `1px solid ${C.red}40` }}
                >
                    <span className="text-2xl shrink-0">🏁</span>
                    <div>
                        <p className="text-xs font-bold tracking-wide uppercase" style={{ color: C.red }}>
                            ¡Última estación!
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>
                            Has llegado hasta aquí. Esto es lo que pocos logran.
                        </p>
                    </div>
                </div>
            )}

            {/* Block type label */}
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                {label}
            </p>

            {/* Block title */}
            {block.title && (
                <h2
                    className="text-xl font-bold leading-snug"
                    style={{ fontFamily: "'American Typewriter', Georgia, serif" }}
                >
                    {block.title}
                </h2>
            )}

            {/* Recordatorio de respuesta anterior (legacy — bloques guardados antes de los marcadores {N}) */}
            {legacyRecalledAnswer && (
                <div>
                    {!showLegacyRecall ? (
                        <button
                            type="button"
                            onClick={() => setShowLegacyRecall(true)}
                            className="text-xs px-3 py-2 rounded-lg font-medium transition-colors"
                            style={{ background: C.surface1, border: `1px solid ${C.border}`, color: C.textMuted }}
                        >
                            {c.recallLabel || '¿No recuerdas tu respuesta anterior? Verla aquí'}
                        </button>
                    ) : (
                        <div
                            className="rounded-xl px-4 py-3"
                            style={{ background: C.surface1, border: `1px solid ${C.green}40` }}
                        >
                            <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: C.green }}>
                                Tu respuesta anterior
                            </p>
                            <p className="text-sm leading-relaxed italic" style={{ color: C.text }}>
                                "{legacyRecalledAnswer}"
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Type-specific content */}
            {block.type === 'punto_partida' && <PuntoPartida content={c} recalls={recalls} />}
            {block.type === 'capsula' && <Capsula content={c} recalls={recalls} />}
            {block.type === 'activacion' && (
                <Activacion content={c} value={response} onChange={onResponse} disabled={locked} blockId={block.id} />
            )}
            {block.type === 'opciones_respuesta' && (
                <OpcionesRespuesta content={c} value={response} onChange={onResponse} disabled={locked} />
            )}
            {block.type === 'accion_real' && (
                <AccionReal content={c} value={response} onChange={onResponse} disabled={locked} blockId={block.id} />
            )}
            {block.type === 'evidencia' && (
                <Evidencia content={c} value={response} onChange={onResponse} disabled={locked} />
            )}
            {block.type === 'refuerzo' && <Refuerzo content={c} recalls={recalls} />}
            {block.type === 'recompensa' && <Recompensa content={c} />}
            {isCierre && (
                <Cierre
                    content={c}
                    recalls={recalls}
                    submitting={submitting}
                    hasNextStation={!!nextStationId}
                    onGoToNextStation={() => onCierreSubmit('next')}
                    onGoToWorld={() => onCierreSubmit('world')}
                />
            )}

            {/* CTA — oculto para cierre (maneja su propia navegación) */}
            {!isCierre && (
                <div className="space-y-2 pt-1">
                    {!locked && nextBlockType === 'refuerzo' && canSubmit && (
                        <div
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed"
                            style={{ background: `${C.amber}20`, border: `1px solid ${C.amber}50` }}
                        >
                            <span className="shrink-0 text-base" style={{ color: C.amber }}>⚠</span>
                            <p style={{ color: C.text }}>
                                Si quieres modificar tu respuesta, <strong>este es el momento</strong> — una vez que avances no podrás editar esta estación.
                            </p>
                        </div>
                    )}
                    {!locked && (
                        <>
                            <button
                                onClick={() => onSubmit()}
                                disabled={submitting || !canSubmit}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-80"
                                style={{
                                    background: C.red,
                                    color: '#fff',
                                    opacity: submitting || !canSubmit ? 0.4 : 1,
                                    cursor: !canSubmit ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {submitting ? 'Guardando...' : block.type === 'refuerzo' ? 'Continuar mi viaje →' : isLast ? 'Completar estación' : 'Continuar'}
                            </button>
                            {!canSubmit && (
                                <p className="text-xs text-center" style={{ color: C.textMuted }}>
                                    Completa la actividad para continuar
                                </p>
                            )}
                        </>
                    )}

                    {locked && canGoNext && (
                        <button
                            onClick={onNext}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm"
                            style={{ background: `${C.green}20`, color: C.green, border: `2px solid ${C.green}`, cursor: 'pointer' }}
                        >
                            Siguiente →
                        </button>
                    )}

                    {locked && isLast && !isLastStation && onGoToNextStation && (
                        <button
                            onClick={onGoToNextStation}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm"
                            style={{ background: C.red, color: '#fff' }}
                        >
                            Siguiente estación →
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

function PuntoPartida({ content, recalls }: { content: any; recalls: (string | null)[] }) {
    return (
        <div className="space-y-4">
            {content.text && (
                <div className="space-y-3">{parseTextWithRecalls(content.text, recalls, 'text-base leading-relaxed')}</div>
            )}
            {content.quote && (
                <blockquote
                    className="border-l-4 pl-4 py-1 italic text-sm"
                    style={{ borderColor: C.red, color: C.textMuted, fontFamily: "'American Typewriter', Georgia, serif" }}
                >
                    "{parseBold(content.quote)}"
                    {content.quoteAuthor && (
                        <footer className="mt-1 not-italic text-xs" style={{ color: C.textMuted }}>
                            — {content.quoteAuthor}
                        </footer>
                    )}
                </blockquote>
            )}
            <img src={content.imageUrl ?? '/2 (2).jpg'} alt="" className="w-full rounded-2xl object-cover object-bottom" style={{ height: '530px' }} />
        </div>
    )
}


function Capsula({ content, recalls }: { content: any; recalls: (string | null)[] }) {
    const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null

    return (
        <div className="space-y-5">
            {content.text && (
                <div className="space-y-3">{parseTextWithRecalls(content.text, recalls)}</div>
            )}

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

            {(content.concept || content.quote || content.bridge) && <div className="rounded-xl p-5 space-y-5" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                {content.concept && (
                    <div className="space-y-1.5">
                        <p className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: C.textMuted }}>
                            Concepto
                        </p>
                        <div className="space-y-3">{parseText(content.concept)}</div>
                    </div>
                )}

                {content.quote && (
                    <div
                        className="pl-4 space-y-2"
                        style={{ borderLeft: `3px solid ${C.red}` }}
                    >
                        {content.quoteSource && (
                            <p className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: C.red }}>
                                {parseBold(content.quoteSource)}
                            </p>
                        )}
                        <p className="text-sm leading-relaxed" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                            {parseBold(content.quote)}
                        </p>
                    </div>
                )}

                {content.bridge && (
                    <div className="space-y-1.5">
                        <p className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: C.textMuted }}>
                            Frase destacada
                        </p>
                        <p
                            className="text-sm leading-relaxed italic"
                            style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                        >
                            {parseBold(content.bridge)}
                        </p>
                    </div>
                )}
            </div>}
        </div>
    )
}

function Activacion({
    content, value, onChange, disabled, blockId,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean; blockId: string }) {
    const [showRouteChangeWarning, setShowRouteChangeWarning] = useState(false)
    const question = content.question ?? content.prompt ?? ''
    const options: string[] = content.options ?? []
    const multiple = content.selectionType === 'multiple'
    const isReescritura = content.selectionType === 'reescritura_guiada'
    const isPreguntas = content.selectionType === 'preguntas'
    const isArbol = content.selectionType === 'arbol_decision'
    const fields: string[] = content.fields?.length
        ? content.fields
        : ['Antes creía que:', 'Eso me llevó a:', 'Lo que ahora comprendo es:', 'Desde esta comprensión, puedo:']
    const pQuestions: { text: string; phrases: string[] }[] = content.questions ?? []

    // value shape: { mode: 'text'|'select'|'reescritura_guiada'|'banco'|'texto', text, selected, completions, answers }
    const v = typeof value === 'string'
        ? { mode: 'text', text: value, selected: [], completions: [], answers: [] }
        : (value ?? { mode: isReescritura ? 'reescritura_guiada' : isPreguntas ? 'banco' : 'text', text: '', selected: [], completions: [], answers: [] })

    const mode: string = v.mode ?? (isReescritura ? 'reescritura_guiada' : isPreguntas ? 'banco' : 'text')
    const setMode = (m: string) => onChange({ ...v, mode: m })

    const completions: string[] = v.completions ?? []
    const setCompletion = (i: number, text: string) => {
        const next = [...completions]
        while (next.length < fields.length) next.push('')
        next[i] = text
        onChange({ ...v, mode: 'reescritura_guiada', completions: next })
    }

    const pAnswers: any[] = v.answers ?? []

    const setPAnswer = (i: number, val: any) => {
        const next = [...pAnswers]
        while (next.length < pQuestions.length) next.push('')
        next[i] = val
        onChange({ ...v, answers: next })
    }

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
        { id: 'text',   label: 'Escribe',      enabled: true },
        { id: 'select', label: 'Elige',        enabled: options.length > 0 },
        { id: 'audio',  label: 'Nota de voz',  enabled: true },
    ]

    // ── Preguntas con banco de frases ──
    if (isPreguntas) {
        const responseMode = (mode === 'banco' || mode === 'texto') ? mode : 'banco'
        return (
            <div className="space-y-5">
                {question && (
                    <p className="text-base leading-relaxed" style={{ color: C.text }}>{parseBold(question)}</p>
                )}

                {/* Question list */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                    <p className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: C.textMuted }}>
                        {pQuestions.length} preguntas
                    </p>
                    {pQuestions.map((q, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-sm font-bold shrink-0 mt-0.5" style={{ color: C.red }}>{i + 1}.</span>
                            <p className="text-sm leading-relaxed" style={{ color: C.text }}>{parseBold(q.text)}</p>
                        </div>
                    ))}
                </div>

                {content.allowSkip && (
                    <SkipCheckbox
                        checked={!!v.skipped}
                        label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                        onChange={skipped => onChange({ ...v, skipped })}
                        disabled={disabled}
                    />
                )}

                {/* Response mode selector */}
                {!v.skipped && (
                <div className="space-y-2">
                    <p className="text-xs" style={{ color: C.textMuted }}>Opciones de respuesta — para cada una de las {pQuestions.length} preguntas</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'texto', label: 'Escribe tu respuesta' },
                            { id: 'banco', label: 'Te ayudo con frases' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => !disabled && onChange({ mode: opt.id, answers: [] })}
                                disabled={disabled}
                                className="py-3 px-3 rounded-xl text-xs font-semibold text-center transition-all"
                                style={{
                                    border: `1px solid ${responseMode === opt.id ? C.green : C.amber}`,
                                    color: responseMode === opt.id ? C.green : C.amber,
                                    background: C.surface2,
                                    cursor: disabled ? 'default' : 'pointer',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                )}

                {/* Banco de frases — sequential banks */}
                {!v.skipped && responseMode === 'banco' && pQuestions.map((q, i) => {
                    const isUnlocked = i === 0 || pAnswers.slice(0, i).every(a =>
                        typeof a === 'string' ? !!a.trim() : !!(a?.text?.trim())
                    )
                    const sel = pAnswers[i] ?? ''
                    return (
                        <div key={i} className="space-y-2">
                            <p
                                className="text-[10px] tracking-[0.14em] uppercase font-semibold"
                                style={{ color: isUnlocked ? C.textMuted : C.border }}
                            >
                                {parseBold(q.text)}
                            </p>
                            {isUnlocked ? (
                                <div className="space-y-2">
                                    {q.phrases.map((phrase: any, pi: number) => {
                                        const isGuidedPhrase = typeof phrase === 'object' && phrase?.isGuided
                                        if (isGuidedPhrase) {
                                            const isActive = sel?.guided === true && sel?.prefix === phrase.prefix
                                            const guidedText: string = isActive ? (sel.text ?? '') : ''
                                            return (
                                                <div
                                                    key={pi}
                                                    className="rounded-xl overflow-hidden"
                                                    style={{ border: `1px solid ${isActive ? C.green : C.border}` }}
                                                >
                                                    <div className="px-4 pt-3 pb-1" style={{ background: C.surface1 }}>
                                                        <p
                                                            className="text-sm leading-relaxed italic"
                                                            style={{ color: C.textMuted, fontFamily: "'American Typewriter', Georgia, serif" }}
                                                        >
                                                            {phrase.prefix}
                                                        </p>
                                                    </div>
                                                    <div className="px-4 pb-3" style={{ background: C.surface1 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="completa aquí..."
                                                            value={guidedText}
                                                            onChange={e => !disabled && setPAnswer(i, e.target.value
                                                                ? { guided: true, prefix: phrase.prefix, text: e.target.value }
                                                                : ''
                                                            )}
                                                            disabled={disabled}
                                                            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                                                            style={{
                                                                background: C.surface2,
                                                                border: `1px solid ${guidedText.trim() ? `${C.green}60` : C.border}`,
                                                                color: C.text,
                                                                opacity: disabled ? 0.6 : 1,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        }
                                        const isChosen = typeof sel === 'string' && sel === phrase
                                        return (
                                            <button
                                                key={pi}
                                                onClick={() => !disabled && setPAnswer(i, isChosen ? '' : phrase)}
                                                disabled={disabled}
                                                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                                style={{
                                                    background: isChosen ? `${C.green}20` : C.surface2,
                                                    border: `1px solid ${isChosen ? C.green : C.border}`,
                                                    color: isChosen ? C.text : C.textMuted,
                                                    opacity: disabled && !isChosen ? 0.5 : 1,
                                                }}
                                            >
                                                <span
                                                    className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3 shrink-0"
                                                    style={{
                                                        borderColor: isChosen ? C.green : C.border,
                                                        background: isChosen ? C.green : 'transparent',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    {isChosen ? '✓' : ''}
                                                </span>
                                                {phrase}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div
                                    className="rounded-xl p-4 text-center"
                                    style={{ background: C.surface1, border: `1px dashed ${C.border}`, opacity: 0.45 }}
                                >
                                    <p className="text-xs" style={{ color: C.textMuted }}>
                                        Responde la pregunta {i} para desbloquear
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Texto libre */}
                {!v.skipped && responseMode === 'texto' && pQuestions.map((q, i) => (
                    <div key={i} className="space-y-2">
                        <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                            <span style={{ color: C.red, fontWeight: 700 }}>{i + 1}. </span>{parseBold(q.text)}
                        </p>
                        <textarea
                            rows={4}
                            maxLength={500}
                            placeholder="Tu respuesta..."
                            value={pAnswers[i] ?? ''}
                            onChange={e => setPAnswer(i, e.target.value)}
                            onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }}
                            disabled={disabled}
                            className="w-full rounded-xl p-3 text-sm resize-none outline-none placeholder:opacity-30"
                            style={{
                                background: C.surface2,
                                border: `1px solid ${pAnswers[i]?.trim() ? `${C.green}60` : C.border}`,
                                color: C.text,
                                opacity: disabled ? 0.6 : 1,
                            }}
                        />
                        <p className="text-xs text-right mt-1" style={{ color: (pAnswers[i] ?? '').length > 450 ? C.red : C.textMuted }}>
                            {(pAnswers[i] ?? '').length}/500
                        </p>
                    </div>
                ))}
            </div>
        )
    }

    // ── Árbol de decisiones ──
    if (isArbol) {
        const routes: { id: string; label: string; description: string; questions: (string | { isGuided: true; prefix: string })[] }[] = content.routes ?? []
        const selectedRoute: string | null = value?.selectedRoute ?? null
        // allRouteAnswers guarda respuestas por ruta: { A: [...], B: [...] }
        const allRouteAnswers: Record<string, string[]> = value?.allRouteAnswers ?? {}
        const routeAnswers: string[] = allRouteAnswers[selectedRoute ?? ''] ?? []
        const activeRoute = routes.find(r => r.id === selectedRoute) ?? null
        const hasChangedRoute: boolean = value?.hasChangedRoute ?? false
        const skipped: boolean = typeof value === 'object' && value !== null ? !!value.skipped : false

        const selectRoute = (id: string) => {
            if (disabled || skipped) return
            onChange({ selectedRoute: id, allRouteAnswers, hasChangedRoute })
        }
        const setRouteAnswer = (i: number, text: string) => {
            const next = [...routeAnswers]
            while (next.length < (activeRoute?.questions.length ?? 0)) next.push('')
            next[i] = text
            onChange({ selectedRoute, allRouteAnswers: { ...allRouteAnswers, [selectedRoute!]: next }, hasChangedRoute })
        }

        return (
            <div className="space-y-4">
                {question && (
                    <p className="text-base leading-relaxed" style={{ color: C.text }}>{parseBold(question)}</p>
                )}

                {content.allowSkip && (
                    <SkipCheckbox
                        checked={skipped}
                        label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                        onChange={next => onChange({ selectedRoute: next ? null : selectedRoute, allRouteAnswers, hasChangedRoute, skipped: next })}
                        disabled={disabled}
                    />
                )}

                {/* Route selector */}
                {!skipped && (
                <>
                <div className="space-y-2">
                    {routes.map(route => {
                        const isSelected = selectedRoute === route.id
                        if (selectedRoute && !isSelected) return null
                        return (
                            <div key={route.id}>
                                <button
                                    onClick={() => selectRoute(route.id)}
                                    disabled={disabled}
                                    className="w-full text-left rounded-xl px-4 py-3 flex gap-3 items-center transition-all"
                                    style={{
                                        background: isSelected ? `${C.green}15` : C.surface2,
                                        border: `1px solid ${isSelected ? C.green : C.amber}`,
                                        cursor: disabled ? 'default' : 'pointer',
                                    }}
                                >
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{
                                            background: isSelected ? C.green : 'transparent',
                                            border: `1.5px solid ${isSelected ? C.green : C.amber}`,
                                            color: isSelected ? '#fff' : C.amber,
                                        }}
                                    >
                                        {route.id}
                                    </span>
                                    <p className="text-sm font-semibold" style={{ color: isSelected ? C.text : C.amber }}>
                                        {parseBold(route.label)}
                                    </p>
                                </button>
                                {isSelected && route.description && (
                                    <div className="mt-1.5 px-1">
                                        {parseText(route.description, 'text-xs leading-relaxed', { color: C.textMuted })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Questions for selected route */}
                {activeRoute && activeRoute.questions.length > 0 && (
                    <div className="space-y-3 pt-1">
                        <div className="h-px" style={{ background: C.border }} />
                        {activeRoute.questions.map((q, i) => {
                            const isGuidedQuestion = typeof q === 'object' && q !== null && (q as any).isGuided
                            if (isGuidedQuestion) {
                                const prefix = (q as { prefix: string }).prefix
                                return (
                                    <div
                                        key={i}
                                        className="rounded-xl overflow-hidden"
                                        style={{ border: `1px solid ${(routeAnswers[i] ?? '').trim() ? C.green : C.border}` }}
                                    >
                                        <div className="px-4 pt-3 pb-1" style={{ background: C.surface1 }}>
                                            <p
                                                className="text-sm leading-relaxed italic"
                                                style={{ color: C.textMuted, fontFamily: "'American Typewriter', Georgia, serif" }}
                                            >
                                                {prefix}
                                            </p>
                                        </div>
                                        <div className="px-4 pb-3" style={{ background: C.surface1 }}>
                                            <input
                                                type="text"
                                                placeholder="completa aquí..."
                                                value={routeAnswers[i] ?? ''}
                                                onChange={e => setRouteAnswer(i, e.target.value)}
                                                disabled={disabled}
                                                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                                                style={{
                                                    background: C.surface2,
                                                    border: `1px solid ${(routeAnswers[i] ?? '').trim() ? `${C.green}60` : C.border}`,
                                                    color: C.text,
                                                    opacity: disabled ? 0.6 : 1,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                            return (
                                <div key={i} className="space-y-1.5">
                                    <p className="text-sm font-medium" style={{ color: C.text }}>{parseBold(q as string)}</p>
                                    <textarea
                                        rows={3}
                                        maxLength={400}
                                        placeholder="Escribe tu respuesta..."
                                        value={routeAnswers[i] ?? ''}
                                        onChange={e => setRouteAnswer(i, e.target.value)}
                                        onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }}
                                        disabled={disabled}
                                        className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                                        style={{
                                            background: C.surface2,
                                            border: `1px solid ${C.border}`,
                                            color: C.text,
                                            opacity: disabled ? 0.6 : 1,
                                        }}
                                    />
                                    <p className="text-xs text-right mt-1" style={{ color: (routeAnswers[i] ?? '').length > 360 ? C.red : C.textMuted }}>
                                        {(routeAnswers[i] ?? '').length}/400
                                    </p>
                                </div>
                            )
                        })}
                        {!disabled && !hasChangedRoute && (
                            <button
                                onClick={() => setShowRouteChangeWarning(true)}
                                className="text-xs underline"
                                style={{ color: C.textMuted }}
                            >
                                Cambiar ruta
                            </button>
                        )}

                        {/* Route change warning popup */}
                        {showRouteChangeWarning && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center px-6"
                                style={{ background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(4px)' }}
                            >
                                <div
                                    className="w-full max-w-sm rounded-2xl p-6 space-y-5"
                                    style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                                >
                                    <div className="space-y-2">
                                        <h3
                                            className="text-base font-bold leading-snug text-center"
                                            style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                                        >
                                            ¿Cambiar de ruta?
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                                            Solo tienes <span style={{ color: C.amber }}>un intento</span> para cambiar de ruta. Una vez que lo hagas, esta opción no estará disponible nuevamente.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                onChange({ selectedRoute: null, allRouteAnswers, hasChangedRoute: true })
                                                setShowRouteChangeWarning(false)
                                            }}
                                            className="w-full py-3 rounded-xl font-semibold text-sm"
                                            style={{ background: C.red, color: '#fff' }}
                                        >
                                            Sí, cambiar ruta
                                        </button>
                                        <button
                                            onClick={() => setShowRouteChangeWarning(false)}
                                            className="w-full py-3 rounded-xl text-sm"
                                            style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </>
                )}
            </div>
        )
    }

    // ── Reescritura guiada — renders completely different UI (no tabs) ──
    if (isReescritura) {
        return (
            <div className="space-y-4">
                {question && (
                    <p className="text-base leading-relaxed" style={{ color: C.text }}>
                        {parseBold(question)}
                    </p>
                )}
                {content.allowSkip && (
                    <SkipCheckbox
                        checked={!!v.skipped}
                        label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                        onChange={skipped => onChange({ ...v, skipped })}
                        disabled={disabled}
                    />
                )}
                {!v.skipped && (
                <div className="space-y-3">
                    {fields.map((prefix, i) => (
                        <div
                            key={i}
                            className="rounded-xl overflow-hidden"
                            style={{ border: `1px solid ${C.border}` }}
                        >
                            <div className="px-4 pt-3 pb-1" style={{ background: C.surface1 }}>
                                <p
                                    className="text-sm leading-relaxed italic"
                                    style={{ color: C.textMuted, fontFamily: "'American Typewriter', Georgia, serif" }}
                                >
                                    {parseBold(prefix)}
                                </p>
                            </div>
                            <div className="px-4 pb-3" style={{ background: C.surface1 }}>
                                <input
                                    type="text"
                                    placeholder="completa aquí..."
                                    value={completions[i] ?? ''}
                                    onChange={e => setCompletion(i, e.target.value)}
                                    disabled={disabled}
                                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                                    style={{
                                        background: C.surface2,
                                        border: `1px solid ${completions[i]?.trim() ? C.green + '60' : C.border}`,
                                        color: C.text,
                                        opacity: disabled ? 0.6 : 1,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {question && (
                <p className="text-base leading-relaxed" style={{ color: C.text }}>
                    {parseBold(question)}
                </p>
            )}

            {/* Mode tabs */}
            <div className="flex gap-2">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => tab.enabled && setMode(tab.id)}
                        disabled={!tab.enabled || disabled || v.skipped}
                        className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all"
                        style={{
                            border: `1px solid ${mode === tab.id && tab.enabled ? C.green : C.amber}`,
                            color: mode === tab.id && tab.enabled ? C.green : C.amber,
                            background: C.surface2,
                            cursor: tab.enabled && !disabled && !v.skipped ? 'pointer' : 'default',
                            opacity: !tab.enabled || v.skipped ? 0.35 : 1,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {content.allowSkip && (
                <SkipCheckbox
                    checked={!!v.skipped}
                    label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                    onChange={skipped => onChange({ ...v, skipped })}
                    disabled={disabled}
                />
            )}

            {/* Escribir */}
            {!v.skipped && mode === 'text' && (
                <>
                <textarea
                    rows={6}
                    maxLength={800}
                    placeholder="Escribe tu respuesta aquí..."
                    value={v.text ?? ''}
                    onChange={e => onChange({ ...v, text: e.target.value })}
                    onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }}
                    disabled={disabled}
                    className="w-full rounded-xl p-4 text-sm resize-none outline-none transition placeholder:opacity-30"
                    style={{
                        background: C.surface2,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
                <p className="text-xs text-right mt-1" style={{ color: (v.text ?? '').length > 720 ? C.red : C.textMuted }}>
                    {(v.text ?? '').length}/800
                </p>
                </>
            )}

            {/* Elegir */}
            {!v.skipped && mode === 'select' && (
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
                                        background: sel ? `${C.green}20` : C.surface2,
                                        border: `1px solid ${sel ? C.green : C.border}`,
                                        color: sel ? C.text : C.textMuted,
                                        opacity: disabled && !sel ? 0.5 : 1,
                                    }}
                                >
                                    <span
                                        className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3 shrink-0"
                                        style={{
                                            borderColor: sel ? C.green : C.border,
                                            background: sel ? C.green : 'transparent',
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
                                            border: `1px solid ${C.green}`,
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

            {!v.skipped && mode === 'audio' && (
                <AudioRecorderField
                    blockId={blockId}
                    value={v.audioUrl ?? null}
                    onChange={url => onChange({ ...v, mode: 'audio', audioUrl: url ?? undefined })}
                    disabled={disabled}
                />
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
    const skipped: boolean = typeof value === 'object' && value !== null && !Array.isArray(value) ? !!value.skipped : false

    const toggle = (opt: string) => {
        if (disabled || skipped) return
        if (multiple) {
            const current: string[] = Array.isArray(value) ? value : []
            onChange(
                current.includes(opt) ? current.filter(x => x !== opt) : [...current, opt]
            )
        } else {
            onChange(opt)
        }
    }

    const isSelected = (opt: string) => {
        if (skipped) return false
        if (multiple) return (Array.isArray(value) ? value : []).includes(opt)
        return value === opt
    }

    return (
        <div className="space-y-4">
            {prompt && <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{parseBold(prompt)}</p>}
            {content.allowSkip && (
                <SkipCheckbox
                    checked={skipped}
                    label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                    onChange={next => onChange(next ? { skipped: true } : (multiple ? [] : ''))}
                    disabled={disabled}
                />
            )}
            <div className="space-y-2" style={{ opacity: skipped ? 0.35 : 1 }}>
                {options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => toggle(opt)}
                        disabled={disabled || skipped}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                        style={{
                            background: isSelected(opt) ? `${C.green}20` : C.surface2,
                            border: `1px solid ${isSelected(opt) ? C.green : C.border}`,
                            color: isSelected(opt) ? C.text : C.textMuted,
                            opacity: disabled && !isSelected(opt) ? 0.5 : 1,
                        }}
                    >
                        <span
                            className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3"
                            style={{
                                borderColor: isSelected(opt) ? C.green : C.border,
                                background: isSelected(opt) ? C.green : 'transparent',
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
    content, value, onChange, disabled, blockId,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean; blockId: string }) {
    const phrase = content.phrase ?? ''
    const isSeleccion = content.actionType === 'seleccion'

    const freeText: string = typeof value === 'object' && value !== null && 'text' in value
        ? (value.text ?? '')
        : (typeof value === 'string' ? value : '')
    const photoUrl: string | undefined = typeof value === 'object' && value !== null ? value.photoUrl : undefined
    const audioUrl: string | undefined = typeof value === 'object' && value !== null ? value.audioUrl : undefined
    const skipped: boolean = typeof value === 'object' && value !== null ? !!value.skipped : false
    const initialTab: 'text' | 'photo' | 'audio' =
        typeof value === 'object' && value !== null && 'activeTab' in value
            ? value.activeTab
            : 'text'
    const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'audio'>(initialTab)

    // ── Selección guiada mode ──
    if (isSeleccion) {
        const opts: string[] = content.options ?? []
        const guidedPrefix: string = content.guidedPrefix ?? 'Mi compromiso personal es:'
        const prompt: string = content.prompt ?? ''

        const v = (typeof value === 'object' && value !== null) ? value : { selected: null, guidedText: '' }
        const selected: string | null = v.selected ?? null
        const guidedText: string = v.guidedText ?? ''
        const isGuided = selected === 'guided'

        const pickOption = (opt: string) => {
            if (disabled || skipped) return
            onChange({ selected: selected === opt ? null : opt, guidedText: '' })
        }
        const pickGuided = () => {
            if (disabled || skipped) return
            onChange({ selected: isGuided ? null : 'guided', guidedText: '' })
        }

        return (
            <div className="space-y-3">
                {prompt && (
                    <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{parseBold(prompt)}</p>
                )}
                {content.allowSkip && (
                    <SkipCheckbox
                        checked={skipped}
                        label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                        onChange={next => onChange({ selected: next ? null : selected, guidedText: next ? '' : guidedText, skipped: next })}
                        disabled={disabled}
                    />
                )}
                <div className="space-y-2" style={{ opacity: skipped ? 0.35 : 1 }}>
                    {opts.map((opt, i) => {
                        const sel = selected === opt
                        return (
                            <button
                                key={i}
                                onClick={() => pickOption(opt)}
                                disabled={disabled || skipped}
                                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                style={{
                                    background: sel ? `${C.green}20` : C.surface2,
                                    border: `1px solid ${sel ? C.green : C.border}`,
                                    color: sel ? C.text : C.textMuted,
                                    opacity: disabled && !sel ? 0.5 : 1,
                                }}
                            >
                                <span
                                    className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3 shrink-0"
                                    style={{
                                        borderColor: sel ? C.green : C.border,
                                        background: sel ? C.green : 'transparent',
                                        color: '#fff',
                                    }}
                                >
                                    {sel ? '✓' : ''}
                                </span>
                                {opt}
                            </button>
                        )
                    })}

                    {/* Guided option — always last */}
                    <div className="space-y-2">
                        <button
                            onClick={pickGuided}
                            disabled={disabled || skipped}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
                            style={{
                                background: isGuided ? `${C.green}20` : C.surface2,
                                border: `1px solid ${isGuided ? C.green : C.border}`,
                                color: isGuided ? C.text : C.textMuted,
                                opacity: disabled && !isGuided ? 0.5 : 1,
                            }}
                        >
                            <span
                                className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-3 shrink-0"
                                style={{
                                    borderColor: isGuided ? C.green : C.border,
                                    background: isGuided ? C.green : 'transparent',
                                    color: '#fff',
                                }}
                            >
                                {isGuided ? '✓' : ''}
                            </span>
                            <span style={{ color: isGuided ? C.amber : undefined }}>
                                Escribo la mía
                            </span>
                        </button>

                        {isGuided && (
                            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.amber}40` }}>
                                <div className="px-4 pt-3 pb-1" style={{ background: C.surface1 }}>
                                    <p
                                        className="text-sm italic leading-relaxed"
                                        style={{ color: C.textMuted, fontFamily: "'American Typewriter', Georgia, serif" }}
                                    >
                                        {parseBold(guidedPrefix)}
                                    </p>
                                </div>
                                <div className="px-4 pb-3" style={{ background: C.surface1 }}>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="completa aquí..."
                                        value={guidedText}
                                        onChange={e => onChange({ selected: 'guided', guidedText: e.target.value })}
                                        disabled={disabled || skipped}
                                        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                                        style={{
                                            background: C.surface2,
                                            border: `1px solid ${guidedText.trim() ? `${C.amber}60` : C.border}`,
                                            color: C.text,
                                            opacity: disabled ? 0.6 : 1,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ── Solo foto mode ──
    if (content.actionType === 'foto') {
        const instruction: string = content.phrase ?? ''
        const capturedUrl: string | null = typeof value === 'string' ? value : null
        return (
            <div className="space-y-5">
                {instruction && (
                    <div
                        className="rounded-xl px-5 py-4"
                        style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                    >
                        <p
                            className="text-base leading-relaxed italic"
                            style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                        >
                            {parseBold(instruction)}
                        </p>
                    </div>
                )}
                {content.allowSkip && (
                    <SkipCheckbox
                        checked={skipped}
                        label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                        onChange={next => onChange(next ? { skipped: true } : null)}
                        disabled={disabled}
                    />
                )}
                {!skipped && (
                    <PhotoUploadField
                        blockId={blockId}
                        value={capturedUrl}
                        onChange={url => onChange(url)}
                        disabled={disabled}
                    />
                )}
            </div>
        )
    }

    // ── Frase a completar mode (original) ──
    const TABS = [
        { id: 'text'  as const, label: 'Escribe',      clickable: true },
        { id: 'photo' as const, label: 'Foto o Imagen', clickable: true },
        { id: 'audio' as const, label: 'Nota de voz',  clickable: true },
    ]

    return (
        <div className="space-y-5">
            {/* Frase estática — siempre visible arriba */}
            {phrase && (
                <div className="rounded-xl px-4 py-4" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                    <p className="text-[10px] tracking-[0.16em] uppercase mb-3" style={{ color: C.textMuted }}>
                        Tu frase
                    </p>
                    <p
                        className="text-base leading-relaxed italic"
                        style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                    >
                        {parseBold(`"${phrase}"`)}
                    </p>
                </div>
            )}

            {/* Tabs */}
            <div className="space-y-3">
                <p className="text-sm" style={{ color: C.textMuted }}>Elige cómo enviar tu evidencia</p>
                <div className="flex gap-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                if (tab.clickable && !skipped) {
                                    setActiveTab(tab.id)
                                    onChange({ text: freeText, activeTab: tab.id, photoUrl, audioUrl, skipped })
                                }
                            }}
                            disabled={!tab.clickable || skipped}
                            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-colors"
                            style={{
                                border: `1px solid ${activeTab === tab.id ? C.green : tab.clickable ? C.amber : C.border}`,
                                color: activeTab === tab.id ? C.green : tab.clickable ? C.amber : C.border,
                                background: C.surface2,
                                cursor: tab.clickable && !skipped ? 'pointer' : 'default',
                                opacity: skipped ? 0.35 : 1,
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {content.allowSkip && (
                <SkipCheckbox
                    checked={skipped}
                    label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                    onChange={next => onChange({ text: freeText, activeTab, photoUrl, audioUrl, skipped: next })}
                    disabled={disabled}
                />
            )}

            {/* Área de respuesta con frase repetida como guía */}
            {!skipped && activeTab === 'text' && (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    {phrase && (
                        <div className="px-4 pt-3 pb-2" style={{ background: C.surface1 }}>
                            <p className="text-[10px] tracking-[0.14em] uppercase mb-2" style={{ color: C.textMuted }}>
                                Completa la frase
                            </p>
                            <p
                                className="text-sm leading-relaxed italic"
                                style={{ color: `${C.textMuted}99`, fontFamily: "'American Typewriter', Georgia, serif" }}
                            >
                                {parseBold(`"${phrase}"`)}
                            </p>
                        </div>
                    )}
                    <div className="px-4 pb-4 pt-2" style={{ background: C.surface1 }}>
                        <textarea
                            rows={4}
                            maxLength={500}
                            placeholder="completa aquí..."
                            value={freeText}
                            onChange={e => onChange({ text: e.target.value, activeTab })}
                            onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }}
                            disabled={disabled}
                            className="w-full rounded-lg p-3 text-sm resize-none outline-none"
                            style={{
                                background: C.surface2,
                                border: `1px solid ${C.border}`,
                                color: C.text,
                                opacity: disabled ? 0.6 : 1,
                            }}
                        />
                        <p className="text-xs text-right mt-1" style={{ color: freeText.length > 450 ? C.red : C.textMuted }}>
                            {freeText.length}/500
                        </p>
                    </div>
                </div>
            )}

            {!skipped && activeTab === 'photo' && (
                <PhotoUploadField
                    blockId={blockId}
                    value={photoUrl ?? null}
                    onChange={url => onChange({ text: freeText, activeTab, photoUrl: url ?? undefined, audioUrl })}
                    disabled={disabled}
                />
            )}

            {!skipped && activeTab === 'audio' && (
                <AudioRecorderField
                    blockId={blockId}
                    value={audioUrl ?? null}
                    onChange={url => onChange({ text: freeText, activeTab, audioUrl: url ?? undefined, photoUrl })}
                    disabled={disabled}
                />
            )}
        </div>
    )
}

function Evidencia({
    content, value, onChange, disabled,
}: { content: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
    const prompt = content.description ?? content.prompt ?? content.instruction ?? ''
    const skipped: boolean = typeof value === 'object' && value !== null ? !!value.skipped : false
    const text: string = typeof value === 'string' ? value : ''

    return (
        <div className="space-y-4">
            {prompt && <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{parseBold(prompt)}</p>}
            {content.allowSkip && (
                <SkipCheckbox
                    checked={skipped}
                    label={content.skipLabel || 'Prefiero no responder esta pregunta'}
                    onChange={next => onChange(next ? { skipped: true } : '')}
                    disabled={disabled}
                />
            )}
            {!skipped && (
                <>
                <textarea
                    rows={5}
                    maxLength={600}
                    placeholder="Describe tu evidencia, aprendizajes o reflexiones..."
                    value={text}
                    onChange={e => onChange(e.target.value)}
                    onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }}
                    disabled={disabled}
                    className="w-full rounded-xl p-4 text-sm resize-none outline-none"
                    style={{
                        background: C.surface2,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
                <p className="text-xs text-right mt-1" style={{ color: text.length > 540 ? C.red : C.textMuted }}>
                    {text.length}/600
                </p>
                </>
            )}
        </div>
    )
}

function Refuerzo({ content, recalls }: { content: any; recalls: (string | null)[] }) {
    const msg1 = content.message1 ?? content.message ?? ''
    const msg2 = content.message2 ?? ''
    const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null

    return (
        <div className="space-y-8">
            {/* Image */}
            <img
                src={content.imageUrl ?? '/a-c-lj0BHb9llUY-unsplash.jpg'}
                alt=""
                className="w-full rounded-2xl object-cover"
                style={{ height: '220px' }}
            />

            {/* Refuerzo messages */}
            {(msg1 || msg2) && (
                <div className="space-y-5">
                    {msg1 && (
                        <div className="flex gap-3">
                            <div className="flex-none w-0.5 rounded-full" style={{ background: C.green }} />
                            <div className="space-y-3">{parseTextWithRecalls(msg1, recalls, 'text-base leading-relaxed', { fontFamily: 'Montserrat, sans-serif', color: C.text })}</div>
                        </div>
                    )}
                    {msg2 && (
                        <div className="flex gap-3">
                            <div className="flex-none w-0.5 rounded-full" style={{ background: `${C.green}50` }} />
                            <div className="space-y-3">{parseText(msg2, 'text-sm leading-relaxed', { color: C.textMuted })}</div>
                        </div>
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
                    style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                >
                    {content.message}
                </p>
            )}
            {content.xp && (
                <div
                    className="inline-block px-6 py-2 rounded-full font-bold text-xl"
                    style={{ background: C.amber + '20', color: C.amber, fontFamily: "'DM Mono', monospace" }}
                >
                    +{content.xp} XP
                </div>
            )}
        </div>
    )
}

function Cierre({
    content,
    recalls,
    submitting,
    hasNextStation,
    onGoToNextStation,
    onGoToWorld,
}: {
    content: any
    recalls: (string | null)[]
    submitting: boolean
    hasNextStation: boolean
    onGoToNextStation: () => void
    onGoToWorld: () => void
}) {
    const embedUrl = content.videoUrl ? getYouTubeEmbedUrl(content.videoUrl) : null

    return (
        <div className="space-y-5">
            {content.text && (
                <div className="space-y-3">{parseTextWithRecalls(content.text, recalls)}</div>
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
    data: { world: any; nextWorld: any; xpEarned: number; badges: string[]; currentBadge: string | null; streak: number; completionImageUrl: string | null; completionVideoUrl: string | null }
    onContinue: () => void
}) {
    const { world, nextWorld, xpEarned, badges, streak, completionImageUrl, completionVideoUrl } = data
    const _baseEmbed = completionVideoUrl ? getYouTubeEmbedUrl(completionVideoUrl) : null
    const videoEmbedUrl = _baseEmbed ? `${_baseEmbed}?autoplay=1&mute=1&rel=0` : null
    const worldNum = world.orderIndex ?? 1

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            {/* Green header */}
            <div
                className="flex flex-col items-center justify-center gap-3 px-6 pt-12 pb-10"
                style={{ background: '#52B788' }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#231F20' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h1
                    className="text-2xl font-bold text-center leading-tight"
                    style={{ fontFamily: "'American Typewriter', Georgia, serif", color: '#fff' }}
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
                    <span className="text-xs tracking-[0.14em] uppercase" style={{ color: C.amber }}>
                        XP Total
                    </span>
                    <span className="text-3xl font-bold" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                        +{xpEarned}
                    </span>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] tracking-[0.18em] uppercase text-center" style={{ color: C.textMuted }}>
                            Insignias ganadas
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {badges.map((b, i) => {
                                const badgeColor = badgeColorFor(b)
                                return (
                                    <span
                                        key={i}
                                        className="text-xs px-3 py-2 rounded-full font-semibold flex items-center gap-1.5"
                                        style={{
                                            border: `1px solid ${badgeColor}`,
                                            color: badgeColor,
                                            background: `${badgeColor}20`,
                                        }}
                                    >
                                        <Award size={14} />
                                        {b}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                )}

                {videoEmbedUrl ? (
                    <div className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        <iframe
                            src={videoEmbedUrl}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <img
                        src={completionImageUrl ?? '/Final Mundo El Despertar.jpg'}
                        alt="Portada"
                        className="w-full rounded-xl object-cover"
                    />
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
    onReview,
}: {
    station: Station
    result: BlockInteractResult
    nextStation: { id: string; title: string } | null
    onGoToNext?: () => void
    onContinue: () => void
    onReview: () => void
}) {
    return (
        <div
            className="min-h-screen flex flex-col items-center px-6 py-10 text-center"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            <div className="space-y-6 max-w-sm mx-auto w-full pb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto" style={{ background: `${C.amber}20`, border: `1.5px solid ${C.amber}` }}>
                    <Sparkles size={32} style={{ color: C.amber }} />
                </div>

                <h1
                    className="text-3xl font-bold leading-tight"
                    style={{ fontFamily: "'American Typewriter', Georgia, serif" }}
                >
                    ¡Estación completada!
                </h1>

                <p className="text-sm" style={{ color: C.textMuted }}>
                    {station.title}
                </p>

                <img
                    src={station.completionImageUrl ?? '/Fin Estación El Observador.png'}
                    alt=""
                    className="w-full rounded-2xl object-cover object-[center_70%]"
                    style={{ height: '280px' }}
                />

                {/* XP earned */}
                <div
                    className="rounded-2xl p-6 space-y-4"
                    style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                >
                    <div className="flex items-center justify-center gap-4">
                        {/* XP circle */}
                        <div
                            className="flex-none w-16 h-16 rounded-full flex flex-col items-center justify-center"
                            style={{
                                background: `radial-gradient(circle at 40% 35%, ${C.amber}22, ${C.surface1})`,
                                border: `1.5px solid ${C.amber}55`,
                                boxShadow: `0 0 18px ${C.amber}30, inset 0 0 12px ${C.amber}10`,
                            }}
                        >
                            <span className="text-lg font-bold leading-none" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                                +{result.xpEarned ?? 0}
                            </span>
                            <span className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: `${C.amber}90` }}>
                                XP
                            </span>
                        </div>
                        {result.badgeEarned && (
                            <div className="space-y-0.5 text-left">
                                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: C.green }}>
                                    ¡Obtuviste tu insignia!
                                </p>
                                <h2
                                    className="text-2xl font-bold leading-tight"
                                    style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                                >
                                    {result.badgeEarned}
                                </h2>
                            </div>
                        )}
                    </div>

                    {(result.streakBonus ?? 0) > 0 && (
                        <div
                            className="rounded-lg px-4 py-2 text-sm"
                            style={{ background: C.amber + '15', color: C.amber }}
                        >
                            <Flame size={14} className="inline mr-1" /> Bonus racha: +{result.streakBonus} XP
                        </div>
                    )}

                    {result.newStreak && result.newStreak > 0 && (
                        <p className="text-sm" style={{ color: C.textMuted }}>
                            Racha actual: <span style={{ color: C.amber }}>{result.newStreak} días</span>
                        </p>
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
                        onClick={onReview}
                        className="w-full py-3.5 rounded-xl text-sm font-medium"
                        style={{ background: C.surface1, color: C.green, border: `1px solid ${C.green}` }}
                    >
                        Ver mis respuestas
                    </button>
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
