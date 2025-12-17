import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../store/useAuth';

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
      navigate('/dashboard');
      setLoading(false);
    } else {
      setError('Correo o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-white flex items-center justify-center p-6 font-montserrat">
      <div className="bg-white p-6 md:p-8 rounded-2xl w-full shadow-xs max-w-md border border-stone-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-stone-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn size={24} className="text-stone-400" />
          </div>
          <h2 className="font-american text-3xl text-stone-800 font-bold">Bienvenido de nuevo</h2>
          <p className="text-stone-500 text-base mt-2">Continúa tu historia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="email" className="block text-stone-700 text-sm font-medium mb-2">Correo electrónico:</label>
            <input
              type="email"
              placeholder="tucorreo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-stone-700 text-sm font-medium my-2">Contraseña:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent pr-12 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 cursor-pointer -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>


          {error && <p className="text-accent-red text-sm text-center">{error}</p>}

          <button type="submit" className="w-full mt-8 cursor-pointer bg-accent-green text-white py-4 rounded-xl font-bold hover:brightness-110 transition-colors flex items-center justify-center font-montserrat tracking-wide">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Continuar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/setup" className="text-sm text-stone-500 hover:text-stone-800 underline">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}