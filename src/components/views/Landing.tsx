import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, HeartHandshake, Activity, Award, Quote, Fingerprint, Flame, Play, Pause } from 'lucide-react'
import InterestForm from '../InterestForm'
import ArchetypeTest from './ArchetypeTest'
import { C } from '../../styles/colors'

const heading = { fontFamily: "'American Typewriter', Georgia, serif", color: C.text }
const body = { fontFamily: 'Montserrat, sans-serif', color: C.textMuted }

const pillars = [
  {
    title: 'Reconocer',
    text: 'Identifica cómo te sientes realmente frente al dinero, tu cuerpo y tus hábitos.',
    detail: 'Antes de cualquier cambio, hay que ver con claridad. Aquí no juzgamos patrones — los nombramos. Un diagnóstico honesto de dónde estás hoy con el dinero, el cuerpo y los hábitos que sostienes en piloto automático.',
  },
  {
    title: 'Despertar',
    text: 'Gana conciencia y herramientas concretas para tomar mejores decisiones cada día.',
    detail: 'La conciencia sin herramientas se queda en intención. Por eso cada insight viene acompañado de una acción concreta — algo que puedas hacer esta semana, no solo entender.',
  },
  {
    title: 'Conectar',
    text: 'Avanza acompañado. La comunidad DeepEnd está ahí para que el camino no lo recorras solo.',
    detail: 'El cambio en soledad se apaga rápido. La comunidad DeepEnd está para sostenerte cuando la motivación baja, celebrar contigo los avances y recordarte que no eres el único recorriendo este camino.',
  },
  {
    title: 'Avanzar',
    text: 'Construye una mejor versión de ti, un mundo y una estación a la vez.',
    detail: 'Cada mundo que completas es evidencia de que el cambio es posible. Vas construyendo, estación a estación, la versión de ti que quieres sostener — no de un salto, sino de pasos que sí puedes dar.',
  },
  {
    title: 'Sostener',
    text: 'Construye una consistencia que dure. No un sprint de motivación, sino un nuevo punto de partida.',
    detail: 'Lo difícil no es empezar, es que dure. Aquí no buscamos un sprint de motivación que se apaga en enero — buscamos que esto se convierta en tu nuevo punto de partida, algo que sigue después de que la novedad se acaba.',
  },
]

const benefits = [
  // ── Row 1 ──────────────────────────────────────────────
  {
    icon: HeartHandshake,
    title: 'Entiende tu relación con el dinero',
    text: 'Antes de hablar de presupuestos, hablamos de emociones. Comprende qué hay detrás de tus decisiones financieras.',
    detail: 'La mayoría de los problemas con el dinero no son de matemáticas — son de emociones. Exploramos el miedo a ver el saldo, el gasto impulsivo, la culpa después de comprar. Antes de cambiar números, cambiamos la relación.',
    color: '#E8C547',
  },
  {
    icon: Activity,
    title: 'Construye hábitos que se sostienen',
    text: 'Retos pensados para tu vida real, con metas pequeñas que sí puedes cumplir semana a semana.',
    detail: 'No pedimos grandes saltos. Cada reto está diseñado para encajar en tu rutina sin sacrificio. La consistencia construye el cambio real.',
    color: '#52B788',
  },
  // ── Row 2 ──────────────────────────────────────────────
  {
    icon: Fingerprint,
    title: 'Conoce tu patrón',
    text: 'Antes de cambiar, necesitas ver. Descubre qué arquetipo guía tus decisiones.',
    detail: 'Tu patrón no es un defecto — es información. El test del espejo revela cómo te relacionas realmente con el dinero, para que trabajes con ello, no contra ello.',
    color: '#3FC6D8',
  },
  {
    icon: Flame,
    title: 'El cuerpo también habla',
    text: 'Las finanzas, el descanso y el movimiento están conectados. Aquí trabajamos los tres.',
    detail: 'El estrés financiero se siente en el cuerpo. Los malos hábitos físicos afectan las decisiones económicas. En DeepEnd no separamos lo de adentro de lo de afuera.',
    color: '#F4669B',
  },
  {
    icon: Award,
    title: 'Celebra cada paso',
    text: 'Suma XP, desbloquea insignias y mira tu progreso en cada mundo que completas.',
    detail: 'El progreso que no se ve, se olvida. Cada acción suma XP, cada hábito sostenido desbloquea una insignia. El cambio merece ser celebrado.',
    color: '#B57BEE',
  },
]

