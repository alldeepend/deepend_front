import { useState } from 'react';
import { X, Upload, Clock, Activity, CheckCircle2, Star } from 'lucide-react';

const CHECKIN_OPTIONS = [
    { value: 'EN_RITMO',        emoji: '🟢', label: 'Voy en ritmo' },
    { value: 'LENTO_PERO_VOY',  emoji: '🟡', label: 'Voy lento, pero voy' },
    { value: 'NECESITO_VOLVER', emoji: '🔁', label: 'Necesito volver' },
    { value: 'EN_PAUSA',        emoji: '⚪', label: 'Esta semana estoy en pausa' },
];

const MOCK_CHALLENGE_PARTICIPANTS = [
    { name: 'Ana Luzdaly Zambrano', email: 'anazambrano.vivas@gmail.com', level: 'Activo',       weekly: { minutes: 210, goal: 270, percentage: 78 },  total: { minutes: 210, goal: 270, percentage: 78 } },
    { name: 'Carlos Escobar',       email: 'carlos.escobar13@gmail.com',  level: 'Alto volumen',  weekly: { minutes: 614, goal: 614, percentage: 100 }, total: { minutes: 614, goal: 614, percentage: 100 } },
    { name: 'Liliana Moreno',       email: 'liliantares2002@gmail.com',   level: 'Alto volumen',  weekly: { minutes: 720, goal: 640, percentage: 113 }, total: { minutes: 720, goal: 640, percentage: 113 } },
    { name: 'Lorena Rojas',         email: 'lrojasbu@gmail.com',          level: 'Alto volumen',  weekly: { minutes: 90,  goal: 277, percentage: 32 },  total: { minutes: 90,  goal: 277, percentage: 32 } },
    { name: 'Johan Cruz',           email: 'johancruzh@gmail.com',        level: 'Sostener',      weekly: { minutes: 60,  goal: 123, percentage: 49 },  total: { minutes: 60,  goal: 123, percentage: 49 } },
    { name: 'Susana Panqueva',      email: 'susanapanqueva578@gmail.com', level: 'Activo',        weekly: { minutes: 0,   goal: 248, percentage: 0 },   total: { minutes: 0,   goal: 248, percentage: 0 } },
];

type Screen = 'menu' | 'activity-modal' | 'goal-popup' | 'progress-card' | 'admin-dashboard';

