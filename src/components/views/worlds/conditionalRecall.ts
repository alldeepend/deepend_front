import type { GateStatus, JourneyDetailsResponse } from '../../../types/journey'
import { resolveRecallRef } from './recallUtils'

// Feature nueva e independiente del sistema de marcadores {N} (recallUtils/
// parseTextWithRecalls) — no lo modifica.
//
// El admin elige N condiciones (candidates[0..N-1]) y escribe un texto fijo
// para cada una de las 2^N combinaciones posibles de "tiene respuesta / no
// tiene respuesta" de esas N condiciones. La combinación se guarda indexada
// por bitmask: el bit i vale 1 si candidates[i] tiene respuesta. El mask 0
// (ninguna condición cumplida) es el equivalente al fallback de antes.

export type ConditionalRecall = {
    candidates: string[]
    combinations: string[] // longitud 2^candidates.length, indexado por bitmask
}

export type ResolvedConditionalRecall = {
    text: string
    isFallback: boolean // true cuando no se cumplió ninguna condición (mask 0)
    recalls: (string | null)[]
}

export function resolveConditionalRecall(
    config: ConditionalRecall | null | undefined,
    data: JourneyDetailsResponse | null,
    gateStatus: GateStatus | null
): ResolvedConditionalRecall | null {
    if (!config || !config.candidates?.length) return null

    const recalls: (string | null)[] = config.candidates.map(ref =>
        ref ? resolveRecallRef(ref, data, gateStatus) : null
    )
    let mask = 0
    recalls.forEach((answer, i) => { if (answer) mask |= (1 << i) })

    const text = config.combinations?.[mask]
    if (!text?.trim()) return null
    return { text, isFallback: mask === 0, recalls }
}