// Layout por card: columnas, radios, padding e iconos variados para asimetría
const BENEFIT_LAYOUTS = [
  { col: 'sm:col-span-2', r: 'rounded-3xl', p: 'p-8',      iWH: 'w-12 h-12', iR: 'rounded-2xl',  iSz: 24, featured: true,  hz: false },
  { col: 'sm:col-span-1', r: 'rounded-xl',  p: 'p-6',      iWH: 'w-9 h-9',   iR: 'rounded-xl',   iSz: 18, featured: false, hz: false },
  { col: 'sm:col-span-1', r: 'rounded-2xl', p: 'p-5',      iWH: 'w-10 h-10', iR: 'rounded-2xl',  iSz: 20, featured: false, hz: false },
  { col: 'sm:col-span-1', r: 'rounded-xl',  p: 'p-6 pb-8', iWH: 'w-11 h-11', iR: 'rounded-full', iSz: 22, featured: false, hz: false },
  { col: 'sm:col-span-1', r: 'rounded-2xl', p: 'p-7',      iWH: 'w-9 h-9',   iR: 'rounded-lg',   iSz: 16, featured: false, hz: false },
]

const testimonials = [
  {
    name: 'Daniela',
    role: 'Usuaria DeepEnd',
    text: 'Por primera vez entendí por qué evitaba ver mis finanzas. Ahora cada mes se siente menos pesado.',
    img: '/fin-estacion-observador.png',
    audio: '/audio/daniela.mp3',     // reemplazar con audio real
    color: '#52B788',
  },
  {
    name: 'Carlos',
    role: 'Usuario DeepEnd',
    text: 'Los retos me ayudaron a crear una rutina que sí pude mantener, sin sentirme abrumado.',
    img: '/fin-estacion-observador.png',
    audio: '/audio/carlos.mp3',
    color: '#3FC6D8',
  },
  {
    name: 'Valentina',
    role: 'Usuaria DeepEnd',
    text: 'Es como tener un espacio seguro para hablar de dinero y de mí misma, sin juzgarme.',
    img: '/fin-estacion-observador.png',
    audio: '/audio/valentina.mp3',
    color: '#B57BEE',
  },
]

