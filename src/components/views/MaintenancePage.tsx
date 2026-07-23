import { C } from '../../styles/colors'

export default function MaintenancePage() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
            style={{ background: C.bg, color: C.text, fontFamily: 'Montserrat, sans-serif' }}
        >
            <img src="/Logos_Variaciones-02.png" alt="DeepEnd" className="w-40 object-contain" />
            <h1
                className="text-2xl font-bold leading-snug max-w-md"
                style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
            >
                Estamos actualizando la plataforma
            </h1>
            <p className="text-sm max-w-sm" style={{ color: C.textMuted }}>
                Volvemos pronto. Gracias por tu paciencia.
            </p>
        </div>
    )
}
