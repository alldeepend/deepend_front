import type { Block, GateStatus, JourneyDetailsResponse } from '../../../types/journey'

// ─── Recordatorio de respuesta anterior ────────────────────────────────────────
// Compartido entre WorldsStation (recordatorio de un solo bloque) y la
// introducción de mundo (varios recordatorios a la vez).

export function findBlockById(data: JourneyDetailsResponse, blockId: string): Block | null {
    for (const w of data.journey.worlds) {
        for (const s of w.stations) {
            const b = s.blocks.find(bl => bl.id === blockId)
            if (b) return b
        }
    }
    return null
}

// Convierte la respuesta guardada (forma distinta según el tipo/modo del bloque) en texto legible
export function extractRecallText(blockType: string, content: any, value: any): string {
    if (value == null) return ''
    if (blockType === 'accion_real' && content?.actionType === 'foto' && typeof value === 'string') {
        return value ? '(Foto subida)' : ''
    }
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.filter(Boolean).join(', ')

    if (blockType === 'activacion') {
        const isPreguntas = content?.selectionType === 'preguntas'
        const isArbol = content?.selectionType === 'arbol_decision'
        const isReescritura = content?.selectionType === 'reescritura_guiada'
        if (isPreguntas) {
            const answers: any[] = value.answers ?? []
            return answers
                .map(a => typeof a === 'string' ? a : (a?.guided ? `${a.prefix ?? ''} ${a.text ?? ''}`.trim() : ''))
                .filter(Boolean).join(' · ')
        }
        if (isArbol) {
            const route = value.selectedRoute
            const answers: string[] = (value.allRouteAnswers ?? {})[route] ?? []
            return answers.filter(Boolean).join(' · ')
        }
        if (isReescritura) {
            const completions: string[] = value.completions ?? []
            return completions.filter(Boolean).join(' · ')
        }
        if (value.mode === 'select') {
            const sel: string[] = value.selected ?? []
            return [...sel.filter((s: string) => s !== 'Otra — escribo yo'), value.otherText].filter(Boolean).join(', ')
        }
        if (value.mode === 'audio') return value.audioUrl ? '(Nota de voz)' : ''
        return value.text ?? ''
    }

    if (blockType === 'accion_real') {
        if (content?.actionType === 'seleccion') {
            return value.selected === 'guided' ? (value.guidedText ?? '') : (value.selected ?? '')
        }
        if (value.activeTab === 'photo') return value.photoUrl ? '(Foto subida)' : ''
        if (value.activeTab === 'audio') return value.audioUrl ? '(Nota de voz)' : ''
        return value.text ?? ''
    }

    return value.text ?? ''
}

export function getRecalledAnswer(data: JourneyDetailsResponse | null, recallBlockId: string | undefined): string | null {
    if (!data || !recallBlockId) return null
    const block = findBlockById(data, recallBlockId)
    if (!block) return null
    const interaction = data.progress.blockInteractions.find(bi => bi.blockId === recallBlockId)
    if (!interaction || interaction.responses == null) return null
    const text = extractRecallText(block.type, block.content, interaction.responses)
    return text.trim() || null
}

// Recordatorio de una respuesta de un día de la Puerta (7 días previos al viaje)
export function getRecalledGateAnswer(gateStatus: GateStatus | null, recallGateDayId: string | undefined): string | null {
    if (!gateStatus || !recallGateDayId) return null
    const day = gateStatus.days?.find(d => d.id === recallGateDayId)
    const response = day?.response
    if (!response) return null
    if (response.evidenceType === 'foto') return response.mediaUrl ? '(Foto subida)' : null
    if (response.evidenceType === 'audio') return response.mediaUrl ? '(Nota de voz)' : null
    return response.responseText?.trim() || (response.evidenceType === 'check' ? '(Marcado como hecho)' : null)
}

// Resuelve una referencia con prefijo ("block:<id>" o "gateday:<id>") al texto
// recordado correspondiente, usando la fuente de datos que aplique.
export function resolveRecallRef(
    ref: string,
    data: JourneyDetailsResponse | null,
    gateStatus: GateStatus | null
): string | null {
    if (ref.startsWith('gateday:')) {
        return getRecalledGateAnswer(gateStatus, ref.slice('gateday:'.length))
    }
    if (ref.startsWith('block:')) {
        return getRecalledAnswer(data, ref.slice('block:'.length))
    }
    // Compatibilidad: referencias guardadas sin prefijo se tratan como bloque.
    return getRecalledAnswer(data, ref)
}
