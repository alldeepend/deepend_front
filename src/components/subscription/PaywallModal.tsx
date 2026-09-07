import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, CheckCircle2, XCircle, Loader2, ChevronLeft, Check } from 'lucide-react';
import { C } from '../../styles/colors';
import { useAuth } from '../../store/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BOLD_LIBRARY_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

// Orígenes que mandan el postMessage de cierre del checkout embebido —
// copiados del propio script de Bold, que escucha lo mismo para cerrar su iframe.
const BOLD_MESSAGE_ORIGINS = [
    'https://stg.checkout.bold.co',
    'https://qa.checkout.bold.co',
    'https://checkout.bold.co',
    window.location.origin,
];

type PlanId = 'quarterly' | 'semiannual';

const PLANS: { id: PlanId; label: string; price: string; period: string; monthly: string; badge?: string; savings?: string }[] = [
    { id: 'quarterly', label: 'Trimestral', price: '$21.99', period: 'cada 3 meses', monthly: '$7.33 USD/mes' },
    {
        id: 'semiannual', label: 'Semestral', price: '$41.99', period: 'cada 6 meses', monthly: '$7.00 USD/mes',
        badge: 'Mejor valor', savings: 'Ahorras $1.99 vs. dos trimestres',
    },
];

const BENEFITS = [
    'Mundos y estaciones sin límite',
    'Reto semanal sin restricciones',
    'Tu progreso guardado para siempre',
];

declare global {
    interface Window {
        BoldCheckout?: new (config: Record<string, string>) => { open: () => void };
    }
}

interface CheckoutData {
    orderId: string;
    amount: string;
    currency: string;
    apiKey: string;
    signature: string;
    description: string;
    redirectionUrl: string;
}

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

type Phase = 'idle' | 'checking' | 'paid' | 'failed';

// Carga el script de la librería de Bold una sola vez, sin importar cuántas
// veces se abra el modal.
let boldLibraryPromise: Promise<void> | null = null;
function loadBoldLibrary(): Promise<void> {
    if (!boldLibraryPromise) {
        boldLibraryPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = BOLD_LIBRARY_URL;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('No se pudo cargar el checkout de Bold'));
            document.body.appendChild(script);
        });
    }
    return boldLibraryPromise;
}