function AudioPlayer({ src, color }: { src: string; color: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play().catch(() => {}); setPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current
    if (!a || !a.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const pct  = duration ? (current / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: color + '30' }}>
      <audio
        ref={ref}
        src={src}
        onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setCurrent(0) }}
      />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
        style={{ background: color + '25' }}
      >
        {playing
          ? <Pause size={13} style={{ color }} />
          : <Play  size={13} style={{ color, marginLeft: 1 }} />
        }
      </button>
      <div
        className="flex-1 h-1 rounded-full cursor-pointer relative"
        style={{ background: color + '25' }}
        onClick={seek}
      >
        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: '#6B6460' }}>
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null)
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null)
  const [testOpen, setTestOpen] = useState(false)

  const scrollToForm = () => {
    document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    if (testOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [testOpen])

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
        <img src="/Final Mundo El Despertar.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
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
            style={{ background: C.red, color: '#fff' }}
          >
            Comienza tu viaje
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Propuesta de valor — Ruta metro */}
      <section className="py-16 sm:py-28 overflow-hidden" style={{ background: C.bg }}>

        {/* Encabezado */}
        <div className="max-w-5xl mx-auto px-6 text-center mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold" style={heading}>
            Un viaje, no una lista de tareas
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm" style={body}>
            Cinco pilares que se recorren uno a la vez, a tu ritmo.
          </p>
        </div>

        {/* Desktop: mapa de metro */}
        <div className="hidden md:block px-6">
          {/* padding-bottom mantiene la relación de aspecto 1200:520 del viewBox */}
          <div className="relative w-full" style={{ paddingBottom: '43.33%' }}>
          <div className="absolute inset-0">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 520"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Ruta principal — rectilinear con esquinas Q redondeadas
                  N1(60,360) →R→ ↑ →R→ N2(300,150) →R→ ↓ →R→ N3(560,270) →R→ ↑ →R→ N4(840,150) →R→ ↓ →R→ N5(1140,290) */}
              <path
                d="
                  M 60,360
                  L 115,360 Q 148,360 148,327
                  L 148,183 Q 148,150 181,150
                  L 300,150
                  L 390,150 Q 423,150 423,183
                  L 423,237 Q 423,270 456,270
                  L 560,270
                  L 655,270 Q 688,270 688,237
                  L 688,183 Q 688,150 721,150
                  L 840,150
                  L 935,150 Q 968,150 968,183
                  L 968,257 Q 968,290 1001,290
                  L 1140,290
                "
                stroke={C.red}
                strokeWidth="3.5"
                strokeDasharray="12 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.9"
              />

              {/* ── Ramales en 4 zonas separadas, forma L con sub-ramas ── */}

              {/* ZONA IZQUIERDA — desde seg. vertical N1→N2 (x=148, y=260) */}
              {/* Ramal: izquierda → luego T arriba/abajo */}
              <path d="M 148,260 L 22,260 L 22,415"
                stroke={C.red} strokeWidth="2.5" strokeDasharray="9 5"
                strokeOpacity="0.42" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 22,260 L 22,118"
                stroke={C.red} strokeWidth="2" strokeDasharray="8 5"
                strokeOpacity="0.28" strokeLinecap="round"/>
              <circle cx="22" cy="415" r="6" fill="none" stroke={C.red} strokeWidth="2" strokeOpacity="0.42"/>
              <circle cx="22" cy="118" r="5" fill="none" stroke={C.red} strokeWidth="1.8" strokeOpacity="0.28"/>

              {/* ZONA CENTRO — desde seg. horizontal aprox. N3 (y=270, x=508) */}
              {/* Ramal: arriba → T izquierda/derecha */}
              <path d="M 508,270 L 508,130 L 660,130"
                stroke={C.red} strokeWidth="2.5" strokeDasharray="9 5"
                strokeOpacity="0.42" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 508,130 L 395,130"
                stroke={C.red} strokeWidth="2" strokeDasharray="8 5"
                strokeOpacity="0.28" strokeLinecap="round"/>
              <circle cx="660" cy="130" r="6" fill="none" stroke={C.red} strokeWidth="2" strokeOpacity="0.42"/>
              <circle cx="395" cy="130" r="5" fill="none" stroke={C.red} strokeWidth="1.8" strokeOpacity="0.28"/>

              {/* ZONA CENTRO-DERECHA — desde seg. horizontal exit N4 (y=150, x=900) */}
              {/* Ramal: abajo → T izquierda + sub abajo */}
              <path d="M 900,150 L 900,330 L 742,330"
                stroke={C.red} strokeWidth="2.5" strokeDasharray="9 5"
                strokeOpacity="0.42" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 900,330 L 900,448"
                stroke={C.red} strokeWidth="2" strokeDasharray="8 5"
                strokeOpacity="0.28" strokeLinecap="round"/>
              <circle cx="742" cy="330" r="6" fill="none" stroke={C.red} strokeWidth="2" strokeOpacity="0.42"/>
              <circle cx="900" cy="448" r="5" fill="none" stroke={C.red} strokeWidth="1.8" strokeOpacity="0.28"/>

              {/* ZONA DERECHA — desde seg. horizontal N5 approach (y=290, x=1070) */}
              {/* Ramal: izquierda → arriba → derecha, + sub arriba */}
              <path d="M 1070,290 L 1002,290 L 1002,172 L 1130,172"
                stroke={C.red} strokeWidth="2.5" strokeDasharray="9 5"
                strokeOpacity="0.42" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 1002,172 L 1002,52"
                stroke={C.red} strokeWidth="2" strokeDasharray="8 5"
                strokeOpacity="0.28" strokeLinecap="round"/>
              <circle cx="1130" cy="172" r="6" fill="none" stroke={C.red} strokeWidth="2" strokeOpacity="0.42"/>
              <circle cx="1002" cy="52" r="5" fill="none" stroke={C.red} strokeWidth="1.8" strokeOpacity="0.28"/>
            </svg>

            {/* Estaciones */}
            {pillars.map((p, i) => {
              const nodes = [
                { x: '5%',    y: '69.23%', above: false },
                { x: '25%',   y: '28.85%', above: true  },
                { x: '46.7%', y: '51.92%', above: false },
                { x: '70%',   y: '28.85%', above: true  },
                { x: '95%',   y: '55.77%', above: false },
              ]
              const { x, y, above } = nodes[i]
              const isLast = i === 4
              const labelShift = isLast
                ? 'translateX(calc(-100% - 4px))'
                : 'translateX(-10px)'
              const isHovered = hoveredPillar === i

              return (
                <div
                  key={p.title}
                  className="absolute"
                  style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: isHovered ? 20 : 10 }}
                  onMouseEnter={() => setHoveredPillar(i)}
                  onMouseLeave={() => setHoveredPillar(null)}
                >
                  <div
                    className="w-[26px] h-[26px] rounded-full border-[3px] flex items-center justify-center"
                    style={{
                      background: C.bg,
                      borderColor: C.green,
                      boxShadow: `0 0 0 6px ${C.green}20`,
                    }}
                  >
                    <span className="text-[10px] font-bold leading-none" style={{ color: C.green }}>
                      {i + 1}
                    </span>
                  </div>
                  <div
                    className="absolute rounded-xl border p-3 cursor-default"
                    style={{
                      width: 168,
                      textAlign: 'left',
                      left: '50%',
                      transform: labelShift,
                      background: isHovered ? `${C.green}12` : C.surface1,
                      borderColor: isHovered ? `${C.green}60` : `${C.red}30`,
                      transition: 'background 0.3s ease, border-color 0.3s ease',
                      ...(above
                        ? { bottom: 'calc(100% + 20px)' }
                        : { top: 'calc(100% + 20px)' }),
                    }}
                  >
                    <p className="font-bold text-sm leading-tight" style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}>
                      {p.title}
                    </p>
                    <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: C.textMuted }}>
                      {p.text}
                    </p>
                    <div
                      className="overflow-hidden"
                      style={{
                        maxHeight: isHovered ? '160px' : '0px',
                        opacity: isHovered ? 1 : 0,
                        transition: 'max-height 0.35s ease, opacity 0.3s ease',
                      }}
                    >
                      <p
                        className="text-[11px] leading-relaxed mt-2.5 pt-2.5 border-t"
                        style={{ borderColor: `${C.green}30`, color: C.textMuted }}
                      >
                        {p.detail}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        </div>

        {/* Mobile: ruta vertical tipo metro */}
        <div className="md:hidden max-w-lg mx-auto px-6 flex flex-col">
          {pillars.map((p, i) => {
            const isHovered = hoveredPillar === i
            return (
              <div
                key={p.title}
                className="flex gap-5 cursor-default"
                onMouseEnter={() => setHoveredPillar(i)}
                onMouseLeave={() => setHoveredPillar(null)}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-5 h-5 rounded-full border-[3px] flex-shrink-0"
                    style={{
                      background: C.bg,
                      borderColor: C.green,
                      boxShadow: `0 0 0 4px ${C.green}20`,
                    }}
                  />
                  {i < pillars.length - 1 && (
                    <div className="flex-1" style={{ width: 3, minHeight: 56, background: C.red, borderRadius: 2, opacity: 0.65 }} />
                  )}
                </div>
                <div className="pb-8 pt-0">
                  <h3 className="font-bold text-base leading-tight" style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}>
                    {p.title}
                  </h3>
                  <p className="text-sm mt-1.5 leading-relaxed" style={body}>{p.text}</p>
                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight: isHovered ? '160px' : '0px',
                      opacity: isHovered ? 1 : 0,
                      transition: 'max-height 0.35s ease, opacity 0.3s ease',
                    }}
                  >
                    <p className="text-sm mt-2.5 pt-2.5 border-t leading-relaxed" style={{ borderColor: `${C.green}30`, color: C.textMuted }}>
                      {p.detail}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </section>

      {/* Beneficios */}
      <section className="py-16 sm:py-24" style={{ background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center" style={heading}>
            Lo que vas a ganar
          </h2>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {benefits.map((b, i) => {
              const lay = BENEFIT_LAYOUTS[i]
              const h = hoveredBenefit === i
              const isWide = lay.col === 'sm:col-span-2'
              const titleSize = lay.featured ? 'text-base sm:text-lg' : isWide ? 'text-base' : 'text-sm'
              const bodySize  = isWide ? 'text-sm' : 'text-xs'

              return (
                <div
                  key={b.title}
                  className={`${lay.col} ${lay.r} ${lay.p} ${lay.featured ? 'border-2' : 'border'} cursor-default`}
                  style={{
                    background: h
                      ? b.color + (lay.featured ? '16' : '12')
                      : lay.featured ? b.color + '09' : C.surface2,
                    borderColor: h
                      ? b.color + (lay.featured ? '90' : '50')
                      : lay.featured ? b.color + '55' : C.border,
                    transition: 'background 0.3s ease, border-color 0.3s ease',
                  }}
                  onMouseEnter={() => setHoveredBenefit(i)}
                  onMouseLeave={() => setHoveredBenefit(null)}
                >
                  {lay.hz ? (
                    /* Horizontal (last wide card) */
                    <div className="flex items-start gap-4">
                      <div className={`${lay.iWH} ${lay.iR} flex items-center justify-center flex-shrink-0 mt-0.5`} style={{ background: b.color + '1a' }}>
                        <b.icon size={lay.iSz} style={{ color: b.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold ${titleSize} leading-snug`} style={{ color: C.text }}>{b.title}</h3>
                        <p className={`${bodySize} mt-2 leading-relaxed`} style={body}>{b.text}</p>
                        <div className="overflow-hidden" style={{ maxHeight: h ? '140px' : '0px', opacity: h ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.3s ease' }}>
                          <p className={`${bodySize} mt-3 leading-relaxed pt-3 border-t`} style={{ borderColor: b.color + '30', color: C.textMuted }}>{b.detail}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Vertical (todos los demás) */
                    <>
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <div className={`${lay.iWH} ${lay.iR} flex items-center justify-center flex-shrink-0`} style={{ background: b.color + (lay.featured ? '22' : '1a') }}>
                          <b.icon size={lay.iSz} style={{ color: b.color }} />
                        </div>
                        {lay.featured && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: b.color + '20', color: b.color }}>
                            Pilar central
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold ${titleSize} leading-snug`} style={{ color: C.text }}>{b.title}</h3>
                      <p className={`${bodySize} mt-2 leading-relaxed`} style={body}>{b.text}</p>
                      <div className="overflow-hidden" style={{ maxHeight: h ? '140px' : '0px', opacity: h ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.3s ease' }}>
                        <p className={`${bodySize} mt-3 leading-relaxed pt-3 border-t`} style={{ borderColor: b.color + '30', color: C.textMuted }}>{b.detail}</p>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Test del Espejo — CTA para hacerlo sin salir de la landing */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-6" style={{ background: C.surface1 }}>
        {/* Textura decorativa — huellas gigantes muy tenues, ligadas al tema "patrón" */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ left: '-6%', top: '50%', transform: 'translateY(-50%) rotate(-12deg)', color: C.red, opacity: 0.06 }}
        >
          <Fingerprint size={340} strokeWidth={0.8} />
        </div>
        <div
          className="absolute pointer-events-none select-none"
          style={{ right: '-6%', top: '50%', transform: 'translateY(-50%) rotate(9deg)', color: C.red, opacity: 0.06 }}
        >
          <Fingerprint size={340} strokeWidth={0.8} />
        </div>

        <div
          className="relative max-w-3xl mx-auto text-center rounded-3xl border p-10 sm:p-14"
          style={{ borderColor: `${C.red}30`, background: C.bg }}
        >
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: C.red }}>
            DeepEnd · Test
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold" style={heading}>
            Antes de seguir, conoce tu patrón
          </h2>
          <p className="mt-3 max-w-md mx-auto text-sm" style={body}>
            El Espejo es un diagnóstico de 5 minutos que revela el arquetipo detrás de tus decisiones. Anónimo, sin registro.
          </p>
          <button
            onClick={() => setTestOpen(true)}
            className="cursor-pointer mt-8 inline-flex items-center gap-2 font-bold px-7 py-4 rounded-full transition-opacity hover:opacity-90"
            style={{ background: C.red, color: '#fff' }}
          >
            Hacer el test
            <ArrowRight size={18} />
          </button>
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
            <div
              key={t.name}
              className="rounded-2xl border overflow-hidden flex flex-col"
              style={{ background: C.surface1, borderColor: C.border }}
            >
              {/* Imagen */}
              <div className="relative h-44 bg-surface2 flex-shrink-0" style={{ background: C.surface2 }}>
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                {/* Gradiente para leer el texto encima si se superpone */}
                <div className="absolute bottom-0 inset-x-0 h-10" style={{ background: `linear-gradient(to top, ${C.surface1}, transparent)` }} />
              </div>

              {/* Contenido */}
              <div className="p-5 flex flex-col flex-1">
                <Quote size={18} style={{ color: t.color }} />
                <p className="text-sm mt-3 leading-relaxed flex-1" style={{ color: C.text + 'd9' }}>
                  "{t.text}"
                </p>
                <div className="mt-4">
                  <p className="text-sm font-bold" style={{ color: C.text }}>{t.name}</p>
                  <p className="text-xs" style={body}>{t.role}</p>
                </div>
                <AudioPlayer src={t.audio} color={t.color} />
              </div>
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

      {testOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <ArchetypeTest onClose={() => setTestOpen(false)} />
        </div>
      )}
    </div>
  )
}
