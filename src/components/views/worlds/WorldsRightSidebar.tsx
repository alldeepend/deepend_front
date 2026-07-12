import { Award, Brain, Lock } from 'lucide-react'
import { C } from '../../../styles/colors'

const BADGE_COLORS = ['#52B788', '#5B9BF7', '#E8C547', '#B57BEE', '#818CF8', '#3FC6D8', '#F4669B']

interface Props {
    mode: 'home' | 'journey'
    journeyTitle?: string
}

const ARCHETYPE_MOCK = {
    code: 'ESTRATEGA',
    name: 'El Estratega',
    tagline: 'Piensa antes de actuar. Ve patrones donde otros ven caos.',
    traits: ['Analítico', 'Constante', 'Metódico'],
    color: C.amber,
}

const BADGES_MOCK = [
    { name: 'El Observador',  journey: 'Mundo Financiero',   earned: true  },
    { name: 'Primer Paso',    journey: 'Hábitos Esenciales',  earned: true  },
    { name: 'Mente Clara',    journey: 'Mundo Financiero',   earned: true  },
    { name: 'Raíz Profunda',  journey: 'Hábitos Esenciales',  earned: false },
    { name: 'Impulso Real',   journey: 'Bienestar Físico',   earned: false },
    { name: 'El Despertar',   journey: 'Mundo Financiero',   earned: false },
    { name: 'Constancia',     journey: 'Hábitos Esenciales',  earned: false },
]

export default function WorldsRightSidebar({ mode, journeyTitle: _journeyTitle }: Props) {
    const badges = mode === 'journey'
        ? BADGES_MOCK
        : BADGES_MOCK.filter(b => b.earned)

    const earned  = badges.filter(b => b.earned)
    const pending = mode === 'journey' ? badges.filter(b => !b.earned) : []

    return (
        <aside
            className="w-80 flex-shrink-0 hidden md:flex flex-col self-start sticky top-0 border-l overflow-y-auto"
            style={{ background: C.bg, borderColor: C.border, fontFamily: 'Montserrat, sans-serif', height: '100dvh' }}
        >
            <div className="p-6 flex flex-col gap-6">

                {/* Archetype */}
                <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: C.label }}>
                        Mi Arquetipo
                    </p>
                    <div className="rounded-2xl p-4 border" style={{ background: C.surface1, borderColor: C.border }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: ARCHETYPE_MOCK.color + '22' }}
                            >
                                <Brain size={18} style={{ color: ARCHETYPE_MOCK.color }} />
                            </div>
                            <div>
                                <p className="text-xs font-bold" style={{ color: ARCHETYPE_MOCK.color }}>
                                    {ARCHETYPE_MOCK.code}
                                </p>
                                <p
                                    className="text-sm font-bold leading-tight"
                                    style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                                >
                                    {ARCHETYPE_MOCK.name}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: C.textMuted }}>
                            {ARCHETYPE_MOCK.tagline}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {ARCHETYPE_MOCK.traits.map(t => (
                                <span
                                    key={t}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: ARCHETYPE_MOCK.color + '22', color: ARCHETYPE_MOCK.color }}
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: C.border }} />

                {/* Badges */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: C.label }}>
                            {mode === 'journey' ? 'Insignias del viaje' : 'Mis Insignias'}
                        </p>
                        {mode === 'journey' && (
                            <span className="text-[10px]" style={{ color: C.disabled }}>
                                {earned.length}/{badges.length}
                            </span>
                        )}
                    </div>

                    {badges.length === 0 ? (
                        <div
                            className="flex flex-col items-center text-center gap-3 rounded-2xl border p-6"
                            style={{ borderColor: C.border, borderStyle: 'dashed' }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.surface2 }}>
                                <Award size={22} style={{ color: C.label }} />
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: C.label }}>
                                {mode === 'journey'
                                    ? 'Este viaje aún no tiene insignias asignadas'
                                    : 'Completa estaciones para ganar tus primeras insignias'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {earned.map((item, i) => {
                                const color = mode === 'home'
                                    ? BADGE_COLORS[i % BADGE_COLORS.length]
                                    : C.green
                                return (
                                    <div
                                        key={`e-${i}`}
                                        className="flex items-center gap-3 rounded-xl p-3 border"
                                        style={{ background: C.surface1, borderColor: color + '55' }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: color + '22' }}
                                        >
                                            <Award size={14} style={{ color }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold truncate" style={{ color }}>{item.name}</p>
                                            {mode === 'home' && (
                                                <p className="text-[10px] truncate mt-0.5" style={{ color: C.label }}>{item.journey}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {pending.map((item, i) => (
                                <div
                                    key={`p-${i}`}
                                    className="flex items-center gap-3 rounded-xl p-3 border opacity-40"
                                    style={{ background: C.surface1, borderColor: C.border }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: C.surface3 }}
                                    >
                                        <Lock size={12} style={{ color: C.label }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate" style={{ color: C.textMuted }}>{item.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </aside>
    )
}
