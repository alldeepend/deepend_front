import { Award, Brain, Lock, Zap } from 'lucide-react'
import { C } from '../../../styles/colors'
import type { Area, Journey, UserJourneyProgress } from '../../../types/journey'

const BADGE_COLORS = ['#52B788', '#5B9BF7', '#E8C547', '#B57BEE', '#818CF8', '#3FC6D8', '#F4669B']

export interface SidebarBadge {
    name: string
    journey?: string
    earned: boolean
}

// Insignias ganadas por el usuario, agregadas de todos sus journeys (para mode="home")
export function earnedBadgesFromAreas(areas: Area[]): SidebarBadge[] {
    const badges: SidebarBadge[] = []
    for (const area of areas) {
        for (const journey of area.journeys) {
            const earned = journey.userJourneys?.[0]?.earnedBadges ?? []
            for (const name of earned) {
                badges.push({ name, journey: journey.title, earned: true })
            }
        }
    }
    return badges
}

// XP total del usuario, agregado de todos sus journeys (para mode="home")
export function totalXpFromAreas(areas: Area[]): number {
    let total = 0
    for (const area of areas) {
        for (const journey of area.journeys) {
            total += journey.userJourneys?.[0]?.totalXpEarned ?? 0
        }
    }
    return total
}

// Todas las insignias posibles de un journey (ganadas + pendientes), para mode="journey"
export function badgesForJourney(journey: Journey, userJourney: UserJourneyProgress | null | undefined): SidebarBadge[] {
    const earnedSet = new Set(userJourney?.earnedBadges ?? [])
    const badges: SidebarBadge[] = []
    for (const world of journey.worlds) {
        for (const station of world.stations) {
            if (station.badgeName) {
                badges.push({ name: station.badgeName, earned: earnedSet.has(station.badgeName) })
            }
        }
    }
    return badges
}

interface Props {
    mode: 'home' | 'journey'
    journeyTitle?: string
    badges: SidebarBadge[]
    totalXp: number
}

const ARCHETYPE_MOCK = {
    code: 'ESTRATEGA',
    name: 'El Estratega',
    tagline: 'Piensa antes de actuar. Ve patrones donde otros ven caos.',
    traits: ['Analítico', 'Constante', 'Metódico'],
    color: C.amber,
}

export default function WorldsRightSidebar({ mode, journeyTitle: _journeyTitle, badges: allBadges, totalXp }: Props) {
    const badges = mode === 'journey'
        ? allBadges
        : allBadges.filter(b => b.earned)

    const earned  = badges.filter(b => b.earned)
    const pending = mode === 'journey' ? badges.filter(b => !b.earned) : []

    return (
        <aside
            className="w-80 flex-shrink-0 hidden md:flex flex-col self-start sticky top-0 border-l overflow-y-auto dark-scrollbar"
            style={{ background: C.bg, borderColor: C.border, fontFamily: 'Montserrat, sans-serif', height: '100dvh' }}
        >
            <div className="p-6 flex flex-col gap-6">

                {/* XP total */}
                <div className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: C.surface1, borderColor: C.border }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.amber + '22' }}>
                        <Zap size={18} style={{ color: C.amber }} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: C.label }}>
                            {mode === 'journey' ? 'XP de este viaje' : 'XP Total'}
                        </p>
                        <p className="text-lg font-bold" style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}>
                            {totalXp.toLocaleString('es')} XP
                        </p>
                    </div>
                </div>

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