export default function Preview() {
    const [screen, setScreen] = useState<Screen>('menu');
    const [checkin, setCheckin] = useState('');
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [goalInput, setGoalInput] = useState('123');
    const [modifying, setModifying] = useState(false);
    const [challengeTab, setChallengeTab] = useState<'semanal' | 'total'>('semanal');

    const NavBar = () => (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 text-white flex items-center gap-3 px-4 py-2 text-sm">
            <span className="font-bold text-emerald-400">PREVIEW MODE</span>
            <span className="text-slate-400">·</span>
            <button onClick={() => setScreen('menu')} className="text-slate-300 hover:text-white underline">
                ← Menú
            </button>
            <span className="ml-auto text-slate-400 text-xs">Sin conexión a API · Datos de ejemplo</span>
        </div>
    );

    // ── MENU ──────────────────────────────────────────────────────────────────
    if (screen === 'menu') return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg space-y-4">
                <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">DeepEnd · Preview</p>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">Pantallas disponibles</h1>
                    <p className="text-sm text-slate-500 mt-1">Datos de ejemplo, sin necesidad de login</p>
                </div>

                <div className="space-y-2 pt-2">
                    {[
                        { id: 'activity-modal',  label: 'Modal Registrar Actividad',         desc: 'Con pregunta check-in (miércoles)' },
                        { id: 'goal-popup',      label: 'Popup Meta Semanal',                desc: 'Aparece después de registrar actividad' },
                        { id: 'progress-card',   label: 'Tarjeta Progreso Semanal (Front)',  desc: 'Visible en el dashboard del usuario' },
                        { id: 'admin-dashboard', label: 'Dashboard Admin · Reto Físico',     desc: 'Tabla de progreso de participantes' },
                    ].map(s => (
                        <button
                            key={s.id}
                            onClick={() => setScreen(s.id as Screen)}
                            className="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                        >
                            <div>
                                <p className="font-semibold text-slate-800 group-hover:text-emerald-700">{s.label}</p>
                                <p className="text-xs text-slate-400">{s.desc}</p>
                            </div>
                            <span className="text-slate-300 group-hover:text-emerald-500 text-lg">→</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── ACTIVITY MODAL ────────────────────────────────────────────────────────
    if (screen === 'activity-modal') return (
        <div className="min-h-screen bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <NavBar />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden mt-10">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Activity className="text-emerald-500" size={20} />
                        Registrar Actividad Fisica
                    </h3>
                    <button onClick={() => setScreen('menu')} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Check-in semanal */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-sm font-bold text-slate-700 mb-3">¿Cómo va tu semana?</p>
                        <div className="space-y-2">
                            {CHECKIN_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setCheckin(opt.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                        checkin === opt.value
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span>{opt.emoji}</span>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Actividad Realizada</label>
                        <input
                            type="text"
                            value={activity}
                            onChange={e => setActivity(e.target.value)}
                            placeholder="Ej: Correr, Yoga"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" /> Tiempo / Duración (minutos)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            placeholder="Ej: 30"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                        <Upload size={32} className="mb-2 text-slate-400" />
                        <p className="text-sm font-medium">Click para subir foto (Opcional)</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (Max 10MB)</p>
                    </div>

                    <button
                        onClick={() => setScreen('goal-popup')}
                        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={20} /> Guardar Registro
                    </button>
                </div>
            </div>
        </div>
    );

    // ── GOAL POPUP ────────────────────────────────────────────────────────────
    if (screen === 'goal-popup') return (
        <div className="min-h-screen bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <NavBar />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 mt-10">
                <div className="text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="text-lg font-bold text-slate-800">Tu meta esta semana</h3>
                    <p className="text-sm text-slate-500 mt-1">Semana 1 del reto · Revisa si quieres ajustarla</p>
                </div>

                {!modifying ? (
                    <>
                        <div className="bg-emerald-50 rounded-xl px-6 py-4 text-center">
                            <span className="text-3xl font-bold text-emerald-700">123</span>
                            <span className="text-emerald-600 font-medium ml-1">min</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setScreen('menu'); setModifying(false); }}
                                className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                                Acepto esta meta
                            </button>
                            <button
                                onClick={() => setModifying(true)}
                                className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Modificar
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nueva meta en minutos</label>
                            <input
                                type="number"
                                min="1"
                                value={goalInput}
                                onChange={e => setGoalInput(e.target.value)}
                                placeholder="Ej: 150 (min)"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                            />
                            <p className="text-xs text-slate-400 mt-1">Este valor aplica solo para esta semana</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setScreen('menu'); setModifying(false); }}
                                className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                                Guardar meta
                            </button>
                            <button
                                onClick={() => setModifying(false)}
                                className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // ── PROGRESS CARD ─────────────────────────────────────────────────────────
    if (screen === 'progress-card') {
        const pct = 49;
        const exceeded = pct > 100;
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <NavBar />
                <div className="w-full max-w-sm mt-10">
                    <p className="text-xs text-slate-400 mb-3 text-center">Así se ve la tarjeta en el dashboard del usuario</p>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 opacity-60" />
                        <div className="relative z-10">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
                                Reto Físico · Semana 1
                            </p>
                            <h3 className="text-xl font-bold text-slate-800">Tu progreso semanal</h3>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-bold text-slate-800">{pct}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span><span className="font-semibold text-slate-700">60 min</span> registrados</span>
                                <span>Meta: <span className="font-semibold text-slate-700">123 min</span></span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-6 mb-3 text-center">Ejemplo con meta superada (113%)</p>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 opacity-60" />
                        <div className="relative z-10">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Reto Físico · Semana 1</p>
                            <h3 className="text-xl font-bold text-slate-800">Tu progreso semanal</h3>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-end justify-between">
                                <span className="text-4xl font-bold text-emerald-600">113%</span>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mb-1">¡Meta superada!</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '100%' }} />
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span><span className="font-semibold text-slate-700">720 min</span> registrados</span>
                                <span>Meta: <span className="font-semibold text-slate-700">640 min</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
    if (screen === 'admin-dashboard') return (
        <div className="min-h-screen bg-slate-50 p-6">
            <NavBar />
            <div className="max-w-5xl mx-auto mt-14 space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Reto Físico · Desde Aquí</h3>
                            <p className="text-sm text-slate-400 mt-0.5">Progreso de participantes en el reto de 8 semanas</p>
                        </div>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
                            {(['semanal', 'total'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setChallengeTab(t)}
                                    className={`px-4 py-1.5 font-medium transition-colors ${
                                        challengeTab === t ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {t === 'semanal' ? 'Logro semanal' : 'Logro total'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Usuario</th>
                                    <th className="px-6 py-3">Nivel</th>
                                    <th className="px-6 py-3">Minutos</th>
                                    <th className="px-6 py-3">Meta</th>
                                    <th className="px-6 py-3">Progreso</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_CHALLENGE_PARTICIPANTS
                                    .slice()
                                    .sort((a, b) => {
                                        const pA = challengeTab === 'semanal' ? a.weekly.percentage : a.total.percentage;
                                        const pB = challengeTab === 'semanal' ? b.weekly.percentage : b.total.percentage;
                                        return pB - pA;
                                    })
                                    .map((p, idx) => {
                                        const d = challengeTab === 'semanal' ? p.weekly : p.total;
                                        const exceeded = d.percentage > 100;
                                        const barWidth = Math.min(100, d.percentage);
                                        return (
                                            <tr key={p.email} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 text-slate-400 text-xs font-mono">{idx + 1}</td>
                                                <td className="px-6 py-3">
                                                    <p className="font-medium text-slate-900">{p.name}</p>
                                                    <p className="text-xs text-slate-400">{p.email}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{p.level}</span>
                                                </td>
                                                <td className="px-6 py-3 font-semibold text-slate-700">{d.minutes} min</td>
                                                <td className="px-6 py-3 text-slate-500">{d.goal} min</td>
                                                <td className="px-6 py-3 min-w-[160px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${exceeded ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                                                                style={{ width: `${barWidth}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-bold w-10 text-right ${exceeded ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                            {d.percentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
                        {MOCK_CHALLENGE_PARTICIPANTS.length} participantes · Semana 1 de 8
                    </div>
                </div>
            </div>
        </div>
    );

    return null;
}
