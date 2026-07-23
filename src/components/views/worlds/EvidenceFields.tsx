import { useEffect, useRef, useState } from 'react'
import { journeyApi } from '../../../services/journey'
import { C } from '../../../styles/colors'

type UploadFn = (file: File | Blob, fileName: string) => Promise<{ url: string }>

// ─── Foto / Nota de voz (subida real) ──────────────────────────────────────────

export function PhotoUploadField({
    blockId, value, onChange, disabled, uploadFn,
}: { blockId?: string; value: string | null; onChange: (url: string | null) => void; disabled: boolean; uploadFn?: UploadFn }) {
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const upload = uploadFn ?? ((file: File | Blob, fileName: string) => journeyApi.uploadBlockMedia(blockId!, file, fileName))

    const handleFile = async (file: File) => {
        setUploading(true)
        try {
            const { url } = await upload(file, file.name)
            onChange(url)
        } catch {
            alert('No se pudo subir la foto. Intenta de nuevo.')
        } finally {
            setUploading(false)
        }
    }

    if (value) {
        return (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.green}` }}>
                <img src={value} alt="" className="w-full object-cover" style={{ maxHeight: '260px' }} />
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="w-full py-2.5 text-xs font-semibold"
                        style={{ background: C.surface2, color: C.textMuted }}
                    >
                        Cambiar foto
                    </button>
                )}
            </div>
        )
    }

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={disabled || uploading}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
                type="button"
                onClick={() => !disabled && !uploading && inputRef.current?.click()}
                className="w-full rounded-xl flex flex-col items-center justify-center gap-3 py-10 transition-all"
                style={{
                    background: C.surface1,
                    border: `2px dashed ${C.border}`,
                    cursor: disabled || uploading ? 'default' : 'pointer',
                }}
            >
                {uploading ? (
                    <p className="text-sm font-medium" style={{ color: C.textMuted }}>Subiendo...</p>
                ) : (
                    <>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: C.textMuted }}>
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <p className="text-sm font-medium" style={{ color: C.textMuted }}>
                            Tomar / subir foto
                        </p>
                    </>
                )}
            </button>
        </div>
    )
}

export function AudioRecorderField({
    blockId, value, onChange, disabled, uploadFn,
}: { blockId?: string; value: string | null; onChange: (url: string | null) => void; disabled: boolean; uploadFn?: UploadFn }) {
    const [recording, setRecording] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const [uploading, setUploading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const upload = uploadFn ?? ((file: File | Blob, fileName: string) => journeyApi.uploadBlockMedia(blockId!, file, fileName))

    const cleanup = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
    }

    useEffect(() => () => cleanup(), [])

    const pickMimeType = () => {
        if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return undefined
        const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        return candidates.find(t => MediaRecorder.isTypeSupported(t))
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            const mimeType = pickMimeType()
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            chunksRef.current = []
            recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            recorder.onstop = async () => {
                cleanup()
                const blob = new Blob(chunksRef.current, { type: mimeType ?? 'audio/webm' })
                setUploading(true)
                try {
                    const ext = blob.type.includes('mp4') ? 'm4a' : 'webm'
                    const { url } = await upload(blob, `nota-de-voz.${ext}`)
                    onChange(url)
                } catch {
                    alert('No se pudo subir la nota de voz. Intenta de nuevo.')
                } finally {
                    setUploading(false)
                }
            }
            mediaRecorderRef.current = recorder
            recorder.start()
            setRecording(true)
            setElapsed(0)
            timerRef.current = setInterval(() => {
                setElapsed(prev => {
                    if (prev + 1 >= 60) {
                        mediaRecorderRef.current?.stop()
                        setRecording(false)
                        return 60
                    }
                    return prev + 1
                })
            }, 1000)
        } catch {
            alert('No se pudo acceder al micrófono. Revisa los permisos del navegador.')
        }
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        setRecording(false)
    }

    const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    if (value) {
        return (
            <div className="rounded-xl p-4 space-y-3" style={{ background: C.surface1, border: `1px solid ${C.green}` }}>
                <audio controls src={value} className="w-full" style={{ height: '36px', colorScheme: 'dark' }} />
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="w-full py-2 rounded-lg text-xs font-semibold"
                        style={{ background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
                    >
                        Grabar de nuevo
                    </button>
                )}
            </div>
        )
    }

    return (
        <div
            className="rounded-xl p-6 flex flex-col items-center justify-center gap-4"
            style={{ background: C.surface1, border: `1px solid ${C.border}` }}
        >
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: C.red, opacity: recording ? 1 : 0.85 }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </div>
            <p className="text-xs" style={{ color: recording ? C.red : C.textMuted }}>
                {uploading ? 'Subiendo...' : recording ? `Grabando · ${mmss(elapsed)} / 1:00` : 'Habla libremente · max 60 seg'}
            </p>
            <button
                type="button"
                onClick={() => !disabled && !uploading && (recording ? stopRecording() : startRecording())}
                disabled={disabled || uploading}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{
                    background: recording ? C.red : C.surface2,
                    border: `1px solid ${recording ? C.red : C.border}`,
                    color: recording ? '#fff' : C.textMuted,
                    opacity: disabled || uploading ? 0.6 : 1,
                }}
            >
                {recording ? 'Detener grabación' : 'Empezar a grabar'}
            </button>
        </div>
    )
}

export function SkipCheckbox({
    checked, label, onChange, disabled,
}: { checked: boolean; label: string; onChange: (v: boolean) => void; disabled: boolean }) {
    return (
        <label
            className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer select-none transition-colors"
            style={{
                background: checked ? `${C.green}20` : C.surface1,
                border: `1px solid ${checked ? C.green : C.border}`,
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'default' : 'pointer',
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={e => onChange(e.target.checked)}
                className="sr-only"
            />
            <span
                className="inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs shrink-0"
                style={{
                    borderColor: checked ? C.green : C.border,
                    background: checked ? C.green : 'transparent',
                    color: '#fff',
                }}
            >
                {checked ? '✓' : ''}
            </span>
            <span className="text-sm" style={{ color: checked ? C.green : C.textMuted }}>{label}</span>
        </label>
    )
}
