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

export function parseText(text: string, className = 'text-sm leading-relaxed', style: React.CSSProperties = { color: C.text }): React.ReactNode {
    return text.split(/\n\n+/).map((para, pi) => (
        <p key={pi} className={className} style={style}>
            {para.split('\n').flatMap((line, li, arr) =>
                li < arr.length - 1
                    ? [...(parseBold(line) as any[]), <br key={`br-${li}`} />]
                    : parseBold(line) as any[]
            )}
        </p>
    ))
}
