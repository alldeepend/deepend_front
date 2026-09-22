import { useEffect, useState } from 'react'
import { C } from '../../styles/colors'
import { isViewOnlyActive, exitViewOnlyMode } from '../../lib/viewAsGuard'

export default function ViewOnlyBanner() {
    const [active, setActive] = useState(false)

    useEffect(() => {
        setActive(isViewOnlyActive())
    }, [])

    if (!active) return null

    return (
        <div
            className="sticky top-0 z-[300] flex items-center justify-center gap-3 px-4 py-2 text-sm"
            style={{ background: C.amber, color: C.bg }}
        >
            <span className="font-semibold" style={{ fontFamily: "'American Typewriter', Georgia, serif" }}>
                Estás viendo esto como administrador — modo solo lectura
            </span>
            <button
                onClick={exitViewOnlyMode}
                className="underline font-bold shrink-0"
            >
                Salir de vista previa
            </button>
        </div>
    )
}
