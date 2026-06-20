import { useNavigate } from 'react-router'
import { ArrowRight, HeartHandshake, Activity, Users, Award, Quote } from 'lucide-react'
import InterestForm from '../InterestForm'

const C = {
  bg:        '#231F20',
  surface1:  '#1E1A1B',
  surface2:  '#252020',
  text:      '#F5F0E8',
  textMuted: '#A8A29E',
  red:       '#EE2A28',
  amber:     '#EF9F27',
  green:     '#52B788',
  border:    '#333330',
}

const heading = { fontFamily: "'American Typewriter', Georgia, serif", color: C.text }
const body = { fontFamily: 'Montserrat, sans-serif', color: C.textMuted }

const pillars = [
  {
    title: 'Reconocer',
    text: 'Identifica cómo te sientes realmente frente al dinero, tu cuerpo y tus hábitos.',
  },
  {
    title: 'Despertar',
    text: 'Gana conciencia y herramientas concretas para tomar mejores decisiones cada día.',
  },
  {
    title: 'Avanzar',
    text: 'Construye una mejor versión de ti, un mundo y una estación a la vez.',
  },
]

const benefits = [
  {
    icon: HeartHandshake,
    title: 'Entiende tu relación con el dinero',
    text: 'Antes de hablar de presupuestos, hablamos de emociones. Comprende qué hay detrás de tus decisiones financieras.',
  },
  {
    icon: Activity,
    title: 'Construye hábitos que se sostienen',
    text: 'Retos pensados para tu vida real, con metas pequeñas que sí puedes cumplir semana a semana.',
  },
  {
    icon: Users,
    title: 'Avanza acompañado, no solo',
    text: 'Recursos, aliados y una comunidad pensada para que nunca tengas que resolverlo todo por tu cuenta.',
  },
  {
    icon: Award,
    title: 'Celebra cada paso del camino',
    text: 'Suma XP, desbloquea insignias y mira tu progreso reflejado en cada mundo que completas.',
  },
]

const testimonials = [
  {
    name: 'Daniela',
    role: 'Usuaria DeepEnd',
    text: 'Por primera vez entendí por qué evitaba ver mis finanzas. Ahora cada mes se siente menos pesado.',
  },
  {
    name: 'Carlos',
    role: 'Usuario DeepEnd',
    text: 'Los retos me ayudaron a crear una rutina que sí pude mantener, sin sentirme abrumado.',
  },
  {
    name: 'Valentina',
    role: 'Usuaria DeepEnd',
    text: 'Es como tener un espacio seguro para hablar de dinero y de mí misma, sin juzgarme.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  const scrollToForm = () => {
    document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div style={{ background: C.bg, ...body }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur border-b"
        style={{ background: C.bg + 'e6', borderColor: C.border }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <img src="/pwa-512x512.png" alt="DeepEnd" className="w-9 h-9 rounded-full" />
          <button
            onClick={() => navigate('/login')}
            className="cursor-pointer text-sm font-bold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
            style={{ background: C.green, color: C.bg }}
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* Hero: título persuasivo + propuesta de valor */}
      <section className="relative overflow-hidden">
        <img src="/image-hero.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${C.bg} 5%, ${C.bg}cc 45%, ${C.bg}66 100%)` }}
        />

        <div className="relative max-w-3xl mx-auto px-6 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight" style={heading}>
            Reconoce tu historia.<br />Transforma tu camino.
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: C.text + 'cc' }}>
            DeepEnd es tu acompañante para construir una mejor relación contigo mismo, con tu dinero y con tu cuerpo, un paso a la vez.
          </p>
          <button
            onClick={scrollToForm}
            className="cursor-pointer mt-10 inline-flex items-center gap-2 font-bold px-7 py-4 rounded-full transition-opacity hover:opacity-90"
            style={{ background: C.green, color: C.bg }}
          >
            Comienza tu viaje
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <img
            src="/image-about-section.webp"
            alt=""
            className="w-full h-64 sm:h-80 object-cover rounded-2xl"
          />
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold" style={heading}>
                Un viaje, no una lista de tareas
              </h2>
              <p className="mt-2" style={body}>
                Cada mundo dentro de DeepEnd te lleva por tres momentos, pensados para que el cambio se sienta posible.
              </p>
            </div>
            <div className="space-y-5">
              {pillars.map((p, i) => (
                <div key={p.title} className="flex gap-4">
                  <div
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold border"
                    style={{ background: C.surface2, borderColor: C.border, color: C.green, fontFamily: "'American Typewriter', Georgia, serif" }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: C.text }}>{p.title}</h3>
                    <p className="text-sm mt-0.5" style={body}>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 sm:py-24" style={{ background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center" style={heading}>
            Lo que vas a ganar
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {benefits.map(b => (
              <div
                key={b.title}
                className="rounded-2xl p-6 border"
                style={{ background: C.surface2, borderColor: C.border }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.green + '1a' }}>
                  <b.icon size={22} style={{ color: C.green }} />
                </div>
                <h3 className="font-bold mt-4" style={{ color: C.text }}>{b.title}</h3>
                <p className="text-sm mt-1.5 leading-relaxed" style={body}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Imagen ilustrativa / reto */}
      <section className="relative">
        <img src="/Reto Desde Aquí.png" alt="Reto Desde Aquí - Por ti" className="w-full h-72 sm:h-96 object-cover" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6" style={{ background: C.bg + '66' }}>
          <p className="text-2xl sm:text-4xl font-bold max-w-2xl" style={heading}>
            El cambio empieza desde aquí, por ti.
          </p>
        </div>
      </section>

      {/* Prueba social */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center" style={heading}>
          Lo que dice nuestra comunidad
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-2xl p-6 border" style={{ background: C.surface1, borderColor: C.border }}>
              <Quote size={20} style={{ color: C.green }} />
              <p className="text-sm mt-3 leading-relaxed" style={{ color: C.text + 'd9' }}>"{t.text}"</p>
              <p className="text-sm font-bold mt-4" style={{ color: C.text }}>{t.name}</p>
              <p className="text-xs" style={body}>{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulario de interés / CTA final */}
      <section id="interest-form" className="py-16 sm:py-24 px-6" style={{ background: C.surface1 }}>
        <div className="max-w-md mx-auto">
          <InterestForm />
        </div>
      </section>

      <footer className="py-8 text-center">
        <img src="/pwa-512x512.png" alt="DeepEnd" className="w-8 h-8 rounded-full mx-auto" />
        <p className="text-xs mt-3" style={body}>© {new Date().getFullYear()} DeepEnd</p>
      </footer>
    </div>
  )
}
