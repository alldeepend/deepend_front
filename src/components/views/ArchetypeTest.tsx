import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, ChevronLeft, RotateCcw, X, Fingerprint, Lock, Play, Pause, Mail, Check } from 'lucide-react'
import { C } from '../../styles/colors'
import { archetypeApi, type ArchetypeConfig } from '../../services/archetype'
import { useArchetypeConfig } from '../../hooks/useArchetypeConfig'
import { validateEmail } from '../../utils/validateEmail'

// ─── Scoring ─────────────────────────────────────────────────────────────────
// Misma mecánica de siempre (sumar puntaje de block1+block2, tomar el
// arquetipo dominante y el secundario, desempatar la variante A/B del
// dominante por su propio sub-puntaje) — pero ahora corre sobre las
// preguntas/opciones/puntajes que vienen del admin, no sobre constantes fijas.

function familyNameFromConfig(config: ArchetypeConfig, familyId: string): string {
  return Object.values(config.results).find(r => r.familyId === familyId)?.familyName ?? ''
}

function computeResult(answers: Record<string, string | number>, config: ArchetypeConfig) {
  const totals = new Map<string, number>()
  const variantTotals = new Map<string, number>()

  for (const q of config.block1) {
    const optionId = answers[q.id] as string | undefined
    if (!optionId) continue
    const option = q.options.find(o => o.id === optionId)
    if (!option) continue
    for (const t of option.scoreTargets) {
      totals.set(t.familyId, (totals.get(t.familyId) ?? 0) + t.points)
      if (t.variantId) variantTotals.set(t.variantId, (variantTotals.get(t.variantId) ?? 0) + t.points)
    }
  }

  for (const q of config.block2) {
    const value = answers[q.id] as number | undefined
    if (!value) continue
    for (const t of q.likertTargets) {
      totals.set(t.familyId, (totals.get(t.familyId) ?? 0) + value * t.multiplier)
    }
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1])
  const dominantFamilyId = sorted[0]?.[0]
  const secondaryFamilyId = sorted[1]?.[0]

  // Entre las variantes de la familia dominante, la de mayor sub-puntaje gana
  // — en empate (o si ninguna sumó nada) se prefiere la letra 'A', igual que
  // el default de siempre.
  const dominantVariants = Object.entries(config.results).filter(([, r]) => r.familyId === dominantFamilyId)
  dominantVariants.sort((a, b) => (variantTotals.get(b[0]) ?? 0) - (variantTotals.get(a[0]) ?? 0) || (a[1].letter < b[1].letter ? -1 : 1))
  const dominantVariantId = dominantVariants[0]?.[0]

  return {
    dominantVariantId,
    secondaryFamilyId,
    secondaryName: secondaryFamilyId ? familyNameFromConfig(config, secondaryFamilyId) : '',
  }
}

// ─── Shared layout wrapper ──────────────────────────────────────────────────

const FINGERPRINT_TEXTURE: {
  side: 'left' | 'right'
  offset: string
  top: string
  rotate: number
  opacity: number
  size: number
}[] = [
  { side: 'left', offset: '-2%', top: '4%', rotate: -18, opacity: 0.16, size: 260 },
  { side: 'left', offset: '-1%', top: '18%', rotate: -12, opacity: 0.22, size: 400 },
  { side: 'left', offset: '-3%', top: '54%', rotate: -6, opacity: 0.15, size: 300 },
  { side: 'left', offset: '-1%', top: '82%', rotate: -22, opacity: 0.18, size: 220 },
  { side: 'right', offset: '-2%', top: '8%', rotate: 16, opacity: 0.17, size: 280 },
  { side: 'right', offset: '-1%', top: '38%', rotate: 8, opacity: 0.15, size: 230 },
  { side: 'right', offset: '-1%', top: '60%', rotate: 10, opacity: 0.22, size: 400 },
  { side: 'right', offset: '-3%', top: '88%', rotate: 20, opacity: 0.16, size: 260 },
]