export default function PaywallModal({
    isOpen,
    onClose,
    title = 'Sigue con tu ritmo',
    description = 'Con Premium completas mundos, avanzas tu reto semanal sin límites y guardas todo tu progreso.',
}: PaywallModalProps) {
    const { setUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
    const [checkout, setCheckout] = useState<CheckoutData | null>(null);
    const [libraryReady, setLibraryReady] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');

    // Al abrir el modal, siempre arranca en el selector de plan.
    useEffect(() => {
        if (isOpen) {
            setSelectedPlan(null);
            setCheckout(null);
            setPhase('idle');
            setError('');
        }
    }, [isOpen]);

    // Pide la orden al backend en cuanto se elige un plan.
    useEffect(() => {
        if (!isOpen || !selectedPlan) return;

        let cancelled = false;
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');
        fetch(`${API_URL}/v2/subscription/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ plan: selectedPlan }),
        })
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                if (!data.orderId) throw new Error(data.error || 'No se pudo iniciar el pago');
                setCheckout(data);
            })
            .catch(err => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));

        return () => { cancelled = true; };
    }, [isOpen, selectedPlan]);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        loadBoldLibrary()
            .then(() => !cancelled && setLibraryReady(true))
            .catch(err => !cancelled && setError(err.message));
        return () => { cancelled = true; };
    }, [isOpen]);

    // El modo embebido no redirige al terminar — solo manda este mensaje.
    useEffect(() => {
        if (!isOpen || !checkout) return;

        function handleMessage(event: MessageEvent) {
            if (!BOLD_MESSAGE_ORIGINS.includes(event.origin)) return;
            if (event.data?.type !== 'BOLD_CHECKOUT_EVENT') return;
            verifyPayment();
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, checkout]);

    async function verifyPayment() {
        if (!checkout) return;
        setPhase('checking');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/v2/subscription/verify/${checkout.orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.status === 'paid') {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...storedUser, lifecycleStage: 'paid' };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setPhase('paid');
            } else if (data.status === 'failed') {
                setPhase('failed');
            } else {
                // Cerró el checkout sin terminar de pagar.
                setPhase('idle');
            }
        } catch {
            setPhase('idle');
        }
    }

    function handlePayClick() {
        if (!checkout || !window.BoldCheckout) return;
        const boldCheckout = new window.BoldCheckout({
            orderId: checkout.orderId,
            currency: checkout.currency,
            amount: checkout.amount,
            apiKey: checkout.apiKey,
            integritySignature: checkout.signature,
            description: checkout.description,
            redirectionUrl: checkout.redirectionUrl,
            renderMode: 'embedded',
        });
        boldCheckout.open();
    }

    if (!isOpen) return null;

    const activePlan = PLANS.find(p => p.id === selectedPlan);

    // Portal a <body>: un `transform` en HomePage rompe `position: fixed` para
    // cualquier cosa anidada adentro.
    return createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={phase === 'checking' ? undefined : onClose}
        >
            <div
                className="rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto"
                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                onClick={e => e.stopPropagation()}
            >
                {phase === 'paid' ? (
                    <div className="px-6 py-8 text-center">
                        <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: C.green }} />
                        <h3 className="text-lg font-bold mb-1" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                            Ya eres Premium
                        </h3>
                        <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                            Tu progreso queda desbloqueado. Puedes seguir exactamente donde ibas.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-bold text-sm"
                            style={{ background: C.red, color: '#fff' }}
                        >
                            Seguir en DeepEnd
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between px-6 pt-5 pb-1">
                            {selectedPlan ? (
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    disabled={phase === 'checking'}
                                    className="flex items-center gap-1 text-xs font-semibold disabled:opacity-40"
                                    style={{ color: C.textMuted }}
                                >
                                    <ChevronLeft size={14} /> Cambiar plan
                                </button>
                            ) : (
                                <div className="relative w-11 h-11 mb-2">
                                    <div
                                        className="absolute inset-[-10px] rounded-full blur-lg opacity-40"
                                        style={{ background: `radial-gradient(circle, ${C.amber}, transparent 70%)` }}
                                    />
                                    <div
                                        className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${C.amber}, ${C.red})` }}
                                    >
                                        <Sparkles size={20} color={C.bg} />
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                aria-label="Cerrar"
                                disabled={phase === 'checking'}
                                className="p-1 rounded-lg transition-colors flex-shrink-0 disabled:opacity-40"
                                style={{ color: C.label }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 pb-6">
                            <h3
                                className="text-lg font-bold mb-1"
                                style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                            >
                                {selectedPlan ? `Plan ${activePlan?.label}` : title}
                            </h3>
                            <p className="text-sm leading-relaxed mb-4" style={{ color: C.textMuted }}>
                                {selectedPlan ? `Confirma tu pago para activar Premium ${activePlan?.period}.` : description}
                            </p>

                            {!selectedPlan ? (
                                <>
                                    <ul className="flex flex-col gap-2 mb-5">
                                        {BENEFITS.map(b => (
                                            <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: C.textSec }}>
                                                <span
                                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ background: `${C.green}26`, color: C.green }}
                                                >
                                                    <Check size={11} strokeWidth={3} />
                                                </span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-col gap-3 mb-2">
                                        {PLANS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedPlan(p.id)}
                                                className="relative flex items-center justify-between rounded-xl pl-4 pr-4 py-4 text-left transition-all hover:-translate-y-0.5"
                                                style={{
                                                    background: p.badge
                                                        ? `linear-gradient(180deg, ${C.surface2}, ${C.surface1})`
                                                        : C.surface2,
                                                    border: `1.5px solid ${p.badge ? C.amber : C.border}`,
                                                    boxShadow: p.badge ? `0 0 0 1px ${C.amber}33, 0 8px 20px -8px ${C.amber}4d` : 'none',
                                                }}
                                                onMouseEnter={e => !p.badge && (e.currentTarget.style.borderColor = C.red)}
                                                onMouseLeave={e => !p.badge && (e.currentTarget.style.borderColor = C.border)}
                                            >
                                                {p.badge && (
                                                    <span
                                                        className="absolute -top-2.5 left-4 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
                                                        style={{ background: C.amber, color: C.bg }}
                                                    >
                                                        {p.badge}
                                                    </span>
                                                )}
                                                <div>
                                                    <div className="text-sm font-bold" style={{ color: C.text }}>{p.label}</div>
                                                    <div className="text-xs" style={{ color: C.textMuted }}>{p.period}</div>
                                                    {p.savings && (
                                                        <div className="text-[11px] font-semibold mt-1" style={{ color: C.green }}>{p.savings}</div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className="text-xl font-bold leading-none"
                                                        style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                                                    >
                                                        {p.price}
                                                        <span className="text-[10px] font-medium ml-1" style={{ color: C.textMuted, fontFamily: 'inherit' }}>
                                                            USD
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] mt-1" style={{ color: C.label }}>{p.monthly}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {checkout && (
                                        <div
                                            className="text-center rounded-xl px-4 py-5 mb-4"
                                            style={{ background: C.surface2, border: `1px solid ${C.border}` }}
                                        >
                                            <span
                                                className="text-3xl font-bold tracking-tight"
                                                style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}
                                            >
                                                ${checkout.amount}
                                                <span className="text-sm font-medium ml-1.5" style={{ color: C.textMuted, fontFamily: 'inherit' }}>
                                                    {checkout.currency}
                                                </span>
                                            </span>
                                            <div className="text-xs mt-1" style={{ color: C.label }}>{activePlan?.period}</div>
                                        </div>
                                    )}

                                    {phase === 'failed' && (
                                        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: C.red }}>
                                            <XCircle size={16} />
                                            No se pudo completar el pago. No se hizo ningún cobro — intenta de nuevo.
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-sm mb-3" style={{ color: C.red }}>{error}</p>
                                    )}

                                    <button
                                        onClick={handlePayClick}
                                        disabled={loading || !checkout || !libraryReady || phase === 'checking'}
                                        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        style={{ background: C.red, color: '#fff' }}
                                    >
                                        {phase === 'checking' ? (
                                            <><Loader2 size={16} className="animate-spin" /> Confirmando tu pago...</>
                                        ) : loading || !libraryReady ? (
                                            'Preparando tu pago...'
                                        ) : (
                                            'Pagar con Bold'
                                        )}
                                    </button>

                                    <p className="text-xs text-center mt-3" style={{ color: C.label }}>
                                        Pago seguro con <b style={{ color: C.textMuted }}>bold.co</b> — sin salir de DeepEnd
                                    </p>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
