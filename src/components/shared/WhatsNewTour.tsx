import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import { Sparkles, X } from 'lucide-react';
import { C } from '../../styles/colors';
import { changelogApi } from '../../services/changelog';
import { CHANGELOG_STEPS } from '../../data/changelogSteps';

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
    const isDashboard = pathname === '/dashboard';

    const [checked, setChecked] = useState(false);
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [box, setBox] = useState<SpotBox | null>(null);

    useEffect(() => {
        if (!isDashboard) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        changelogApi.getStatus()
            .then(({ shouldShow }) => {
                if (shouldShow) {
                    // deja que el sidebar y el botón de WhatsApp terminen de montarse
                    setTimeout(() => { setStep(0); setOpen(true); }, 500);
                }
            })
            .catch(() => {})
            .finally(() => setChecked(true));
    }, [isDashboard]);

    const reposition = useCallback(() => {
        const current = CHANGELOG_STEPS[step];
        if (current.type === 'spot' && current.target) {
            setBox(measure(current.target));
        } else {
            setBox(null);
        }
    }, [step]);

    useEffect(() => {
        if (!open) return;
        reposition();
        window.addEventListener('resize', reposition);
        return () => window.removeEventListener('resize', reposition);
    }, [open, reposition]);

    const close = () => {
        setOpen(false);
        changelogApi.markSeen().catch(() => {});
    };

    if (!isDashboard) return null;

    return (
        <>
            {checked && (
                <button
                    onClick={() => { setStep(0); setOpen(true); }}
                    className="fixed z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-colors hover:opacity-90"
                    style={{
                        top: 'max(env(safe-area-inset-top), 16px)',
                        right: '20px',
                        background: C.surface2,
                        border: `1px solid ${C.border}`,
                        color: C.textSec,
                    }}
                >
                    <Sparkles size={14} style={{ color: C.amber }} />
                    Ver novedades
                </button>
            )}

            {open && <TourOverlay step={step} setStep={setStep} box={box} onClose={close} />}
        </>
    );
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
                <div className="fixed px-4" style={{ ...cardStyle, zIndex: 70, width: 300, maxWidth: 'calc(100vw - 32px)' }}>
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
    const total = CHANGELOG_STEPS.length;

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

            <div className={`flex items-center gap-2.5 ${centered ? 'flex-col' : 'justify-between'}`}>
                <div className="flex gap-1.5">
                    {CHANGELOG_STEPS.map((_, idx) => (
                        <span
                            key={idx}
                            className="block rounded-full transition-all"
                            style={{ width: idx === step ? 14 : 6, height: 6, background: idx === step ? C.red : C.border }}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-xs font-bold px-3 py-2 rounded-lg"
                            style={{ color: C.textMuted }}
                        >
                            Atrás
                        </button>
                    )}
                    <button
                        onClick={() => (data.last ? onClose() : setStep(step + 1))}
                        className="text-xs font-bold px-3.5 py-2 rounded-lg"
                        style={{ background: C.red, color: '#fff' }}
                    >
                        {data.last ? 'Listo' : step === 0 ? 'Empezar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
