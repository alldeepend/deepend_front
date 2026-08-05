import { useState } from 'react'
import { C } from '../../../styles/colors'

const SIZE_PATTERN = /(?<plus>\+{1,4})(?<plusBody>[^+]+)\k<plus>|(?<minus>-{1,4})(?<minusBody>[^-]+)\k<minus>|\*\*_(?<bi1>[^_*]+)_\*\*|_\*\*(?<bi2>[^_*]+)\*\*_|\*\*(?<bold>[^*]+)\*\*|_(?<italic>[^_]+)_/g

export function parseBold(text: string): React.ReactNode {
    const nodes: React.ReactNode[] = []
    let lastIndex = 0
    let key = 0
    for (const m of text.matchAll(SIZE_PATTERN)) {
        if (m.index > lastIndex) nodes.push(text.slice(lastIndex, m.index))
        const g = m.groups!
        if (g.plus !== undefined) {
            const scale = 1 + g.plus.length * 0.15
            nodes.push(<span key={key++} style={{ fontSize: `${scale}em` }}>{parseBold(g.plusBody)}</span>)
        } else if (g.minus !== undefined) {
            const scale = Math.max(0.5, 1 - g.minus.length * 0.12)
            nodes.push(<span key={key++} style={{ fontSize: `${scale}em` }}>{parseBold(g.minusBody)}</span>)
        } else if (g.bi1 !== undefined) {
            nodes.push(<strong key={key++}><em>{parseBold(g.bi1)}</em></strong>)
        } else if (g.bi2 !== undefined) {
            nodes.push(<strong key={key++}><em>{parseBold(g.bi2)}</em></strong>)
        } else if (g.bold !== undefined) {
            nodes.push(<strong key={key++}>{parseBold(g.bold)}</strong>)
        } else if (g.italic !== undefined) {
            nodes.push(<em key={key++}>{parseBold(g.italic)}</em>)
        }
        lastIndex = m.index + m[0].length
    }
    if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
    return nodes
}


export function parseLines(text: string): React.ReactNode {
    return text.split('\n').flatMap((line, li, arr) =>
        li < arr.length - 1
            ? [...(parseBold(line) as any[]), <br key={`br-${li}`} />]
            : parseBold(line) as any[]
    )
}

export function parseText(text: string, className = 'text-sm leading-relaxed', style: React.CSSProperties = { color: C.text }): React.ReactNode {
    return text.split(/\n\n+/).map((para, pi) => (
        <p key={pi} className={className} style={style}>
            {parseLines(para)}
        </p>
    ))
}

// ─── Recordatorio de respuesta anterior, insertado como marcador {1}, {2}... ──────
// Compartido entre la intro de mundo y los bloques de estación con texto libre.

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
export function parseTextWithRecalls(
    text: string,
    recalls: (string | null)[],
    className = 'text-sm leading-relaxed',
    style: React.CSSProperties = { color: C.text }
): React.ReactNode {
    return text.split(/\n\n+/).map((para, pi) => {
        const nodes: React.ReactNode[] = []
        let lastIndex = 0
        let key = 0
        for (const m of para.matchAll(MARKER_PATTERN)) {
            if (m.index! > lastIndex) nodes.push(<span key={key++}>{parseLines(para.slice(lastIndex, m.index))}</span>)
            const recallText = recalls[parseInt(m[1], 10) - 1]
            if (recallText) nodes.push(<RecallChip key={`r-${key++}`} text={recallText} />)
            lastIndex = m.index! + m[0].length
        }
        if (lastIndex < para.length) nodes.push(<span key={key++}>{parseLines(para.slice(lastIndex))}</span>)
        return (
            <p key={pi} className={className} style={style}>
                {nodes}
            </p>
        )
    })
}
