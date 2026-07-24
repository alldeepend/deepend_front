import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { C } from '../../styles/colors';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Optional: Validate token validity on mount (can also just rely on submit)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Contraseña actualizada correctamente. Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.error || 'Error al restablecer contraseña.');
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg }}>
                <div className="text-center p-8 rounded-xl shadow-lg" style={{ background: C.surface1 }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: C.red }}>Token Inválido</h2>
                    <p style={{ color: C.textMuted }}>El enlace de recuperación no es válido o falta el token.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4" style={{ background: C.bg }}>
            <div className="w-full max-w-md rounded-2xl shadow-xl p-8" style={{ background: C.surface1 }}>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: C.text }}>Restablecer Contraseña</h2>
                    <p style={{ color: C.textMuted }}>Ingresa tu nueva contraseña.</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-lg text-sm border" style={{ background: C.forest, borderColor: C.green, color: C.green }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-lg text-sm border" style={{ background: C.surface2, borderColor: C.red, color: C.red }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: C.textSec }}>
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: C.textSec }}>
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: C.red }}
                    >
                        {loading ? 'Restableciendo...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
