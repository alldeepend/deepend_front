import { useEffect, useState } from 'react'
import { Lock, Info } from 'lucide-react'
import { journeyApi } from '../../../services/journey'
import type { GateDayStatus, GateEvidenceType, GateInfo, GateStatus } from '../../../types/journey'
import { C } from '../../../styles/colors'
import { PhotoUploadField, AudioRecorderField, SkipCheckbox } from './EvidenceFields'

type Step = 'portada' | 'mapa' | 'dia' | 'recompensa' | 'celebracion'

export default function GateModal({
    journeyId, initialStatus, onDismiss, onFinish,
}: { journeyId: string; initialStatus: GateStatus; onDismiss: () => void; onFinish: () => void }) {
    const [status, setStatus] = useState(initialStatus)
    const [step, setStep] = useState<Step>(initialStatus.activated ? 'mapa' : 'portada')
    const [activating, setActivating] = useState(false)
    const [selectedDay, setSelectedDay] = useState<GateDayStatus | null>(null)
    const [lastReward, setLastReward] = useState<{ xpEarned: number; gateCompleted: boolean } | null>(null)

    const days = status.days ?? []

    const refreshStatus = async () => {
        const updated = await journeyApi.getGateStatus(journeyId)
        setStatus(updated)
        return updated
    }

    const handleActivate = async () => {
        setActivating(true)
        try {
            await journeyApi.activateGate(journeyId)
            await refreshStatus()
            setStep('mapa')
        } catch {
            alert('No se pudo activar la Puerta. Intenta de nuevo.')
        } finally {
            setActivating(false)
        }
    }

    const openDay = (day: GateDayStatus) => {
        if (day.state !== 'today' && day.state !== 'pending') return
        setSelectedDay(day)
        setStep('dia')
    }

    const handleDaySubmitted = async (result: { xpEarned: number; gateCompleted: boolean }) => {
        await refreshStatus()
        setLastReward(result)
        setStep(result.gateCompleted ? 'celebracion' : 'recompensa')
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            style={{ background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
                style={{ background: C.surface1, border: `1px solid ${C.border}`, maxHeight: '90vh' }}
            >
                <div className="relative shrink-0">
                    <img
                        src="/camino-modified.jpg"
                        alt=""
                        className="w-full h-28 object-cover"
                        style={{ objectPosition: 'center 45%' }}
                    />
                    <div
                        className="absolute inset-x-0 bottom-0 h-12"
                        style={{ background: `linear-gradient(to bottom, transparent, ${C.surface1})` }}
                    />
                    <button
                        type="button"
                        onClick={onDismiss}
                        aria-label="Cerrar"
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: 'rgba(22,18,17,0.55)', color: '#fff', backdropFilter: 'blur(2px)' }}
                    >
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto p-6 pt-3">
                    {step === 'portada' && status.gate && (
                        <PortadaStep gate={status.gate} onActivate={handleActivate} activating={activating} />
                    )}
                    {step === 'mapa' && (
                        <MapaStep
                            days={days}
                            currentDay={status.currentDay}
                            totalXpEarned={status.totalXpEarned}
                            onOpenDay={openDay}
                        />
                    )}
                    {step === 'dia' && selectedDay && (
                        <DiaStep
                            journeyId={journeyId}
                            day={selectedDay}
                            onBack={() => setStep('mapa')}
                            onSubmitted={handleDaySubmitted}
                        />
                    )}
                    {step === 'recompensa' && lastReward && (
                        <RecompensaStep xpEarned={lastReward.xpEarned} onContinue={() => setStep('mapa')} />
                    )}
                    {step === 'celebracion' && (
                        <CelebracionStep
                            totalXpEarned={status.totalXpEarned ?? 0}
                            days={days}
                            onFinish={onFinish}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Portada ────────────────────────────────────────────────────────────────

function PortadaStep({ gate, onActivate, activating }: { gate: GateInfo; onActivate: () => void; activating: boolean }) {
    const totalXp = gate.xpPerDay * 7 + gate.xpBonusClose
    return (
        <div className="space-y-6 text-center">
            <p className="text-xs font-semibold tracking-widest" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                7 DÍAS · A TU RITMO
            </p>
            <h2 className="text-2xl font-bold" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                {gate.title}
            </h2>
            <p className="text-sm" style={{ color: C.textSec }}>
                {gate.subtitle || 'Una pregunta al día durante 7 días. Sin respuestas buenas ni malas.'}
            </p>
            <p className="text-xs" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                +{totalXp} XP · 1 pregunta/día
            </p>
            <button
                type="button"
                onClick={onActivate}
                disabled={activating}
                className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: C.red, color: '#fff' }}
            >
                {activating ? 'Activando...' : 'Empezar mis 7 días'}
            </button>
        </div>
    )
}

// ─── Mapa de días ─────────────────────────────────────────────────────────────

function MapaStep({ days, currentDay, totalXpEarned, onOpenDay }: {
    days: GateDayStatus[]; currentDay?: number; totalXpEarned?: number; onOpenDay: (day: GateDayStatus) => void
}) {
    const [infoOpen, setInfoOpen] = useState(false)
    return (
        <div className="space-y-5">
            <div className="text-center space-y-1">
                <p className="text-xs font-semibold tracking-widest" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                    DÍA {currentDay ?? 1} DE 7
                </p>
                <div className="flex items-center justify-center gap-1.5 relative">
                    <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                        Tu recorrido
                    </h2>
                    <button
                        type="button"
                        onClick={() => setInfoOpen(v => !v)}
                        aria-label="Información sobre los días"
                        style={{ color: C.textMuted, lineHeight: 0 }}
                    >
                        <Info size={15} />
                    </button>
                    {infoOpen && (
                        <div
                            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-lg p-3 text-xs text-left leading-relaxed shadow-lg z-10"
                            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.textSec }}
                        >
                            No tienes que responder todos los días seguidos. Puedes tomarte tu tiempo entre uno y otro: cuando vuelvas, sigues justo donde te quedaste, con la siguiente pregunta esperándote.
                        </div>
                    )}
                </div>
            </div>
            <div className="max-w-[220px] mx-auto">
                {days.map((day, idx) => {
                    const clickable = day.state === 'today' || day.state === 'pending'
                    const completed = day.state === 'completed'
                    const label =
                        day.state === 'tomorrow' ? 'Mañana' :
                        day.state === 'future' ? `Día ${day.dayNumber}` :
                        (day.anchorLabel || `Día ${day.dayNumber}`)
                    const isLast = idx === days.length - 1
                    const nodeColor = completed ? C.green : day.state === 'today' ? C.amber : C.border
                    const lineColor = completed ? C.green : C.border

                    return (
                        <button
                            key={day.dayNumber}
                            type="button"
                            onClick={() => onOpenDay(day)}
                            disabled={!clickable}
                            className="w-full flex items-stretch gap-3 text-left"
                            style={{ cursor: clickable ? 'pointer' : 'default' }}
                        >
                            {/* Track: línea punteada + nodo, igual estilo que el mapa de mundos */}
                            <div className="flex flex-col items-center" style={{ width: 28, flexShrink: 0 }}>
                                {idx > 0 && (
                                    <div style={{ width: 2, height: 8, borderLeft: `2px dashed ${lineColor}` }} />
                                )}
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-semibold"
                                    style={{
                                        background: completed ? `${C.green}25` : day.state === 'today' ? `${C.amber}20` : C.surface2,
                                        border: `1.5px solid ${nodeColor}`,
                                        color: completed ? C.green : day.state === 'today' ? C.amber : C.textMuted,
                                    }}
                                >
                                    {completed ? '✓' : day.state === 'future' ? <Lock size={11} /> : day.dayNumber}
                                </span>
                                {!isLast && (
                                    <div className="flex-1" style={{ width: 2, minHeight: 18, borderLeft: `2px dashed ${lineColor}` }} />
                                )}
                            </div>

                            {/* Etiqueta del día */}
                            <div className="flex-1 py-2">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: completed ? C.green : day.state === 'today' ? C.text : C.textMuted,
                                        fontWeight: completed || day.state === 'today' ? 600 : 400,
                                    }}
                                >
                                    {label}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
            <p className="text-center text-xs" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                {totalXpEarned ?? 0} XP acumulado
            </p>
        </div>
    )
}

// ─── Pantalla del día ─────────────────────────────────────────────────────────

function DiaStep({ journeyId, day, onBack, onSubmitted }: {
    journeyId: string; day: GateDayStatus; onBack: () => void
    onSubmitted: (result: { xpEarned: number; gateCompleted: boolean }) => void
}) {
    const [tab, setTab] = useState<GateEvidenceType>(day.checkOnly ? 'check' : 'texto')
    const [text, setText] = useState('')
    const [mediaUrl, setMediaUrl] = useState<string | null>(null)
    const [checked, setChecked] = useState(false)
    const [checkText, setCheckText] = useState('')
    const [secondResponse, setSecondResponse] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const evidenceType: GateEvidenceType = day.checkOnly ? 'check' : tab
    const canSubmit =
        evidenceType === 'texto' ? text.trim().length > 0 :
        evidenceType === 'check' ? checked :
        !!mediaUrl

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const result = await journeyApi.submitGateDay(journeyId, day.dayNumber, {
                evidenceType,
                responseText:
                    evidenceType === 'texto' ? text.trim() :
                    evidenceType === 'check' ? (checkText.trim() || null) :
                    null,
                mediaUrl: (evidenceType === 'foto' || evidenceType === 'audio') ? mediaUrl : null,
                secondResponse: day.hasSecondQuestion ? secondResponse.trim() : null,
            })
            onSubmitted(result)
        } catch {
            alert('No se pudo guardar tu respuesta. Intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    const TABS: { key: GateEvidenceType; label: string }[] = [
        { key: 'texto', label: 'Texto' }, { key: 'audio', label: 'Audio' },
        { key: 'foto', label: 'Foto' }, { key: 'check', label: 'Solo check' },
    ]

    return (
        <div className="space-y-5">
            <button type="button" onClick={onBack} className="text-xs" style={{ color: C.textMuted }}>
                ← Volver al mapa
            </button>
            <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                    DÍA {day.dayNumber} DE 7
                </p>
                {day.anchorLabel && (
                    <p className="text-xs font-semibold tracking-widest" style={{ color: C.label, fontFamily: "'DM Mono', monospace" }}>
                        {day.anchorLabel}
                    </p>
                )}
            </div>
            <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                {day.question}
            </h2>
            {day.bodyText && <p className="text-sm" style={{ color: C.textSec }}>{day.bodyText}</p>}

            {day.checkOnly ? (
                <CheckWithText checked={checked} onCheckedChange={setChecked} text={checkText} onTextChange={setCheckText} disabled={submitting} />
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setTab(t.key)}
                                className="py-2 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                    background: tab === t.key ? C.green : C.surface2,
                                    color: tab === t.key ? C.bgDeep : C.textMuted,
                                    border: `1px solid ${tab === t.key ? C.green : C.border}`,
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    {tab === 'texto' && (
                        <div>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Escribe tu respuesta..."
                                disabled={submitting}
                                className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                            />
                            <p className="text-xs text-right mt-1" style={{ color: text.length > 450 ? C.red : C.textMuted }}>
                                {text.length}/500
                            </p>
                        </div>
                    )}
                    {tab === 'foto' && (
                        <PhotoUploadField
                            value={mediaUrl}
                            onChange={setMediaUrl}
                            disabled={submitting}
                            uploadFn={(file, name) => journeyApi.uploadGateMedia(day.id, file, name)}
                        />
                    )}
                    {tab === 'audio' && (
                        <AudioRecorderField
                            value={mediaUrl}
                            onChange={setMediaUrl}
                            disabled={submitting}
                            uploadFn={(file, name) => journeyApi.uploadGateMedia(day.id, file, name)}
                        />
                    )}
                    {tab === 'check' && (
                        <CheckWithText checked={checked} onCheckedChange={setChecked} text={checkText} onTextChange={setCheckText} disabled={submitting} />
                    )}
                    <p className="text-xs text-center" style={{ color: C.textMuted }}>
                        Las cuatro valen igual y dan el mismo XP.
                    </p>
                </div>
            )}

            {day.hasSecondQuestion && (
                <div className="space-y-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    <p className="text-sm font-medium" style={{ color: C.text }}>{day.secondQuestion}</p>
                    <input
                        value={secondResponse}
                        onChange={e => setSecondResponse(e.target.value)}
                        disabled={submitting}
                        className="w-full rounded-xl p-3 text-sm outline-none"
                        style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                    />
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: C.red, color: '#fff' }}
            >
                {submitting ? 'Guardando...' : 'Guardar mi día'}
            </button>
        </div>
    )
}

const MAX_NOTE_WORDS = 45

function countWords(text: string) {
    const trimmed = text.trim()
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

function CheckWithText({ checked, onCheckedChange, text, onTextChange, disabled }: {
    checked: boolean; onCheckedChange: (v: boolean) => void
    text: string; onTextChange: (v: string) => void
    disabled: boolean
}) {
    const wordCount = countWords(text)
    return (
        <div className="space-y-2">
            <SkipCheckbox checked={checked} label="Ya lo hice" onChange={onCheckedChange} disabled={disabled} />
            <div>
                <textarea
                    value={text}
                    onChange={e => {
                        const val = e.target.value
                        if (countWords(val) <= MAX_NOTE_WORDS) onTextChange(val)
                    }}
                    rows={3}
                    placeholder="Si quieres, agrega algo más (opcional)"
                    disabled={disabled}
                    className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                    style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                />
                <p className="text-xs text-right mt-1" style={{ color: wordCount >= MAX_NOTE_WORDS ? C.red : C.textMuted }}>
                    {wordCount}/{MAX_NOTE_WORDS} palabras
                </p>
            </div>
        </div>
    )
}

// ─── Recompensa diaria ──────────────────────────────────────────────────────

function RecompensaStep({ xpEarned, onContinue }: { xpEarned: number; onContinue: () => void }) {
    
    const [flashing, setFlashing] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => setFlashing(false), 1400)
        return () => clearTimeout(t)
    }, [])
    return (
        <div className="space-y-6 text-center py-6">
            <p
                className={flashing ? 'text-3xl font-bold animate-bounce' : 'text-3xl font-bold'}
                style={{ color: flashing ? C.green : C.amber, fontFamily: "'DM Mono', monospace", transition: 'color 0.4s ease' }}
            >
                +{xpEarned} XP
            </p>
            <p className="text-sm" style={{ color: C.textSec, fontFamily: "'American Typewriter', Georgia, serif" }}>
                Cierra este día así. Mañana te espera tu siguiente pregunta, a tu ritmo.
            </p>
            <p className="text-xs" style={{ color: C.textMuted }}>
                Si quieres, comparte tu experiencia con la tribu puede acompañar a alguien más en su camino.
            </p>
            <button
                type="button"
                onClick={onContinue}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
            >
                Volver al mapa
            </button>
        </div>
    )
}

