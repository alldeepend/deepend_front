import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../store/useAuth';
import { C } from '../styles/colors'

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      // Track login event
      try {
        const token = localStorage.getItem('token');
        const envUrl = import.meta.env.VITE_API_URL;
        const API_URL = (envUrl && typeof envUrl === 'string') ? envUrl.replace(/\/$/, '') : 'http://localhost:3000/api';

        await fetch(`${API_URL}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'LOGIN',
            path: '/login'
          })
        });
      } catch (err) {
        console.error("Failed to track login:", err);
      }

      navigate('/dashboard');
      setLoading(false);
    } else {
      setError('Correo o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 md:p-8 rounded-2xl w-full max-w-md border"
      style={{ background: C.surface1, borderColor: C.border, fontFamily: 'Montserrat, sans-serif' }}
    >
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
        >
          Bienvenido de nuevo
        </h2>
        <p className="text-base mt-2" style={{ color: C.textMuted }}>Continúa tu viaje</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: C.textMuted }}>
            Correo electrónico:
          </label>
          <input
            type="email"
            placeholder="tucorreo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-4 border outline-none transition-all focus:ring-2"
            style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium my-2" style={{ color: C.textMuted }}>
            Contraseña:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-4 pr-12 border outline-none transition-all focus:ring-2"
              style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 cursor-pointer -translate-y-1/2 focus:outline-none"
              style={{ color: C.textMuted }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: C.textMuted }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-center" style={{ color: C.red }}>{error}</p>}

        <button
          type="submit"
          className="w-full mt-8 cursor-pointer py-4 rounded-full font-bold transition-opacity hover:opacity-90 flex items-center justify-center tracking-wide"
          style={{ background: C.green, color: C.bg }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Continuar'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/register" className="text-sm hover:underline" style={{ color: C.textMuted }}>
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
}