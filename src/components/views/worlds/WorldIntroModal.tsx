import { useState } from 'react'
import { C } from '../../../styles/colors'
import { parseBold } from './textParsing'
import { resolveRecallRef } from './recallUtils'
import type { GateStatus, JourneyDetailsResponse, WorldIntro } from '../../../types/journey'

const MARKER_PATTERN = /\{(\d+)\}/g

// Chip inline que revela el recordatorio justo donde se insertó el {N} en el texto.
function RecallChip({ text }: { text: string }) {
    const [show, setShow] = useState(false)

    return (
        <span className="inline align-middle">
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="mx-0.5 text-xs font-semibold underline decoration-dotted underline-offset-2"
                style={{ color: C.amber }}
            >
                {show ? 'ocultar' : 'ver tu respuesta'}
            </button>
            {show && (
                <span
                    className="block mt-2 mb-1 rounded-xl px-4 py-3"
                    style={{ background: C.surface2, border: `1px solid ${C.green}40` }}
                >
                    <span className="block text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: C.green }}>
                        Tu respuesta anterior
                    </span>
                    <span className="block text-sm leading-relaxed italic" style={{ color: C.text }}>
                        "{text}"
                    </span>
                </span>
            )}
        </span>
    )
}

// Como parseText, pero además reemplaza los marcadores {1}, {2}... por un
// RecallChip inline, justo en la posición donde el admin los insertó.
function parseIntroContent(text: string, recalls: (string | null)[]): React.ReactNode {
    return text.split(/\n\n+/).map((para, pi) => {
        const nodes: React.ReactNode[] = []
        let lastIndex = 0
        let key = 0
        for (const m of para.matchAll(MARKER_PATTERN)) {
            if (m.index! > lastIndex) nodes.push(<span key={key++}>{parseBold(para.slice(lastIndex, m.index))}</span>)
            const recallText = recalls[parseInt(m[1], 10) - 1]
            if (recallText) nodes.push(<RecallChip key={`r-${key++}`} text={recallText} />)
            lastIndex = m.index! + m[0].length
        }
        if (lastIndex < para.length) nodes.push(<span key={key++}>{parseBold(para.slice(lastIndex))}</span>)
        return (
            <p key={pi} className="text-sm leading-relaxed" style={{ color: C.textSec }}>
                {nodes}
            </p>
        )
    })
}

export default function WorldIntroModal({
    worldTitle,
    intro,
    data,
    gateStatus,
    onContinue,
}: {
    worldTitle: string
    intro: WorldIntro
    data: JourneyDetailsResponse
    gateStatus: GateStatus | null
    onContinue: () => void
}) {
    const recalls = intro.recallRefs.map(ref => resolveRecallRef(ref, data, gateStatus))

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-md rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto dark-scrollbar"
                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
            >
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.amber }}>
                        Nuevo mundo
                    </p>
                    <h2
                        className="text-xl font-bold leading-snug"
                        style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                    >
                        {worldTitle}
                    </h2>
                </div>

                {intro.text && (
                    <div className="space-y-2">
                        {parseIntroContent(intro.text, recalls)}
                    </div>
                )}

                <button
                    onClick={onContinue}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                    style={{ background: C.red }}
                >
                    Continuar
                </button>
            </div>
        </div>
    )
}
