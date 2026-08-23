import type { GateStatus, JourneyDetailsResponse } from '../../../types/journey'
import { resolveRecallRef } from './recallUtils'

// Feature nueva e independiente del sistema de marcadores {N} (recallUtils/
// parseTextWithRecalls) — no lo modifica, solo reutiliza resolveRecallRef
// para probar cada candidato de la cadena en orden.

export type ConditionalRecall = {
    candidates: string[]
    fallbackText: string
}

export type ResolvedConditionalRecall = {
    text: string
    isFallback: boolean
}

export function resolveConditionalRecall(
    config: ConditionalRecall | null | undefined,
    data: JourneyDetailsResponse | null,
    gateStatus: GateStatus | null
): ResolvedConditionalRecall | null {
    if (!config) return null
    for (const ref of config.candidates ?? []) {
        const answer = resolveRecallRef(ref, data, gateStatus)
        if (answer) return { text: answer, isFallback: false }
    }
    if (config.fallbackText?.trim()) return { text: config.fallbackText, isFallback: true }
    return null
}
