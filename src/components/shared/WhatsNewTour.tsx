import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { C } from '../../styles/colors';
import { changelogApi } from '../../services/changelog';
import { CHANGELOG_STEPS } from '../../data/changelogSteps';
import { useChangelogTour } from '../../store/useChangelogTour';

type SpotBox = { top: number; left: number; width: number; height: number };
type CardPos = React.CSSProperties;

function measure(target: string): SpotBox | null {
    const el = document.querySelector(target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function WhatsNewTour() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isDashboard = pathname === '/dashboard';

    const { open, step, openTour, close: closeTour, setStep } = useChangelogTour();
    const [box, setBox] = useState<SpotBox | null>(null);

    // Auto-abre el tour la primera vez que el usuario entra al dashboard
    // después de una versión nueva (no se repite una vez marcado como visto).
    useEffect(() => {
        if (!isDashboard) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        changelogApi.getStatus()
            .then(({ shouldShow }) => {
                if (shouldShow) {
                    // deja que el sidebar y el botón de WhatsApp terminen de montarse
                    setTimeout(() => openTour(), 500);
                }
            })
            .catch(() => {});
    }, [isDashboard, openTour]);

    // Si el paso actual pertenece a otra sección, navega ahí automáticamente.
    useEffect(() => {
        if (!open) return;
        const current = CHANGELOG_STEPS[step];
        if (current.route && current.route !== pathname) navigate(current.route);
    }, [open, step, pathname, navigate]);

    // Mide el elemento señalado. Como puede tardar en montarse justo después
    // de navegar a otra sección, reintenta unas cuantas veces antes de
    // rendirse y mostrar la tarjeta centrada como respaldo.
    useEffect(() => {
        if (!open) return;
        const current = CHANGELOG_STEPS[step];

        if (current.type !== 'spot' || !current.target) { setBox(null); return; }
        if (current.route && current.route !== pathname) { setBox(null); return; }

        let cancelled = false;
        let attempts = 0;
        const tryMeasure = () => {
            if (cancelled) return;
            const b = measure(current.target!);
            if (b) setBox(b);
            else if (++attempts < 30) setTimeout(tryMeasure, 100);
        };
        tryMeasure();

        const onResize = () => {
            if (cancelled) return;
            const b = measure(current.target!);
            if (b) setBox(b);
        };
        window.addEventListener('resize', onResize);
        return () => { cancelled = true; window.removeEventListener('resize', onResize); };
    }, [open, step, pathname]);

    const close = () => {
        closeTour();
        changelogApi.markSeen().catch(() => {});
        if (pathname !== '/dashboard') navigate('/dashboard');
    };

    if (!open) return null;

    return <TourOverlay step={step} setStep={setStep} box={box} onClose={close} />;
}

function TourOverlay({
    step,
    setStep,
    box,
    onClose,
}: {
    step: number;
    setStep: (n: number) => void;
    box: SpotBox | null;
    onClose: () => void;
}) {
    const data = CHANGELOG_STEPS[step];
    const Icon = data.icon;
    const isSpot = data.type === 'spot' && box;

    let cardStyle: CardPos = {};
    let arrowStyle: CardPos | null = null;

    if (isSpot && box) {
        if (data.side === 'right') {
            cardStyle = { top: Math.max(16, box.top + box.height / 2 - 60), left: box.left + box.width + 24 };
            arrowStyle = { left: -6, top: 40, borderRadius: 2 };
        } else {
            cardStyle = {
                bottom: Math.max(16, window.innerHeight - box.top + 24),
                right: Math.max(16, window.innerWidth - box.left - box.width),
            };
            arrowStyle = { right: 30, bottom: -6, borderRadius: 2, transform: 'rotate(-45deg)' };
        }
    }

    return (
        <>
            {isSpot && box ? (
                <div
                    className="fixed pointer-events-none transition-all duration-300"
                    style={{
                        top: box.top - 8,
                        left: box.left - 8,
                        width: box.width + 16,
                        height: box.height + 16,
                        borderRadius: 12,
                        boxShadow: '0 0 0 9999px rgba(15,12,12,0.82)',
                        zIndex: 60,
                    }}
                />
            ) : (
                <div
                    className="fixed inset-0 flex items-center justify-center px-4"
                    style={{ background: 'rgba(15,12,12,0.82)', zIndex: 55 }}
                >
                    <TourCard step={step} setStep={setStep} onClose={onClose} data={data} Icon={Icon} centered />
                </div>
            )}

            {isSpot && (
                <div className="fixed px-4" style={{ ...cardStyle, zIndex: 70, width: 320, maxWidth: 'calc(100vw - 32px)' }}>
                    <TourCard step={step} setStep={setStep} onClose={onClose} data={data} Icon={Icon} arrowStyle={arrowStyle} />
                </div>
            )}
        </>
    );
}

function TourCard({
    step,
    setStep,
    onClose,
    data,
    Icon,
    centered,
    arrowStyle,
}: {
    step: number;
    setStep: (n: number) => void;
    onClose: () => void;
    data: (typeof CHANGELOG_STEPS)[number];
    Icon: (typeof CHANGELOG_STEPS)[number]['icon'];
    centered?: boolean;
    arrowStyle?: CardPos | null;
}) {
    return (
        <div
            className={`relative rounded-2xl p-5 shadow-2xl ${centered ? 'w-full max-w-[340px] text-center' : ''}`}
            style={{ background: C.surface1, border: `1px solid ${C.border}` }}
        >
            {arrowStyle && (
                <div
                    className="absolute w-3 h-3"
                    style={{ background: C.surface1, borderLeft: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, transform: arrowStyle.transform || 'rotate(135deg)', ...arrowStyle }}
                />
            )}

            <button onClick={onClose} className="absolute top-3 right-3 p-0.5 rounded-full" style={{ color: C.label }}>
                <X size={16} />
            </button>

            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 ${centered ? 'mx-auto' : ''}`}
                style={{ background: C.surface2 }}
            >
                <Icon size={19} style={{ color: C.amber }} />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.amber }}>
                {data.eyebrow}
            </p>
            <h3 className="text-base font-bold mb-2" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                {data.title}
            </h3>
            <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: C.textSec }}>
                {data.text}
            </p>

            <div className={`flex flex-col gap-3 ${centered ? 'items-center' : ''}`}>
                <div className="flex gap-1.5 flex-wrap">
                    {CHANGELOG_STEPS.map((_, idx) => (
                        <span
                            key={idx}
                            className="block rounded-full transition-all"
                            style={{ width: idx === step ? 14 : 6, height: 6, background: idx === step ? C.red : C.border }}
                        />
                    ))}
                </div>
                <div className={`flex gap-2 w-full ${centered ? 'justify-center' : 'justify-end'}`}>
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-xs font-bold px-3 py-2 rounded-lg flex-shrink-0"
                            style={{ color: C.textMuted }}
                        >
                            Atrás
                        </button>
                    )}
                    <button
                        onClick={() => (data.last ? onClose() : setStep(step + 1))}
                        className="text-xs font-bold px-3.5 py-2 rounded-lg flex-shrink-0"
                        style={{ background: C.red, color: '#fff' }}
                    >
                        {data.last ? 'Listo' : step === 0 ? 'Empezar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
