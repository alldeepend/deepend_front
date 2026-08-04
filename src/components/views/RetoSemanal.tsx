import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Target, Video, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../shared/Header';
import DynamicForm from '../shared/DynamicForm';
import { C } from '../../styles/colors';
import { weeklyChallengeApi } from '../../services/weeklyChallenge';
import WeeklyChallengeGrid from '../shared/WeeklyChallengeGrid';
import { getYouTubeEmbedUrl } from '../../utils/youtube';
import { INTRO_VIDEO_URL, INTRO_VIDEO_TITLE, INTRO_TEXT_TITLE, INTRO_TEXT_HTML, INTRO_FORM_SCHEMA } from '../../data/weeklyChallengeIntro';
import { journeyApi } from '../../services/journey';
import type { Area } from '../../types/journey';
import WorldsRightSidebar, { earnedBadgesFromAreas, totalXpFromAreas } from './worlds/WorldsRightSidebar';

type Tab = 'actual' | 'historial';

export default function RetoSemanal() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [modifyingGoal, setModifyingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState('');
    const [showIntroForm, setShowIntroForm] = useState(false);
    const [tab, setTab] = useState<Tab>('actual');
    const [areas, setAreas] = useState<Area[]>([]);

    useEffect(() => {
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(() => {});
    }, []);

    const { data: me, isLoading: loadingMe } = useQuery({
        queryKey: ['weekly-challenge-me'],
        queryFn: weeklyChallengeApi.getMe,
    });

    const { data: history } = useQuery({
        queryKey: ['weekly-challenge-progress-history'],
        queryFn: weeklyChallengeApi.getProgressHistory,
        enabled: !!me?.isParticipant && !me?.needsIntro && !me?.cycleExpired && !me?.showGoalPopup,
    });

    const { data: cyclesData } = useQuery({
        queryKey: ['weekly-challenge-cycles'],
        queryFn: weeklyChallengeApi.getCycles,
        enabled: tab === 'historial',
    });

    const activateMutation = useMutation({
        mutationFn: weeklyChallengeApi.activate,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekly-challenge-me'] }),
    });

    const introMutation = useMutation({
        mutationFn: (rawData: any) => weeklyChallengeApi.submitIntro(rawData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-me'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-cycles'] });
            setShowIntroForm(false);
        },
    });

    const goalMutation = useMutation({
        mutationFn: (goalMinutes: number) => weeklyChallengeApi.setGoal(goalMinutes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-me'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-progress-history'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-progress'] });
            setModifyingGoal(false);
        },
    });

    const handleConfirmGoal = () => {
        const val = parseInt(goalInput);
        if (!val || val <= 0) { alert('Por favor ingresa un número válido en minutos.'); return; }
        goalMutation.mutate(val);
    };

    const openModifyGoal = () => {
        setGoalInput(String(me?.goalMinutes ?? ''));
        setModifyingGoal(true);
    };

    if (loadingMe) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }} />
            </div>
        );
    }

    const isRetake = !!me?.cycleExpired;
    const showIntro = me?.isParticipant && (me?.needsIntro || isRetake);
    const showGoalPopup = me?.isParticipant && !me?.needsIntro && !isRetake && (me?.showGoalPopup || modifyingGoal);
    const isFirstGoal = !me?.goalMinutes;
    const embedUrl = getYouTubeEmbedUrl(INTRO_VIDEO_URL);
    // La meta del primer bloque (semanas 1-3) no se puede tocar antes de tiempo —
    // recién se puede modificar a partir de la semana 4, cuando ya se vivió el bloque.
    const canModifyGoal = (me?.weekNumber ?? 0) > 3;

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header dark />
            </div>

            <HomeSidebar activeTab="Reto Semanal" dark />

            {/* Popup de meta semanal */}
            {showGoalPopup && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                    <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" style={{ background: C.surface1 }}>
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <Target size={40} style={{ color: C.green }} />
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: C.text }}>
                                {isFirstGoal ? 'Tu meta para las próximas semanas' : 'Tu meta esta semana'}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                                {isFirstGoal
                                    ? '¿Cuántos minutos a la semana quieres moverte?'
                                    : `Semana ${me?.weekNumber} del ciclo — ¿la mantienes o la ajustas?`}
                            </p>
                        </div>

                        {!isFirstGoal && !modifyingGoal ? (
                            <>
                                <div className="rounded-xl px-6 py-4 text-center" style={{ background: C.forest }}>
                                    <span className="text-3xl font-bold" style={{ color: C.green }}>{me?.goalMinutes}</span>
                                    <span className="font-medium ml-1" style={{ color: C.green }}>min</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => goalMutation.mutate(me!.goalMinutes as number)}
                                        disabled={goalMutation.isPending}
                                        className="flex-1 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                                        style={{ background: C.red }}
                                    >
                                        Acepto esta meta
                                    </button>
                                    <button
                                        onClick={openModifyGoal}
                                        className="flex-1 border font-semibold py-2.5 rounded-xl transition-colors"
                                        style={{ borderColor: C.border, color: C.text, background: C.surface2 }}
                                    >
                                        Quiero cambiarla
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: C.textMuted }}>Minutos por semana</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={goalInput}
                                        onChange={e => setGoalInput(e.target.value)}
                                        placeholder="Ej: 150 (min)"
                                        className="w-full px-4 py-3 rounded-xl border outline-none"
                                        style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                        autoFocus
                                    />
                                    <p className="text-xs mt-1" style={{ color: C.label }}>
                                        Aplica a este bloque de 3 semanas — la puedes ajustar de nuevo en el próximo.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirmGoal}
                                        disabled={goalMutation.isPending}
                                        className="flex-1 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                                        style={{ background: C.red }}
                                    >
                                        {goalMutation.isPending ? 'Guardando...' : 'Guardar meta'}
                                    </button>
                                    {!isFirstGoal && (
                                        <button
                                            onClick={() => setModifyingGoal(false)}
                                            className="flex-1 border font-semibold py-2.5 rounded-xl transition-colors"
                                            style={{ borderColor: C.border, color: C.text, background: C.surface2 }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Formulario de punto de partida */}
            {showIntroForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" style={{ background: C.surface1 }}>
                        <div className="p-6 md:p-8 overflow-y-auto">
                            <DynamicForm
                                schema={INTRO_FORM_SCHEMA}
                                onSubmit={(_data, rawData) => introMutation.mutate(rawData)}
                                onCancel={() => setShowIntroForm(false)}
                                isSubmitting={introMutation.isPending}
                            />
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-sm mb-6 transition-colors group"
                        style={{ color: C.label }}
                    >
                        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>

                    <div className="relative rounded-3xl overflow-hidden mb-8" style={{ border: `1px solid ${C.border}` }}>
                        <img
                            src="/Reto Desde Aquí.png"
                            alt=""
                            className="w-full h-64 sm:h-80 object-cover"
                        />
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                            style={{ background: C.bg + '77' }}
                        >
                            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: C.red }}>
                                A tu ritmo · sin fecha de cierre
                            </p>
                            <h1
                                className="text-3xl sm:text-4xl font-bold max-w-lg leading-tight"
                                style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                            >
                                Reto Semanal
                            </h1>
                        </div>
                    </div>

                    {!me?.isParticipant ? (
                        <div
                            className="rounded-2xl border p-6 text-center"
                            style={{ background: C.surface1, borderColor: C.border }}
                        >
                            <p className="text-sm leading-relaxed mb-5" style={{ color: C.textSec }}>
                                Un reto continuo, a tu propio ritmo: ponte una meta semanal de minutos en
                                movimiento y registra lo que vas logrando. Cada 12 semanas revisas tu punto
                                de partida de nuevo. Empieza el día que tú decidas.
                            </p>
                            <button
                                onClick={() => activateMutation.mutate()}
                                disabled={activateMutation.isPending}
                                className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{ background: C.red }}
                            >
                                {activateMutation.isPending ? 'Activando...' : 'Comenzar mi reto'}
                            </button>
                        </div>
                    ) : showIntro ? (
                        <div className="space-y-4">
                            {isRetake && (
                                <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${C.amber}18`, border: `1px solid ${C.amber}40` }}>
                                    <RotateCcw size={18} style={{ color: C.amber }} />
                                    <p className="text-sm" style={{ color: C.text }}>
                                        Tu ciclo de 12 semanas terminó. Responde de nuevo tu punto de partida para empezar el siguiente.
                                    </p>
                                </div>
                            )}
                            <div className="rounded-2xl p-6" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Video size={16} style={{ color: C.label }} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: C.text }}>{INTRO_VIDEO_TITLE}</h3>
                                </div>
                                {embedUrl && (
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            src={embedUrl}
                                            title={INTRO_VIDEO_TITLE}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl p-6" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: C.text }}>{INTRO_TEXT_TITLE}</h3>
                                <div
                                    className="prose max-w-none leading-relaxed [&_h3]:text-sm [&_h3]:font-normal [&_h3]:mb-3 [&_h3:empty]:mb-0 [&_h3:last-child]:mb-0"
                                    style={{ lineHeight: '1.75', color: C.textMuted }}
                                    dangerouslySetInnerHTML={{ __html: INTRO_TEXT_HTML.replaceAll('&nbsp;', ' ') }}
                                />
                            </div>

                            <button
                                onClick={() => setShowIntroForm(true)}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                                style={{ background: C.red }}
                            >
                                Completar mi punto de partida
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setTab('actual')}
                                    className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                                    style={tab === 'actual'
                                        ? { background: C.red, color: '#fff' }
                                        : { background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
                                >
                                    Ciclo actual
                                </button>
                                <button
                                    onClick={() => setTab('historial')}
                                    className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                                    style={tab === 'historial'
                                        ? { background: C.red, color: '#fff' }
                                        : { background: C.surface2, color: C.textMuted, border: `1px solid ${C.border}` }}
                                >
                                    Historial
                                </button>
                            </div>

                            {tab === 'actual' && !me?.showGoalPopup && history?.isParticipant ? (
                                <>
                                    <WeeklyChallengeGrid history={history} />
                                    {canModifyGoal && (
                                        <button
                                            onClick={openModifyGoal}
                                            className="text-sm font-semibold mt-4"
                                            style={{ color: C.green }}
                                        >
                                            Modificar meta de este bloque
                                        </button>
                                    )}
                                </>
                            ) : null}

                            {tab === 'historial' && (
                                <div className="space-y-3">
                                    {!cyclesData ? (
                                        <p className="text-sm" style={{ color: C.label }}>Cargando...</p>
                                    ) : cyclesData.cycles.length === 0 ? (
                                        <p className="text-sm" style={{ color: C.label }}>
                                            Todavía no hay ciclos anteriores — este es tu primer ciclo.
                                        </p>
                                    ) : (
                                        cyclesData.cycles.map(cycle => (
                                            <div
                                                key={cycle.cycleNumber}
                                                className="rounded-2xl p-5"
                                                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.red }}>
                                                    Ciclo {cycle.cycleNumber}
                                                </p>
                                                <p className="text-xs mb-3" style={{ color: C.label }}>
                                                    Desde {new Date(cycle.startDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                                {cycle.compromiso && (
                                                    <div className="rounded-xl p-3 mb-3" style={{ background: C.surface2 }}>
                                                        <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: C.label }}>Tu compromiso de entonces</p>
                                                        <p className="text-sm" style={{ color: C.textSec }}>{cycle.compromiso}</p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="rounded-lg p-2 text-center" style={{ background: C.surface2 }}>
                                                        <p className="text-sm font-bold" style={{ color: C.text }}>{cycle.totals.totalMinutes}</p>
                                                        <p className="text-[9px] uppercase" style={{ color: C.label }}>Min. totales</p>
                                                    </div>
                                                    <div className="rounded-lg p-2 text-center" style={{ background: C.surface2 }}>
                                                        <p className="text-sm font-bold" style={{ color: C.text }}>{cycle.totals.weeksCompleted}</p>
                                                        <p className="text-[9px] uppercase" style={{ color: C.label }}>Cumplidas</p>
                                                    </div>
                                                    <div className="rounded-lg p-2 text-center" style={{ background: C.surface2 }}>
                                                        <p className="text-sm font-bold" style={{ color: C.text }}>{cycle.totals.weeksLight}</p>
                                                        <p className="text-[9px] uppercase" style={{ color: C.label }}>Ligeras</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <WorldsRightSidebar mode="home" badges={earnedBadgesFromAreas(areas)} totalXp={totalXpFromAreas(areas)} />
        </div>
    );
}
