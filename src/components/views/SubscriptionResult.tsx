import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { C } from '../../styles/colors';
import { useAuth } from '../../store/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 1500;

type Status = 'checking' | 'paid' | 'failed' | 'timeout';

export default function SubscriptionResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [status, setStatus] = useState<Status>('checking');

    useEffect(() => {
        const orderId = searchParams.get('bold-order-id');
        if (!orderId) {
            setStatus('failed');
            return;
        }

        let cancelled = false;
        const token = localStorage.getItem('token');

        async function poll(attempt: number): Promise<void> {
            try {
                const res = await fetch(`${API_URL}/v2/subscription/verify/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (cancelled) return;

                if (data.status === 'paid') {
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = { ...storedUser, lifecycleStage: 'paid' };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    setStatus('paid');
                    return;
                }

                if (data.status === 'failed') {
                    setStatus('failed');
                    return;
                }

                if (attempt < POLL_ATTEMPTS) {
                    setTimeout(() => poll(attempt + 1), POLL_DELAY_MS);
                } else {
                    setStatus('timeout');
                }
            } catch {
                if (!cancelled) setStatus('failed');
            }
        }

        poll(0);
        return () => { cancelled = true; };
    }, [searchParams, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
            <div
                className="w-full max-w-sm rounded-2xl p-8 text-center"
                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
            >
                {status === 'checking' && (
                    <>
                        <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: C.textMuted }} />
                        <h2 className="text-lg font-bold mb-1" style={{ color: C.text }}>Confirmando tu pago</h2>
                        <p className="text-sm" style={{ color: C.textMuted }}>Esto toma solo un momento...</p>
                    </>
                )}

                {status === 'paid' && (
                    <>
                        <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: C.green }} />
                        <h2 className="text-lg font-bold mb-1" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                            Ya eres Premium
                        </h2>
                        <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                            Tu progreso queda desbloqueado. Puedes seguir exactamente donde ibas.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 rounded-xl font-bold text-sm"
                            style={{ background: C.red, color: '#fff' }}
                        >
                            Seguir en DeepEnd
                        </button>
                    </>
                )}

                {(status === 'failed' || status === 'timeout') && (
                    <>
                        <XCircle size={44} className="mx-auto mb-4" style={{ color: C.red }} />
                        <h2 className="text-lg font-bold mb-1" style={{ color: C.text }}>
                            {status === 'timeout' ? 'Seguimos confirmando' : 'El pago no se completó'}
                        </h2>
                        <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                            {status === 'timeout'
                                ? 'Puede tardar un poco más en confirmarse. Revisa de nuevo en unos minutos.'
                                : 'No te preocupes, no se realizó ningún cobro. Puedes intentarlo de nuevo.'}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 rounded-xl font-bold text-sm"
                            style={{ background: C.surface3, color: C.textSec }}
                        >
                            Volver a DeepEnd
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
