import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { StatsCard } from './StatsCard';
import { SocialProfileCard } from './SocialProfileCard';
import { ActiveChallenges } from './ActiveChallenges';
import ActivityLogModal from '../shared/ActivityLogModal';
import RecognitionChestModal from '../shared/RecognitionChestModal';
import { RecentActivities } from './RecentActivities';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

export const DashboardContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecognitionOpen, setIsRecognitionOpen] = useState(false);

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

    const targetChallengeId = '6cae6006-7b14-42ba-ba21-b6f4aeb6fd7c';
    const hasActiveChallenge = challenges?.some((c: any) => c.status === 'active' && c.id === targetChallengeId);

    return (
        <>
            <HomeHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <StatsCard />
                {/* <SocialProfileCard /> */}
            </div>

            {hasActiveChallenge && (
                <div className="mb-8">
                    <button
                        onClick={() => setIsRecognitionOpen(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group"
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
