import { useState } from 'react'
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
                className="w-full max-w-md rounded-2xl flex flex-col"
                style={{ background: C.surface1, border: `1px solid ${C.border}`, maxHeight: '90vh' }}
            >
                <div className="overflow-y-auto p-6">
                    <div className="flex justify-end -mt-1 -mr-1 mb-1">
                        <button
                            type="button"
                            onClick={onDismiss}
                            aria-label="Cerrar"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                            style={{ color: C.textMuted }}
                        >
                            ✕
                        </button>
                    </div>
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
                Una pregunta al día durante 7 días. Sin respuestas buenas ni malas.
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
    return (
        <div className="space-y-5">
            <div className="text-center space-y-1">
                <p className="text-xs font-semibold tracking-widest" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                    DÍA {currentDay ?? 1} DE 7
                </p>
                <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                    Tu recorrido
                </h2>
            </div>
            <div className="space-y-1.5">
                {days.map(day => {
                    const clickable = day.state === 'today' || day.state === 'pending'
                    const label =
                        day.state === 'tomorrow' ? 'Mañana' :
                        day.state === 'future' ? `Día ${day.dayNumber}` :
                        (day.anchorLabel || `Día ${day.dayNumber}`)
                    return (
                        <button
                            key={day.dayNumber}
                            type="button"
                            onClick={() => onOpenDay(day)}
                            disabled={!clickable}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                            style={{ background: clickable ? C.surface2 : 'transparent', cursor: clickable ? 'pointer' : 'default' }}
                        >
                            <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-semibold"
                                style={{
                                    background: day.state === 'completed' ? C.green : day.state === 'today' ? C.amber : 'transparent',
                                    border: `1px solid ${day.state === 'completed' ? C.green : day.state === 'today' ? C.amber : C.border}`,
                                    color: day.state === 'completed' || day.state === 'today' ? C.bgDeep : C.textMuted,
                                }}
                            >
                                {day.state === 'completed' ? '✓' : day.dayNumber}
                            </span>
                            <span
                                className="text-sm"
                                style={{
                                    color: day.state === 'completed' ? C.textMuted : day.state === 'today' ? C.text : C.textMuted,
                                    fontWeight: day.state === 'today' ? 500 : 400,
                                }}
                            >
                                {label}
                            </span>
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
            {day.anchorLabel && (
                <p className="text-xs font-semibold tracking-widest" style={{ color: C.label, fontFamily: "'DM Mono', monospace" }}>
                    {day.anchorLabel}
                </p>
            )}
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
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={4}
                            placeholder="Escribe tu respuesta..."
                            disabled={submitting}
                            className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                        />
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

function CheckWithText({ checked, onCheckedChange, text, onTextChange, disabled }: {
    checked: boolean; onCheckedChange: (v: boolean) => void
    text: string; onTextChange: (v: string) => void
    disabled: boolean
}) {
    return (
        <div className="space-y-2">
            <SkipCheckbox checked={checked} label="Ya lo hice" onChange={onCheckedChange} disabled={disabled} />
            <textarea
                value={text}
                onChange={e => onTextChange(e.target.value)}
                rows={3}
                placeholder="Si quieres, agrega algo más (opcional)"
                disabled={disabled}
                className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
            />
        </div>
    )
}

// ─── Recompensa diaria ──────────────────────────────────────────────────────

function RecompensaStep({ xpEarned, onContinue }: { xpEarned: number; onContinue: () => void }) {
    return (
        <div className="space-y-6 text-center py-6">
            <p className="text-3xl font-bold" style={{ color: C.amber, fontFamily: "'DM Mono', monospace" }}>
                +{xpEarned} XP
            </p>
            <p className="text-sm" style={{ color: C.textSec, fontFamily: "'American Typewriter', Georgia, serif" }}>
                Un día más mirando de frente.
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