// Set aparte para celular: pocas, chicas y metidas en las esquinas — el
// contenido llena casi todo el ancho, así que solo cabe algo discreto sin
// cruzar el texto.
const FINGERPRINT_TEXTURE_MOBILE: {
  side: 'left' | 'right'
  offset: string
  vertical: 'top' | 'bottom'
  verticalOffset: string
  rotate: number
  opacity: number
  size: number
}[] = [
  { side: 'left', offset: '-12%', vertical: 'top', verticalOffset: '1%', rotate: -16, opacity: 0.14, size: 150 },
  { side: 'right', offset: '-14%', vertical: 'top', verticalOffset: '4%', rotate: 14, opacity: 0.12, size: 170 },
  { side: 'right', offset: '-10%', vertical: 'bottom', verticalOffset: '2%', rotate: 18, opacity: 0.14, size: 160 },
]

function Wrapper({
  phase, onClose, children,
}: {
  phase: Phase
  onClose?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: C.bg, fontFamily: 'Montserrat, sans-serif', color: C.text }}
    >
      {/* Resplandor rojo ambiental detrás del contenido, le da cuerpo al fondo en pantallas anchas */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          background: `radial-gradient(ellipse 1100px 800px at 50% 35%, ${C.red}16, transparent 65%)`,
        }}
      />

      {/* Textura decorativa — huellas tenues a los lados, mismo tema del "Espejo".
          Oculta en pantallas angostas: ahí el ancho no alcanza para que quede en
          los bordes y termina cruzando justo por encima del texto. */}
      {FINGERPRINT_TEXTURE.map((fp, i) => (
        <div
          key={i}
          className="hidden sm:block absolute pointer-events-none select-none"
          style={{
            [fp.side]: fp.offset,
            top: fp.top,
            transform: `rotate(${fp.rotate}deg)`,
            color: C.red,
            opacity: fp.opacity,
          }}
        >
          <Fingerprint size={fp.size} strokeWidth={0.7} />
        </div>
      ))}

      {/* Mismo espíritu, versión chica para celular — solo en las esquinas,
          donde queda espacio vacío arriba/abajo del bloque de texto. */}
      {FINGERPRINT_TEXTURE_MOBILE.map((fp, i) => (
        <div
          key={i}
          className="sm:hidden absolute pointer-events-none select-none"
          style={{
            [fp.side]: fp.offset,
            [fp.vertical]: fp.verticalOffset,
            transform: `rotate(${fp.rotate}deg)`,
            color: C.red,
            opacity: fp.opacity,
          }}
        >
          <Fingerprint size={fp.size} strokeWidth={0.7} />
        </div>
      ))}

      {onClose && (phase === 'intro' || phase === 'result') && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full transition-opacity hover:opacity-70"
          style={{ background: C.surface1, color: C.textMuted }}
        >
          <X size={18} />
        </button>
      )}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

// ─── Result audio player ────────────────────────────────────────────────────

function ResultAudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
  }, [audioUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div
      className="flex items-center gap-4 mb-8 p-4 rounded-2xl border"
      style={{ borderColor: C.border, background: C.surface1 }}
    >
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
        style={{ background: C.red, color: '#fff' }}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: C.label }}>
          Escuchar tu resultado
        </p>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: C.red }}
          />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onEnded={() => { setIsPlaying(false); setProgress(0) }}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget
          if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
        }}
      />
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'block0' | 'block1' | 'block2' | 'result'

