import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { C } from '../styles/colors'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function InterestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [improve, setImprove] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: improve || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al enviar tus datos');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar tus datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="p-6 md:p-8 rounded-2xl w-full max-w-md border text-center"
        style={{ background: C.surface1, borderColor: C.border, fontFamily: 'Montserrat, sans-serif' }}
      >
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
        >
          ¡Gracias, {name.split(' ')[0] || 'amigo'}!
        </h2>
        <p className="text-sm mt-3" style={{ color: C.textMuted }}>
          Ya recibimos tus datos. Muy pronto alguien de DeepEnd se pondrá en contacto contigo para que comiences tu viaje.
        </p>
      </div>
    );
  }

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
          ¿Quieres ser parte?
        </h2>
        <p className="text-base mt-2" style={{ color: C.textMuted }}>
          Déjanos tus datos y te contactamos para comenzar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: C.textMuted }}>
            Nombre completo:
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-4 border outline-none transition-all focus:ring-2"
            style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: C.textMuted }}>
            Correo electrónico:
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-4 border outline-none transition-all focus:ring-2"
            style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
            required
          />
        </div>

        <div>
          <label htmlFor="improve" className="block text-sm font-medium mb-2" style={{ color: C.textMuted }}>
            ¿Qué te gustaría mejorar de ti mismo? <span style={{ color: C.textMuted }}>(opcional)</span>
          </label>
          <textarea
            id="improve"
            placeholder="Cuéntanos qué te trae a DeepEnd..."
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl px-4 py-3 border outline-none transition-all focus:ring-2 resize-none"
            style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
          />
          <p className="text-xs text-right mt-1" style={{ color: C.textMuted }}>{improve.length}/500</p>
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: '#E85D5D' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 cursor-pointer py-4 rounded-full font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: C.green, color: C.bg }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Quiero unirme <Send size={18} /></>}
        </button>
      </form>
    </div>
  );
}
