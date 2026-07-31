import { Link } from 'react-router';
import { ArrowLeft, Camera } from 'lucide-react';
import { C } from '../../styles/colors';

const heading = { fontFamily: "'American Typewriter', Georgia, serif", color: C.text };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-base font-bold mb-3" style={{ color: C.text }}>{title}</h2>
            <div className="space-y-2.5">{children}</div>
        </section>
    );
}

// Créditos de recursos externos usados en la plataforma (por ahora, solo fotografías).
export default function Creditos() {
    return (
        <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
            <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: C.bg + 'e6', borderColor: C.border }}>
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/pwa-512x512.png" alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-base font-bold" style={heading}>
                            DeepEnd<span style={{ color: C.green }}>.</span>
                        </span>
                    </Link>
                    <Link to="/" className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80" style={{ color: C.label }}>
                        <ArrowLeft size={14} /> Volver
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-14">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: C.red }}>
                    Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={heading}>
                    Créditos y Atribuciones
                </h1>
                <p className="text-xs mb-12" style={{ color: C.label }}>
                    Reconocimiento de los recursos externos utilizados en DeepEnd.
                </p>

                <div className="space-y-9 text-sm leading-relaxed" style={{ color: C.textSec }}>
                    <Section title="Fotografías">
                        <div className="flex items-start gap-3 rounded-2xl border p-5" style={{ background: C.surface1, borderColor: C.border }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${C.green}18` }}>
                                <Camera size={16} style={{ color: C.green }} />
                            </div>
                            <p className="m-0">
                                Las fotografías utilizadas en esta plataforma provienen de{' '}
                                <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: C.text }}>
                                    Unsplash
                                </a>{' '}
                                y se utilizan bajo una suscripción comercial paga (Unsplash+), que otorga los derechos de
                                uso comercial correspondientes para todas las imágenes publicadas en DeepEnd, conforme a
                                los términos de licencia aplicables.
                            </p>
                        </div>
                    </Section>
                </div>
            </main>
        </div>
    );
}
