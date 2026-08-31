import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { C } from '../../styles/colors';
import { useAuth } from '../../store/useAuth';

type Status = 'verifying' | 'success' | 'error';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error');
    const [errorMessage, setErrorMessage] = useState(
        user
            ? 'Verifica tu correo para continuar. Revisa tu bandeja de entrada o solicita un nuevo enlace.'
            : 'El enlace de verificación no es válido o falta el token.'
    );
    const [resendEmail, setResendEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const attempted = useRef(false);

    useEffect(() => {
        if (!token || attempted.current) return;
        attempted.current = true;

        const verify = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (!response.ok) {
                    setErrorMessage(data.error || 'El enlace de verificación es inválido o expiró.');
                    setStatus('error');
                    return;
                }

                localStorage.setItem('token', data.token);

                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const updatedUser = { ...JSON.parse(storedUser), emailVerified: true };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }

                setStatus('success');
                setTimeout(() => navigate(storedUser ? '/dashboard' : '/login'), 2000);
            } catch (err) {
                setErrorMessage('Error de conexión. Intenta de nuevo.');
                setStatus('error');
            }
        };

        verify();
    }, [token, navigate, setUser]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = user?.email || resendEmail;
        if (!email) return;

        setResendLoading(true);
        setResendMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            setResendMessage(response.ok ? (data.message || 'Correo reenviado.') : (data.error || 'No se pudo reenviar el correo.'));
        } catch (err) {
            setResendMessage('Error de conexión. Intenta de nuevo.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4" style={{ background: C.bg }}>
            <div className="w-full max-w-md rounded-2xl shadow-xl p-8 text-center" style={{ background: C.surface1 }}>
                {status === 'verifying' && (
                    <>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Verificando tu correo...</h2>
                        <p style={{ color: C.textMuted }}>Esto solo toma un momento.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: C.green }}>¡Correo verificado!</h2>
                        <p style={{ color: C.textMuted }}>Tu cuenta ya está activa. Redirigiendo...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: C.red }}>
                            {token ? 'No pudimos verificar tu correo' : 'Falta verificar tu correo'}
                        </h2>
                        <p className="mb-6" style={{ color: C.textMuted }}>{errorMessage}</p>

                        <form onSubmit={handleResend} className="space-y-4 text-left">
                            {!user?.email && (
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: C.textSec }}>
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none"
                                        placeholder="tu@email.com"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                    />
                                </div>
                            )}

                            {resendMessage && (
                                <div className="p-3 rounded-lg text-sm border" style={{ background: C.surface2, borderColor: C.border, color: C.textSec }}>
                                    {resendMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={resendLoading}
                                className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: C.red }}
                            >
                                {resendLoading ? 'Enviando...' : 'Reenviar correo de verificación'}
                            </button>
                        </form>

                        <div className="mt-6">
                            <Link to="/login" className="font-medium text-sm hover:opacity-80 transition-opacity" style={{ color: C.red }}>
                                Volver a Iniciar Sesión
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
