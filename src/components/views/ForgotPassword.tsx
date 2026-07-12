import { useState } from 'react';
import { Link } from 'react-router';
import { C } from '../../styles/colors';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'If an account exists, a recovery email has been sent.');
            } else {
                setError(data.error || 'Failed to send recovery email.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4" style={{ background: C.bg }}>
            <div className="w-full max-w-md rounded-2xl shadow-xl p-8" style={{ background: C.surface1 }}>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: C.text }}>Recuperar Contraseña</h2>
                    <p style={{ color: C.textMuted }}>Ingresa tu correo para recibir un enlace de recuperación.</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-lg text-sm border" style={{ background: C.forest, borderColor: C.border, color: C.green }}>
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
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: C.textMuted }}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: C.red }}
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="font-medium text-sm hover:opacity-80 transition-opacity" style={{ color: C.red }}>
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
