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
    // No está en este viaje — puede ser un recuerdo de un viaje hermano de la
    // misma Colección, que el backend ya trajo aparte en crossJourneyBlocks.
    const cross = data.crossJourneyBlocks?.find(b => b.id === blockId)
    if (cross) return { ...cross, stationId: '', title: '', description: null, orderIndex: 0 }
    return null
}

// Para un árbol de decisiones, calcula en qué posición cae un paso dado
// dentro de SOLO los pasos de pregunta/guiada de esa ruta (-1 si no es de
// ese tipo) — es la misma cuenta que stepQuestionIndex en WorldsStation.tsx,
// necesaria acá para poder leer allRouteAnswers en la posición correcta.
function arbolStepQuestionIndex(steps: any[], stepIndex: number): number {
    let qi = -1
    for (let i = 0; i <= stepIndex; i++) {
        const kind = steps[i]?.kind
        if (kind === 'question' || kind === 'guided') qi++
    }
    return qi
}

// Convierte la respuesta guardada (forma distinta según el tipo/modo del bloque) en texto legible.
// arbolRouteStep (opcional): para un bloque de árbol de decisiones, qué paso
// puntual traer según la ruta que la persona haya elegido — configurado por
// el admin al marcar el recordatorio (content.arbolRouteRecallSteps en el
// bloque que RECUERDA, no en el bloque recordado). Sin esto, se usa el
// comportamiento de siempre: todas las preguntas/frases guiadas de la ruta,
// juntas.
export function extractRecallText(blockType: string, content: any, value: any, arbolRouteStep?: Record<string, number>): string {
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
            const routeConfig = (content?.routes ?? []).find((r: any) => r.id === route)
            const configuredStepIndex = route ? arbolRouteStep?.[route] : undefined
            if (routeConfig && configuredStepIndex !== undefined) {
                const step = routeConfig.steps?.[configuredStepIndex]
                if (!step) return ''
                if (step.kind === 'question' || step.kind === 'guided') {
                    const qi = arbolStepQuestionIndex(routeConfig.steps, configuredStepIndex)
                    const answers: string[] = (value.allRouteAnswers ?? {})[route] ?? []
                    return answers[qi] ?? ''
                }
                if (step.kind === 'group') {
                    const selections: string[] = (value.allRouteSelections ?? {})[route]?.[step.groupId] ?? []
                    const otherText: string = (value.allRouteOtherTexts ?? {})[route]?.[step.groupId] ?? ''
                    return selections.map(s => (s === 'Otra — escribo yo' ? otherText : s)).filter(Boolean).join(', ')
                }
                return ''
            }
            // Sin configuración por ruta: comportamiento de siempre — todas las
            // preguntas/frases guiadas de la ruta, juntas.
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

export function getRecalledAnswer(
    data: JourneyDetailsResponse | null,
    recallBlockId: string | undefined,
    arbolRouteStep?: Record<string, number>
): string | null {
    if (!data || !recallBlockId) return null
    const block = findBlockById(data, recallBlockId)
    if (!block) return null
    const interaction = data.progress.blockInteractions.find(bi => bi.blockId === recallBlockId)
    if (!interaction || interaction.responses == null) return null
    const text = extractRecallText(block.type, block.content, interaction.responses, arbolRouteStep)
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
// arbolRouteStep: la configuración por ruta de ESTE recuerdo puntual (si el
// bloque que lo definió tiene content.arbolRouteRecallSteps[ref]).
export function resolveRecallRef(
    ref: string,
    data: JourneyDetailsResponse | null,
    gateStatus: GateStatus | null,
    arbolRouteStep?: Record<string, number>
): string | null {
    if (ref.startsWith('gateday:')) {
        return getRecalledGateAnswer(gateStatus, ref.slice('gateday:'.length))
    }
    if (ref.startsWith('block:')) {
        return getRecalledAnswer(data, ref.slice('block:'.length), arbolRouteStep)
    }
    // Compatibilidad: referencias guardadas sin prefijo se tratan como bloque.
    return getRecalledAnswer(data, ref, arbolRouteStep)
}