// ─── Celebración día 7 ──────────────────────────────────────────────────────

function CelebracionStep({ totalXpEarned, days, onFinish }: { totalXpEarned: number; days: GateDayStatus[]; onFinish: () => void }) {
    const day1 = days.find(d => d.dayNumber === 1)?.response
    const day7 = days.find(d => d.dayNumber === 7)?.response
    const hasMirror = day1?.evidenceType === 'texto' && day7?.evidenceType === 'texto' && day1.responseText && day7.responseText

    return (
        <div className="space-y-6 text-center">
            <p className="text-xs font-semibold tracking-widest" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                COMPLETASTE LOS 7 DÍAS
            </p>
            <h2 className="text-2xl font-bold" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                +{totalXpEarned} XP
            </h2>
            {hasMirror ? (
                <div className="space-y-3 text-left">
                    <div className="rounded-xl p-3" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: C.label }}>Día 1 · dónde estabas</p>
                        <p className="text-sm mt-1" style={{ color: C.textSec }}>{day1!.responseText}</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: C.surface2, border: `1px solid ${C.green}` }}>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: C.label }}>Día 7 · qué ves</p>
                        <p className="text-sm mt-1" style={{ color: C.text }}>{day7!.responseText}</p>
                    </div>
                </div>
            ) : (
                <p className="text-sm" style={{ color: C.textSec }}>7 días mirando de frente.</p>
            )}
            <p className="text-xs" style={{ color: C.textMuted }}>
                Si quieres, comparte tu experiencia con la tribu tu historia puede ser la luz de alguien más.
            </p>
            <button
                type="button"
                onClick={onFinish}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: C.red, color: '#fff' }}
            >
                Explorar mis Mundos
            </button>
        </div>
    )
}
