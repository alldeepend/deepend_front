import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ChevronLeft, RotateCcw, X, Fingerprint, Lock, Play, Pause, Mail, Check } from 'lucide-react'
import { C } from '../../styles/colors'
import {
  BLOCK0, BLOCK1, BLOCK2,
  RESULTS, ARCHETYPE_NAMES,
  type ArchNum,
} from '../../data/archetypeData'
import { archetypeApi } from '../../services/archetype'
import { validateEmail } from '../../utils/validateEmail'

// ─── Scoring ─────────────────────────────────────────────────────────────────

function computeResult(answers: Record<number, string | number>) {
  const totals: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
  const variants: Record<number, { A: number; B: number }> = {}
  for (let i = 1; i <= 7; i++) variants[i] = { A: 0, B: 0 }

  for (const q of BLOCK1) {
    const answer = answers[q.id] as string
    if (!answer) continue
    const option = q.options.find(o => o.label === answer)
    if (!option) continue
    for (const s of option.scores) {
      totals[s.arch] += 2
      if (s.variant === 'A') variants[s.arch].A += 2
      if (s.variant === 'B') variants[s.arch].B += 2
    }
  }

  for (const q of BLOCK2) {
    const value = answers[q.id] as number
    if (!value) continue
    for (const arch of q.archs) totals[arch] += value
  }

  const sorted = (Object.entries(totals) as [string, number][]).sort((a, b) => b[1] - a[1])
  const dominantNum = Number(sorted[0][0]) as ArchNum
  const secondaryNum = Number(sorted[1][0]) as ArchNum
  const vScores = variants[dominantNum]
  const variant = vScores.B > vScores.A ? 'B' : 'A'

  return {
    dominantKey: `${dominantNum}${variant}`,
    secondaryNum,
    secondaryName: ARCHETYPE_NAMES[secondaryNum],
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

      {/* Textura decorativa — huellas tenues a los lados, mismo tema del "Espejo" */}
      {FINGERPRINT_TEXTURE.map((fp, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
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

function ResultAudioPlayer({ audioKey }: { audioKey: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
  }, [audioKey])

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
        src={`/audio/archetypes/${audioKey}.mp3`}
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
  dominantKey: string
  secondaryNum: ArchNum
  secondaryName: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ArchetypeTest({ onClose }: { onClose?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [result, setResult] = useState<ResultData | null>(null)
  const [unlockedSections, setUnlockedSections] = useState<number[]>([0])
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const serif = "'American Typewriter', Georgia, serif"
  const isLoggedIn = !!localStorage.getItem('token')

  function selectAnswer(questionId: number, value: string | number) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  // Usuario logueado: guarda el resultado automáticamente, ligado a su cuenta.
  useEffect(() => {
    if (phase !== 'result' || !result || !isLoggedIn || saveState !== 'idle') return
    setSaveState('saving')
    archetypeApi.submitResult({ dominantKey: result.dominantKey, secondaryNum: result.secondaryNum, answers })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result])

  // Visitante anónimo: guarda el resultado asociado al correo que deje.
  // Se valida formato + dominio (rechaza correos desechables) antes de enviar.
  function saveWithEmail() {
    if (!result || saveState === 'saving') return
    const check = validateEmail(emailInput)
    if (!check.valid) {
      setEmailError(check.reason ?? 'Correo inválido.')
      return
    }
    setEmailError(null)
    setSaveState('saving')
    archetypeApi.submitResult({ dominantKey: result.dominantKey, secondaryNum: result.secondaryNum, answers, email: emailInput.trim().toLowerCase() })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'))
  }

  function advance() {
    if (phase === 'block0') {
      if (currentQ < BLOCK0.length - 1) setCurrentQ(c => c + 1)
      else { setCurrentQ(0); setPhase('block1') }
    } else if (phase === 'block1') {
      if (currentQ < BLOCK1.length - 1) setCurrentQ(c => c + 1)
      else { setCurrentQ(0); setPhase('block2') }
    } else if (phase === 'block2') {
      if (currentQ < BLOCK2.length - 1) setCurrentQ(c => c + 1)
      else {
        setResult(computeResult(answers))
        setPhase('result')
      }
    }
  }

  function goBack() {
    if (phase === 'block0') {
      if (currentQ > 0) setCurrentQ(c => c - 1)
      else setPhase('intro')
    } else if (phase === 'block1') {
      if (currentQ > 0) setCurrentQ(c => c - 1)
      else { setCurrentQ(BLOCK0.length - 1); setPhase('block0') }
    } else if (phase === 'block2') {
      if (currentQ > 0) setCurrentQ(c => c - 1)
      else { setCurrentQ(BLOCK1.length - 1); setPhase('block1') }
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
    setSaveState('idle')
  }

  function unlockSection(index: number) {
    setUnlockedSections(prev => prev.includes(index) ? prev : [...prev, index])
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <Wrapper phase={phase} onClose={onClose}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-8" style={{ color: C.red }}>
            DeepEnd · Test
          </p>
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
            Aproximadamente 5 minutos · Anónimo
          </p>
        </div>
      </div>
    </Wrapper>
  )

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const res = RESULTS[result.dominantKey]

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
                      {res.name}
                    </h1>
                    <p className="text-sm italic mb-8" style={{ color: C.textMuted }}>
                      {res.variant}
                    </p>

                    <ResultAudioPlayer audioKey={result.dominantKey} />

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
                            onChange={e => { setEmailInput(e.target.value); if (emailError) setEmailError(null) }}
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
                        <button
                          onClick={saveWithEmail}
                          disabled={!emailInput.trim() || saveState === 'saving'}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                          style={{
                            background: !emailInput.trim() ? C.surface2 : C.green,
                            color: !emailInput.trim() ? C.disabled : '#fff',
                            cursor: !emailInput.trim() ? 'not-allowed' : 'pointer',
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
                      {!emailError && saveState === 'error' && (
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

  const totalQuestions = BLOCK0.length + BLOCK1.length + BLOCK2.length
  const answeredSoFar = phase === 'block0'
    ? currentQ
    : phase === 'block1'
    ? BLOCK0.length + currentQ
    : BLOCK0.length + BLOCK1.length + currentQ
  const progress = Math.round((answeredSoFar / totalQuestions) * 100)

  if (phase === 'block0') {
    const q = BLOCK0[currentQ]
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
                  key={opt.label}
                  label={opt.label}
                  text={opt.text}
                  selected={selected === opt.label}
                  onClick={() => selectAnswer(q.id, opt.label)}
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
    const q = BLOCK1[currentQ]
    const selected = answers[q.id] as string | undefined

    return (
      <Wrapper phase={phase} onClose={onClose}>
        <QuestionHeader progress={progress} onBack={goBack} totalQ={BLOCK1.length} currentIdx={currentQ} label="Diagnóstico" onClose={onClose} />
        <div className="flex-1 flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-lg">
            <h2 className="text-xl font-bold leading-snug mb-8" style={{ fontFamily: serif, color: C.text }}>
              {q.text}
            </h2>
            <div className="flex flex-col gap-3">
              {q.options.map(opt => (
                <OptionButton
                  key={opt.label}
                  label={opt.label}
                  text={opt.text}
                  selected={selected === opt.label}
                  onClick={() => selectAnswer(q.id, opt.label)}
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
    const q = BLOCK2[currentQ]
    const selected = answers[q.id] as number | undefined
    const likertLabels = ['No me describe', 'Un poco', 'Bastante', 'Me describe completamente']

    return (
      <Wrapper phase={phase} onClose={onClose}>
        <QuestionHeader progress={progress} onBack={goBack} totalQ={BLOCK2.length} currentIdx={currentQ} label="Casi listo" onClose={onClose} />
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
                    background: selected === val ? `${C.red}18` : C.surface1,
                    borderColor: selected === val ? C.red : C.border,
                    color: selected === val ? C.red : C.textMuted,
                  }}
                >
                  <span className="text-2xl font-bold">{val}</span>
                  <span className="text-[9px] font-bold text-center leading-tight px-1" style={{ color: selected === val ? C.red : C.label }}>
                    {likertLabels[val - 1]}
                  </span>
                </button>
              ))}
            </div>
            <NextButton
              disabled={selected === undefined}
              onClick={advance}
              label={currentQ === BLOCK2.length - 1 ? 'Ver mi resultado' : 'Siguiente'}
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
            style={{ width: `${progress}%`, background: C.red }}
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
        background: selected ? `${C.red}18` : C.surface1,
        borderColor: selected ? C.red : C.border,
      }}
    >
      <span
        className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: selected ? C.red : C.surface2,
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
