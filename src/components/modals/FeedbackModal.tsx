import { useState } from 'react'
import { X, Send, CheckCircle2 } from 'lucide-react'
import { C } from '../../styles/colors'
import { feedbackApi } from '../../services/feedback'

interface FeedbackModalProps {
    onClose: () => void
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!message.trim()) return
        setSending(true)
        setError('')
        try {
            await feedbackApi.send(message.trim())
            setSent(true)
        } catch {
            setError('No se pudo enviar. Intenta de nuevo en un momento.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-3xl shadow-2xl p-6 relative border"
                style={{ background: C.surface1, borderColor: C.border }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4" style={{ color: C.label }}>
                    <X size={20} />
                </button>

                {sent ? (
                    <div className="flex flex-col items-center text-center gap-3 py-6">
                        <CheckCircle2 size={40} style={{ color: C.green }} />
                        <h3
                            className="text-lg font-bold"
                            style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                        >
                            ¡Gracias por avisarnos!
                        </h3>
                        <p className="text-sm" style={{ color: C.textMuted }}>
                            Ya lo tenemos en nuestro radar.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <>
                        <h3
                            className="text-lg font-bold mb-1"
                            style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                        >
                            Reportar un problema o sugerencia
                        </h3>
                        <p className="text-sm mb-4" style={{ color: C.textMuted }}>
                            ¿Algo no funcionó como esperabas, o se te ocurre algo que podríamos mejorar? Cuéntanos.
                        </p>
                        <textarea
                            autoFocus
                            rows={5}
                            maxLength={2000}
                            placeholder="Escribe aquí lo que pasó o tu idea..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                        />
                        {error && (
                            <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={!message.trim() || sending}
                            className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: C.red, color: '#fff' }}
                        >
                            <Send size={16} /> {sending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
