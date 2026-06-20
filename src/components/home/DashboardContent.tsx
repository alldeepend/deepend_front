import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { StatsCard } from './StatsCard';
import { SocialProfileCard } from './SocialProfileCard';
import { ActiveChallenges } from './ActiveChallenges';
import ActivityLogModal from '../shared/ActivityLogModal';
import RecognitionChestModal from '../shared/RecognitionChestModal';
import { RecentActivities } from './RecentActivities';
import { ChallengeProgressCard } from './ChallengeProgressCard';
import { Star } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

export const DashboardContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecognitionOpen, setIsRecognitionOpen] = useState(false);
    const [goalInput, setGoalInput] = useState('');
    const [modifyingGoal, setModifyingGoal] = useState(false);
    const [goalPopupVisible, setGoalPopupVisible] = useState(false);
    const queryClient = useQueryClient();

    const targetChallengeId = '6cae6006-7b14-42ba-ba21-b6f4aeb6fd7c';
    const targetTaskId = 'd9f07188-27fd-4252-a2ff-9d61806374f9';

    const { data: challenges } = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch challenges');
            return await res.json();
        }
    });

    const { data: taskStatus } = useQuery({
        queryKey: ['task-status', targetTaskId],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/tasks/${targetTaskId}/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch task status');
            return await res.json();
        }
    });

    const { data: challengePhysical } = useQuery({
        queryKey: ['challenge-me'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenge/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json();
        },
    });

    React.useEffect(() => {
        if (challengePhysical?.showGoalPopup) {
            setGoalPopupVisible(true);
            if (challengePhysical?.goalMinutes) {
                setGoalInput(String(challengePhysical.goalMinutes));
            }
        }
    }, [challengePhysical?.showGoalPopup, challengePhysical?.goalMinutes]);

    const goalMutation = useMutation({
        mutationFn: async (goalMinutes: number) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenge/goal`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalMinutes })
            });
            if (!res.ok) throw new Error('Error al guardar meta');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-me'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
            setModifyingGoal(false);
            setGoalPopupVisible(false);
        }
    });

    const handleConfirmGoal = () => {
        const val = parseInt(goalInput);
        if (!val || val <= 0) { alert('Por favor ingresa un número válido en minutos.'); return; }
        goalMutation.mutate(val);
    };

    const hasActiveChallenge = challenges?.some((c: any) => c.status === 'active' && c.id === targetChallengeId);
    const isTaskCompleted = taskStatus?.completed === true;
    const showGoalPopup = challengePhysical?.isParticipant && challengePhysical?.showGoalPopup;

    return (
        <>
            {/* Goal popup — recurrente cada lunes */}
            {goalPopupVisible && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: '#000000b3', backdropFilter: 'blur(4px)' }}>
                    <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 border" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#52B788' }}>
                                    <circle cx="12" cy="12" r="10"/>
                                    <circle cx="12" cy="12" r="6"/>
                                    <circle cx="12" cy="12" r="2"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                                {modifyingGoal ? 'Ajusta tu meta' : 'Tu meta'}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: '#A8A29E' }}>
                                {modifyingGoal ? 'Ingresa los minutos que quieres lograr en este bloque' : (() => {
                                    const w = challengePhysical?.weekNumber ?? 1;
                                    const blockStart = Math.floor((w - 1) / 3) * 3 + 1;
                                    if (blockStart === 7) return 'Semana 7 y 8 - ¿Quieres mantenerla o ajustarla? (¿Te animas a retarte estas últimas 2 semanas con un 10% más❓ 💪🏻)';
                                    if (blockStart === 4) return 'Semana 4 a la 6 - ¿Quieres mantenerla o ajustarla? (Escucha y Observa tu cuerpo 👂👀 )';
                                    return 'Semana 1 a la 3 - ¿Quieres mantenerla o ajustarla?';
                                })()}
                            </p>
                        </div>
                        {!modifyingGoal ? (
                            <>
                                <div className="rounded-xl px-6 py-4 text-center" style={{ background: '#52B78822' }}>
                                    <span className="text-3xl font-bold" style={{ color: '#52B788' }}>{challengePhysical?.goalMinutes}</span>
                                    <span className="font-medium ml-1" style={{ color: '#52B788' }}>min</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirmGoal}
                                        disabled={goalMutation.isPending}
                                        className="flex-1 text-white font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                                        style={{ background: '#52B788' }}
                                    >
                                        ¡Voy con toda!
                                    </button>
                                    <button
                                        onClick={() => setModifyingGoal(true)}
                                        className="flex-1 border font-semibold py-2.5 rounded-xl transition-colors"
                                        style={{ borderColor: '#333330', color: '#F5F0E8' }}
                                    >
                                        Quiero ajustarla
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#F5F0E8' }}>Nueva meta en minutos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={goalInput}
                                        onChange={e => setGoalInput(e.target.value)}
                                        placeholder="Ej: 150 (min)"
                                        className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2"
                                        style={{ background: '#252020', borderColor: '#333330', color: '#F5F0E8', ['--tw-ring-color' as any]: '#52B788' }}
                                    />
                                    <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>Este valor aplica para las próximas 3 semanas</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleConfirmGoal}
                                        disabled={goalMutation.isPending}
                                        className="flex-1 text-white font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                                        style={{ background: '#52B788' }}
                                    >
                                        {goalMutation.isPending ? 'Guardando...' : 'Guardar meta'}
                                    </button>
                                    <button
                                        onClick={() => setModifyingGoal(false)}
                                        className="flex-1 border font-semibold py-2.5 rounded-xl transition-colors"
                                        style={{ borderColor: '#333330', color: '#F5F0E8' }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <HomeHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <StatsCard />
                <ChallengeProgressCard />
                {/* <SocialProfileCard /> */}
            </div>

            {hasActiveChallenge && isTaskCompleted && (
                <div className="mb-8">
                    <button
                        onClick={() => setIsRecognitionOpen(true)}
                        className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group"
                        style={{ background: 'linear-gradient(to right, #52B788, #1B4332)' }}
                    >
                        <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            <Star size={24} className="fill-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-lg leading-tight">Mi Cofre de Reconocimiento</p>
                            <p className="text-emerald-100 text-xs font-normal">Reconoce lo valioso de tu vida hoy</p>
                        </div>
                    </button>
                </div>
            )}

            <RecentActivities onAddActivity={() => setIsModalOpen(true)} />

            {/* <ActiveChallenges /> */}

            <ActivityLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <RecognitionChestModal
                isOpen={isRecognitionOpen}
                onClose={() => setIsRecognitionOpen(false)}
            />
        </>
    );
};