interface ResultData {
  dominantVariantId: string
  secondaryFamilyId: string
  secondaryName: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ArchetypeTest({ onClose }: { onClose?: () => void } = {}) {
  const navigate = useNavigate()
  const { data: config } = useArchetypeConfig()
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [result, setResult] = useState<ResultData | null>(null)
  const [unlockedSections, setUnlockedSections] = useState<number[]>([0])
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [confirmEmailInput, setConfirmEmailInput] = useState('')
  const [confirmEmailError, setConfirmEmailError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [viewingSavedResult, setViewingSavedResult] = useState(false)

  const serif = "'American Typewriter', Georgia, serif"
  const isLoggedIn = !!localStorage.getItem('token')

  function selectAnswer(questionId: string, value: string | number) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  // Entrando por la ruta /test (no como modal desde la landing) con una cuenta
  // que ya tiene un resultado guardado: lo mostramos directo en vez de forzar
  // a repetir las 18 preguntas solo para volver a verlo. "Hacer el test de
  // nuevo" sigue disponible para quien sí quiera repetirlo.
  useEffect(() => {
    if (onClose || !isLoggedIn) return
    archetypeApi.getMyResult()
      .then(res => {
        if (!res.result?.dominantVariantId || !res.result.secondaryFamilyId) return
        setResult({
          dominantVariantId: res.result.dominantVariantId,
          secondaryFamilyId: res.result.secondaryFamilyId,
          secondaryName: res.result.secondaryNameSnapshot ?? '',
        })
        setViewingSavedResult(true)
        setPhase('result')
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Usuario logueado: guarda el resultado automáticamente, ligado a su cuenta.
  // No aplica cuando solo estamos mostrando un resultado ya guardado (arriba).
  useEffect(() => {
    if (phase !== 'result' || !result || !isLoggedIn || saveState !== 'idle' || viewingSavedResult) return
    setSaveState('saving')
    archetypeApi.submitResult({ dominantVariantId: result.dominantVariantId, secondaryFamilyId: result.secondaryFamilyId, answers })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result, viewingSavedResult])

  // Visitante anónimo: guarda el resultado asociado al correo que deje.
  // Se valida formato + dominio (rechaza correos desechables), y que la
  // confirmación coincida exactamente, antes de enviar.
  function saveWithEmail() {
    if (!result || saveState === 'saving') return
    const check = validateEmail(emailInput)
    if (!check.valid) {
      setEmailError(check.reason ?? 'Correo inválido.')
      return
    }
    if (emailInput.trim().toLowerCase() !== confirmEmailInput.trim().toLowerCase()) {
      setConfirmEmailError('Los correos no coinciden.')
      return
    }
    setEmailError(null)
    setConfirmEmailError(null)
    setSaveState('saving')
    archetypeApi.submitResult({ dominantVariantId: result.dominantVariantId, secondaryFamilyId: result.secondaryFamilyId, answers, email: emailInput.trim().toLowerCase() })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
  }

  function advance() {
    if (!config) return
    if (phase === 'block0') {
      if (currentQ < config.block0.length - 1) setCurrentQ(c => c + 1)
      else { setCurrentQ(0); setPhase('block1') }
    } else if (phase === 'block1') {
      if (currentQ < config.block1.length - 1) setCurrentQ(c => c + 1)
      else { setCurrentQ(0); setPhase('block2') }
    } else if (phase === 'block2') {
      if (currentQ < config.block2.length - 1) setCurrentQ(c => c + 1)
      else {
        setResult(computeResult(answers, config))
        setPhase('result')
      }
    }
  }

  function goBack() {
    if (!config) return
    if (phase === 'block0') {
      if (currentQ > 0) setCurrentQ(c => c - 1)
      else setPhase('intro')
    } else if (phase === 'block1') {
      if (currentQ > 0) setCurrentQ(c => c - 1)
      else { setCurrentQ(config.block0.length - 1); setPhase('block0') }
    } else if (phase === 'block2') {
      if (currentQ > 0) setCurrentQ(c => c - 1)
      else { setCurrentQ(config.block1.length - 1); setPhase('block1') }
    }
  }

  function restart() {
    setPhase('intro')
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
    setUnlockedSections([0])
    setEmailInput('')
    setEmailError(null)
    setConfirmEmailInput('')
    setConfirmEmailError(null)
    setSaveState('idle')
    setViewingSavedResult(false)
  }

  function unlockSection(index: number) {
    setUnlockedSections(prev => prev.includes(index) ? prev : [...prev, index])
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <Wrapper phase={phase} onClose={onClose}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <img src="/Logo_DeepEnd_Elespejo.png" alt="DeepEnd" className="h-36 w-auto mb-3" />
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: serif, color: C.text }}
          >
            El Espejo
          </h1>
          <p className="text-lg mb-3" style={{ color: C.textMuted }}>
            Un diagnóstico de patrones — 18 preguntas.
          </p>
          <p className="text-sm leading-relaxed mb-10" style={{ color: C.label }}>
            No es un test de personalidad. Es un espejo. En los próximos minutos vas a ver
            con más claridad el patrón que está detrás de lo que llevas posponiendo.
          </p>
          <button
            onClick={() => setPhase('block0')}
            className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: C.red, color: '#fff' }}
          >
            Comenzar <ArrowRight size={18} />
          </button>
          <p className="mt-6 text-[11px]" style={{ color: C.disabled }}>
            Aproximadamente 5 minutos 
          </p>
        </div>
      </div>
    </Wrapper>
  )

  // El cuestionario y el contenido de resultado ahora vienen de la API — sin
  // esto cargado no hay nada que mostrar en block0/1/2/result (intro sí se ve
  // de una, no depende del fetch).
  if (!config) {
    return (
      <Wrapper phase={phase} onClose={onClose}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: C.textMuted }}>Cargando...</p>
        </div>
      </Wrapper>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const res = config.results[result.dominantVariantId]

    // Puede faltar si el admin archivó ese arquetipo justo después de que se
    // calculó el resultado, o si un resultado guardado antes apunta a algo
    // que ya no existe — sin este guard, `res.familyName` revienta la pantalla.
    if (!res) {
      return (
        <Wrapper phase={phase} onClose={onClose}>
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <p className="text-sm" style={{ color: C.textMuted }}>
              No pudimos cargar tu resultado. Intenta de nuevo.
            </p>
            <button
              onClick={restart}
              className="px-5 py-3 rounded-2xl font-bold text-sm"
              style={{ background: C.red, color: '#fff' }}
            >
              Reintentar
            </button>
          </div>
        </Wrapper>
      )
    }

    const Section = ({ title, body, index }: { title: string; body: string; index: number }) => {
      const unlocked = unlockedSections.includes(index)
      return (
        <div className="py-6 border-b" style={{ borderColor: C.border }}>
          <button
            type="button"
            onClick={() => unlockSection(index)}
            disabled={unlocked}
            className={`flex items-center justify-between gap-3 w-full text-left ${unlocked ? '' : 'cursor-pointer'}`}
          >
            <span className="flex items-center gap-2">
              {!unlocked && <Lock size={12} style={{ color: C.green }} />}
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: C.green }}>
                {title}
              </span>
            </span>
            {!unlocked && (
              <span className="text-[10px] font-bold flex-shrink-0" style={{ color: C.green }}>
                Toca para revelar
              </span>
            )}
          </button>

          <div
            className="overflow-hidden"
            style={{
              maxHeight: unlocked ? '400px' : '0px',
              opacity: unlocked ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}
          >
            <p className="text-sm leading-relaxed mt-3" style={{ color: C.textMuted }}>{body}</p>
          </div>
        </div>
      )
    }

    return (
      <Wrapper phase={phase} onClose={onClose}>
        <div className="flex-1 flex flex-col items-center py-12 px-6">
          <div className="w-full max-w-lg">
            {/* Sin onClose estamos en la ruta /test como página propia (no como
                modal de la landing) — sin esto no hay forma de volver al resto
                de la app desde acá. */}
            {!onClose && (
              <button
                onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
                className="flex items-center text-sm mb-6 transition-colors group"
                style={{ color: C.label }}
              >
                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                {isLoggedIn ? 'Dashboard' : 'Inicio'}
              </button>
            )}

            {/* Contenido del resultado — bloqueado con candado hasta dejar el correo (visitantes anónimos) */}
            {(() => {
              const locked = !isLoggedIn && saveState !== 'saved'
              return (
                <div className="relative">
                  <div
                    className="rounded-2xl"
                    style={{
                      filter: locked ? 'blur(14px)' : 'none',
                      opacity: locked ? 0.9 : 1,
                      pointerEvents: locked ? 'none' : 'auto',
                      userSelect: locked ? 'none' : 'auto',
                      transition: 'filter 0.6s ease, opacity 0.6s ease',
                    }}
                    aria-hidden={locked}
                  >
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: C.label }}>
                      Arquetipo
                    </p>
                    <h1
                      className="text-3xl sm:text-4xl font-bold leading-tight mb-1"
                      style={{ fontFamily: serif, color: C.text }}
                    >
                      {res.familyName}
                    </h1>
                    <p className="text-sm italic mb-8" style={{ color: C.textMuted }}>
                      {res.variantLabel}
                    </p>

                    {res.audioUrl && <ResultAudioPlayer audioUrl={res.audioUrl} />}

                    <div className="border-t" style={{ borderColor: C.border }} />

                    <Section title="Tu patrón" body={res.pattern} index={0} />
                    <Section title="Lo que esto ha costado" body={res.cost} index={1} />
                    <Section title="Lo que ya sabes hacer" body={res.strengths} index={2} />
                    <Section title="Una micro-acción esta semana" body={res.microAction} index={3} />

                    {/* Teaser */}
                    <div
                      className="mt-6 rounded-2xl border p-5"
                      style={{ background: C.surface1, borderColor: `${C.red}30` }}
                    >
                      <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: C.red }}>
                        Hay algo más en tu patrón
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                        Tus respuestas también muestran una tendencia hacia{' '}
                        <span className="font-semibold" style={{ color: C.text }}>
                          {result.secondaryName}
                        </span>
                        . Esa combinación tiene una dinámica particular que vale explorar — porque
                        los dos patrones juntos se refuerzan de una manera que este diagnóstico
                        solo puede nombrar, no desarrollar. Eso viene después del espejo.
                      </p>
                    </div>
                  </div>

                  {/* Candado — visitante anónimo que aún no dejó su correo */}
                  {locked && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-8 rounded-2xl"
                      style={{ background: `${C.bg}d9`, border: `1px solid ${C.border}` }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                        style={{ background: `${C.green}18`, border: `1px solid ${C.green}40` }}
                      >
                        <Lock size={22} style={{ color: C.green }} />
                      </div>
                      <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: C.green }}>
                        Tu arquetipo ya está listo
                      </p>
                      <h2
                        className="text-lg font-bold leading-snug mb-2 max-w-xs"
                        style={{ fontFamily: serif, color: C.text }}
                      >
                        Déjanos tu correo para revelarlo
                      </h2>
                      <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: C.textMuted }}>
                        De paso lo guardamos: si creas tu cuenta en DeepEnd con ese mismo correo,
                        tu arquetipo va a estar esperándote ahí.
                      </p>
                      <div className="w-full max-w-xs flex flex-col gap-2">
                        <div
                          className="flex items-center gap-2 px-4 rounded-xl border"
                          style={{ borderColor: emailError ? C.red : C.border, background: C.surface1 }}
                        >
                          <Mail size={16} style={{ color: C.label }} />
                          <input
                            type="email"
                            value={emailInput}
                            onChange={e => {
                              setEmailInput(e.target.value)
                              if (emailError) setEmailError(null)
                              if (confirmEmailError) setConfirmEmailError(null)
                            }}
                            onBlur={() => {
                              if (!emailInput.trim()) return
                              const check = validateEmail(emailInput)
                              setEmailError(check.valid ? null : (check.reason ?? 'Correo inválido.'))
                            }}
                            onKeyDown={e => { if (e.key === 'Enter') saveWithEmail() }}
                            placeholder="tucorreo@ejemplo.com"
                            className="flex-1 py-3 bg-transparent outline-none text-sm"
                            style={{ color: C.text }}
                          />
                        </div>
                        <div
                          className="flex items-center gap-2 px-4 rounded-xl border"
                          style={{ borderColor: confirmEmailError ? C.red : C.border, background: C.surface1 }}
                        >
                          <Mail size={16} style={{ color: C.label }} />
                          <input
                            type="email"
                            value={confirmEmailInput}
                            onChange={e => { setConfirmEmailInput(e.target.value); if (confirmEmailError) setConfirmEmailError(null) }}
                            onBlur={() => {
                              if (!confirmEmailInput.trim()) return
                              setConfirmEmailError(
                                confirmEmailInput.trim().toLowerCase() === emailInput.trim().toLowerCase()
                                  ? null
                                  : 'Los correos no coinciden.'
                              )
                            }}
                            onKeyDown={e => { if (e.key === 'Enter') saveWithEmail() }}
                            placeholder="Confirma tu correo"
                            className="flex-1 py-3 bg-transparent outline-none text-sm"
                            style={{ color: C.text }}
                          />
                        </div>
                        <button
                          onClick={saveWithEmail}
                          disabled={!emailInput.trim() || !confirmEmailInput.trim() || saveState === 'saving'}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                          style={{
                            background: (!emailInput.trim() || !confirmEmailInput.trim()) ? C.surface2 : C.green,
                            color: (!emailInput.trim() || !confirmEmailInput.trim()) ? C.disabled : '#fff',
                            cursor: (!emailInput.trim() || !confirmEmailInput.trim()) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {saveState === 'saving' ? 'Revelando...' : <><Lock size={14} /> Revelar mi arquetipo</>}
                        </button>
                      </div>
                      {emailError && (
                        <p className="text-xs mt-3" style={{ color: C.red }}>
                          {emailError}
                        </p>
                      )}
                      {!emailError && confirmEmailError && (
                        <p className="text-xs mt-3" style={{ color: C.red }}>
                          {confirmEmailError}
                        </p>
                      )}
                      {!emailError && !confirmEmailError && saveState === 'error' && (
                        <p className="text-xs mt-3" style={{ color: C.red }}>
                          No pudimos guardar tu resultado. Intenta de nuevo.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Confirmación — visitante anónimo que ya dejó su correo */}
            {!isLoggedIn && saveState === 'saved' && (
              <div
                className="mt-6 rounded-2xl border p-5 flex items-start gap-3"
                style={{ background: C.surface1, borderColor: C.border }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${C.green}22` }}
                >
                  <Check size={16} style={{ color: C.green }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                  <span className="font-semibold" style={{ color: C.text }}>Guardado.</span>{' '}
                  Cuando crees tu cuenta en DeepEnd con este correo, tu arquetipo va a estar esperándote.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              {isLoggedIn ? (
                <div
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-center"
                  style={{
                    background: saveState === 'error' ? `${C.red}12` : `${C.green}18`,
                    border: `1px solid ${saveState === 'error' ? C.red + '40' : C.green + '40'}`,
                    color: saveState === 'error' ? C.red : C.green,
                  }}
                >
                  {saveState === 'saving' && 'Guardando tu resultado...'}
                  {saveState === 'saved' && (<><Check size={16} /> Guardado en tu perfil</>)}
                  {saveState === 'error' && 'No pudimos guardar tu resultado'}
                  {saveState === 'idle' && 'Guardado en tu perfil'}
                </div>
              ) : (
                <Link
                  to="/register"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm text-center transition-opacity hover:opacity-90"
                  style={{ background: C.red, color: '#fff' }}
                >
                  Crear mi cuenta en DeepEnd <ArrowRight size={16} />
                </Link>
              )}
              <button
                onClick={restart}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm border transition-colors hover:opacity-80"
                style={{ borderColor: C.border, color: C.textMuted, background: 'transparent' }}
              >
                <RotateCcw size={14} /> Hacer el test de nuevo
              </button>
            </div>
          </div>
        </div>
      </Wrapper>
    )
  }

  // ── QUESTIONS (block0, block1, block2) ─────────────────────────────────────

  const totalQuestions = config.block0.length + config.block1.length + config.block2.length
  const answeredSoFar = phase === 'block0'
    ? currentQ
    : phase === 'block1'
    ? config.block0.length + currentQ
    : config.block0.length + config.block1.length + currentQ
  const progress = Math.round((answeredSoFar / totalQuestions) * 100)

  if (phase === 'block0') {
    const q = config.block0[currentQ]
    const selected = answers[q.id] as string | undefined
    const canAdvance = !!selected

    return (
      <Wrapper phase={phase} onClose={onClose}>
        <QuestionHeader progress={progress} onBack={goBack} totalQ={totalQuestions} currentIdx={answeredSoFar} onClose={onClose} />
        <div className="flex-1 flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-lg">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-6" style={{ color: C.label }}>
              Contexto
            </p>
            <h2 className="text-xl font-bold leading-snug mb-8" style={{ fontFamily: serif, color: C.text }}>
              {q.text}
            </h2>
            <div className="flex flex-col gap-3">
              {q.options.map(opt => (
                <OptionButton
                  key={opt.id}
                  label={opt.label}
                  text={opt.text}
                  selected={selected === opt.id}
                  onClick={() => selectAnswer(q.id, opt.id)}
                />
              ))}
            </div>
            <NextButton disabled={!canAdvance} onClick={advance} />
          </div>
        </div>
      </Wrapper>
    )
  }

  if (phase === 'block1') {
    const q = config.block1[currentQ]
    const selected = answers[q.id] as string | undefined

    return (
      <Wrapper phase={phase} onClose={onClose}>
        <QuestionHeader progress={progress} onBack={goBack} totalQ={config.block1.length} currentIdx={currentQ} label="Diagnóstico" onClose={onClose} />
        <div className="flex-1 flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-lg">
            <h2 className="text-xl font-bold leading-snug mb-8" style={{ fontFamily: serif, color: C.text }}>
              {q.text}
            </h2>
            <div className="flex flex-col gap-3">
              {q.options.map(opt => (
                <OptionButton
                  key={opt.id}
                  label={opt.label}
                  text={opt.text}
                  selected={selected === opt.id}
                  onClick={() => selectAnswer(q.id, opt.id)}
                />
              ))}
            </div>
            <NextButton disabled={!selected} onClick={advance} />
          </div>
        </div>
      </Wrapper>
    )
  }

  if (phase === 'block2') {
    const q = config.block2[currentQ]
    const selected = answers[q.id] as number | undefined
    const likertLabels = ['No me describe', 'Un poco', 'Bastante', 'Me describe completamente']

    return (
      <Wrapper phase={phase} onClose={onClose}>
        <QuestionHeader progress={progress} onBack={goBack} totalQ={config.block2.length} currentIdx={currentQ} label="Casi listo" onClose={onClose} />
        <div className="flex-1 flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-lg">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-6" style={{ color: C.label }}>
              ¿Cuánto te describe esta frase?
            </p>
            <h2 className="text-xl font-bold leading-snug mb-10" style={{ fontFamily: serif, color: C.text }}>
              {q.text}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(val => (
                <button
                  key={val}
                  onClick={() => selectAnswer(q.id, val)}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all"
                  style={{
                    background: selected === val ? `${C.green}18` : C.surface1,
                    borderColor: selected === val ? C.green : C.border,
                    color: selected === val ? C.green : C.textMuted,
                  }}
                >
                  <span className="text-2xl font-bold">{val}</span>
                  <span className="text-[9px] font-bold text-center leading-tight px-1" style={{ color: selected === val ? C.green : C.label }}>
                    {likertLabels[val - 1]}
                  </span>
                </button>
              ))}
            </div>
            <NextButton
              disabled={selected === undefined}
              onClick={advance}
              label={currentQ === config.block2.length - 1 ? 'Ver mi resultado' : 'Siguiente'}
            />
          </div>
        </div>
      </Wrapper>
    )
  }

  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuestionHeader({
  progress, onBack, totalQ, currentIdx, label, onClose,
}: {
  progress: number
  onBack: () => void
  totalQ: number
  currentIdx: number
  label?: string
  onClose?: () => void
}) {
  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: C.border }}>
      <button onClick={onBack} className="p-1 rounded-lg transition-opacity hover:opacity-70" style={{ color: C.label }}>
        <ChevronLeft size={20} />
      </button>
      <div className="flex-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface2 }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: C.green }}
          />
        </div>
      </div>
      <span className="text-[11px] font-bold tabular-nums" style={{ color: C.label }}>
        {label ? `${label} · ` : ''}{currentIdx + 1}/{totalQ}
      </span>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded-lg transition-opacity hover:opacity-70" style={{ color: C.label }}>
          <X size={18} />
        </button>
      )}
    </header>
  )
}

function OptionButton({
  label, text, selected, onClick,
}: {
  label: string
  text: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 w-full text-left px-5 py-4 rounded-2xl border transition-all"
      style={{
        background: selected ? `${C.green}18` : C.surface1,
        borderColor: selected ? C.green : C.border,
      }}
    >
      <span
        className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: selected ? C.green : C.surface2,
          color: selected ? '#fff' : C.label,
        }}
      >
        {label}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: selected ? C.text : C.textMuted }}>
        {text}
      </span>
    </button>
  )
}

function NextButton({
  disabled, onClick, label = 'Siguiente',
}: {
  disabled: boolean
  onClick: () => void
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all"
      style={{
        background: disabled ? C.surface2 : C.red,
        color: disabled ? C.disabled : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label} {!disabled && <ArrowRight size={16} />}
    </button>
  )
}
