import React, { useState } from 'react';
import { ArrowLeft, PlayCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery } from '@tanstack/react-query';
import FinanceDisclaimerModal from '../modals/FinanceDisclaimerModal';
import { useAuth } from '../../store/useAuth';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');


interface ChallengeCardData {
    id: string; // Added id
    category: string;
    title: string;
    description: string;
    progress?: number;
    colorClass: string;
    bgClass: string;
    badgeClass: string;
    status: 'active' | 'locked' | 'completed'; // Added completed
    disclaimerAccepted?: boolean;
    disclaimerRejected?: boolean;
    createdAt?: string;
}

const ChallengeCard = ({ data, onClick }: { data: ChallengeCardData; onClick?: () => void }) => {
    // Treat rejected as "visually locked" but "functionally active" (clickable)
    const isVisuallyLocked = data.status === 'locked' || data.disclaimerRejected;
    const isActuallyLocked = data.status === 'locked'; // Only status='locked' prevents click in logic, but we handle click in parent 

    return (
        <div
            onClick={onClick}
            className={`bg-white border ${isVisuallyLocked ? 'border-slate-100 opacity-70' : 'border-slate-100 cursor-pointer'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full`}
        >

            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${data.status === 'active' && !data.disclaimerRejected ? 'text-[#ed2629]' : 'text-[#57ba47]'}`}>
                    {data.category}
                </span>
                {data.status === 'active' && !data.disclaimerRejected ? (
                    <PlayCircle className={`w-6 h-6 text-[#ed2629] opacity-80 cursor-pointer hover:opacity-100 transition-opacity`} />
                ) : (
                    <Lock className="w-5 h-5 text-[#57ba47]" />
                )}
            </div>

            <h3 className={`text-xl font-bold text-slate-800 mb-2 ${isVisuallyLocked ? 'text-slate-400' : ''}`}>
                {data.title}
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                {data.description}
            </p>

            {/* Show progress/stats ONLY if active AND accepted/not-rejected */}
            {!isVisuallyLocked ? (
                <div>
                    {/* <div className="flex justify-between items-end mb-2">
                        <span className={`text-xs ${data.status === 'active' ? 'text-[#ed2629]' : 'text-[#57ba47]'} font-medium`}>
                            {data.status === 'completed' ? 'Completado' : 'Progreso'}
                        </span>
                        <span className={`text-xs font-bold ${data.status === 'active' ? 'text-[#ed2629]' : 'text-[#57ba47]'}`}>{data.progress}%</span>
                    </div> */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${data.status === 'active' ? 'bg-[#ed2629]' : 'bg-[#57ba47]'}`}
                            style={{ width: `${data.progress}%` }}
                        ></div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                    <Lock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400">
                        {data.disclaimerRejected
                            ? "Acceso restringido (Haz clic para habilitar)"
                            : "Desbloquea al completar nivel actual"}
                    </span>
                </div>
            )}
        </div>
    );
};

import Header from '../../components/shared/Header';

export default function MisRetos() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'active' | 'completed'>('active');

    const { data: challenges, isLoading, refetch } = useQuery<ChallengeCardData[]>({
        queryKey: ['challenges'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch challenges');
            const data = await res.json();

            // Mapping to frontend format/colors (simplified logic for colors)
            return data.map((c: any) => ({
                id: c.id,
                category: c.category,
                title: c.title,
                description: c.description,
                progress: c.progress || 0,
                status: c.status,
                disclaimerAccepted: c.disclaimerAccepted,
                disclaimerRejected: c.disclaimerRejected,
                createdAt: c.createdAt,
                // Color mapping logic could be moved to a helper
                colorClass: c.category === 'Finanzas' ? 'text-emerald-500' : (c.category === 'Mindset' ? 'text-blue-500' : 'text-purple-500'),
                bgClass: c.category === 'Finanzas' ? 'bg-emerald-500' : (c.category === 'Mindset' ? 'bg-blue-500' : 'bg-purple-500'),
                badgeClass: c.category === 'Finanzas' ? 'bg-emerald-50 text-emerald-600' : (c.category === 'Mindset' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'),
            }));
        }
    });

    const filteredChallenges = challenges?.filter(c =>
        filter === 'active' ? (c.status === 'active' || c.status === 'locked' || c.status === 'completed') : c.status === 'completed'
    ).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());


    // --- Disclaimer Logic ---
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null);
    const { user } = useAuth(); // Need to update user context

    const handleChallengeClick = (challenge: ChallengeCardData) => {
        if (challenge.status === 'locked') return;

        // Check PER CHALLENGE for Finanzas category
        if (challenge.category === 'Finanzas' && !challenge.disclaimerAccepted) {
            setPendingChallengeId(challenge.id);
            setShowDisclaimer(true);
            return;
        }

        navigate(`/challenges/detail?id=${challenge.id}`);
    };

    const handleAcceptDisclaimer = async () => {
        if (!pendingChallengeId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/user/accept-finance-disclaimer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challengeId: pendingChallengeId,
                    accepted: true
                })
            });

            if (res.ok) {
                // Refresh challenges to update status
                await refetch();
                setShowDisclaimer(false);
                if (pendingChallengeId) {
                    navigate(`/challenges/detail?id=${pendingChallengeId}`);
                }
            } else {
                console.error("Failed to accept disclaimer");
            }
        } catch (error) {
            console.error("Error accepting disclaimer", error);
        }
    };

    const handleRejectDisclaimer = async () => {
        if (!pendingChallengeId) return;

        try {
            const token = localStorage.getItem('token');
            // Check if we should call backend for rejection (to record it)
            // YES, per requirements: "debe quedar false en la db"
            await fetch(`${host}/api/user/accept-finance-disclaimer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challengeId: pendingChallengeId,
                    accepted: false
                })
            });

            // Just close, stay here
            setShowDisclaimer(false);
            setPendingChallengeId(null);

            // Optionally refetch to ensure local state matches DB (in case we show "Rejected" status in UI later)
            await refetch();

        } catch (error) {
            console.error("Error rejecting disclaimer", error);
            setShowDisclaimer(false);
            setPendingChallengeId(null);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Retos" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-slate-400 text-sm mb-2 hover:text-slate-600 transition-colors group"
                                >
                                    <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Dashboard
                                </button>
                                <h2 className="text-3xl font-light text-slate-800">Mis Retos</h2>
                            </div>

                            {/* Toggle Switch */}
                            {/* <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex self-start md:self-auto">
                                <button
                                    onClick={() => setFilter('active')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'active'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Activos
                                </button>
                                <button
                                    onClick={() => setFilter('completed')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'completed'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Completados
                                </button>
                            </div> */}
                        </div>

                        {/* Grid */}
                        {isLoading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredChallenges?.map((challenge, index) => (
                                    <ChallengeCard
                                        key={index}
                                        data={challenge}
                                        onClick={() => handleChallengeClick(challenge)}
                                    />
                                ))}
                                {filteredChallenges?.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-slate-400">
                                        No hay retos en esta categoría.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <FinanceDisclaimerModal
                isOpen={showDisclaimer}
                onClose={() => setShowDisclaimer(false)}
                onAccept={handleAcceptDisclaimer}
                onReject={handleRejectDisclaimer}
            />

        </div>
    );
}
