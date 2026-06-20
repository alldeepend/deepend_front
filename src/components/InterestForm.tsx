import React, { useState } from 'react';
import { Send } from 'lucide-react';

const C = {
  bg:        '#231F20',
  surface1:  '#1E1A1B',
  surface2:  '#252020',
  text:      '#F5F0E8',
  textMuted: '#A8A29E',
  green:     '#52B788',
  border:    '#333330',
}

export default function InterestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [improve, setImprove] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: conectar a un endpoint cuando se defina dónde se va a guardar el interés
    setSubmitted(true);
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
            placeholder="tucorreo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-4 border outline-none transition-all focus:ring-2"
            style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: C.textMuted }}>
            Teléfono:
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="300 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            className="w-full rounded-xl px-4 py-3 border outline-none transition-all focus:ring-2 resize-none"
            style={{ background: C.surface2, borderColor: C.border, color: C.text, ['--tw-ring-color' as any]: C.green }}
          />
        </div>

        <button
          type="submit"
          className="w-full mt-8 cursor-pointer py-4 rounded-full font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 tracking-wide"
          style={{ background: C.green, color: C.bg }}
        >
          Quiero unirme
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
