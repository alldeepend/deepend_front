import { C } from '../../../styles/colors'
import { parseTextWithRecalls } from './textParsing'
import { resolveRecallRef } from './recallUtils'
import type { GateStatus, JourneyDetailsResponse, WorldIntro } from '../../../types/journey'

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
                        {parseTextWithRecalls(intro.text, recalls, 'text-sm leading-relaxed', { color: C.textSec })}
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
