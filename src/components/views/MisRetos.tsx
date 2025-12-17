import React, { useState } from 'react';
import { ArrowLeft, PlayCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { MobileNav } from '../home/MobileNav';

interface ChallengeCardData {
    category: string;
    title: string;
    description: string;
    progress?: number;
    colorClass: string;
    bgClass: string;
    badgeClass: string;
    status: 'active' | 'locked';
}

const ChallengeCard = ({ data, onClick }: { data: ChallengeCardData; onClick?: () => void }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white border ${data.status === 'locked' ? 'border-slate-100 opacity-70' : 'border-slate-100 cursor-pointer'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full`}
        >

            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${data.badgeClass}`}>
                    {data.category}
                </span>
                {data.status === 'active' ? (
                    <PlayCircle className={`w-6 h-6 ${data.colorClass} opacity-80 cursor-pointer hover:opacity-100 transition-opacity`} />
                ) : (
                    <Lock className="w-5 h-5 text-slate-300" />
                )}
            </div>

            <h3 className={`text-xl font-bold text-slate-800 mb-2 ${data.status === 'locked' ? 'text-slate-400' : ''}`}>
                {data.title}
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                {data.description}
            </p>

            {data.status === 'active' ? (
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-slate-400 font-medium">Progreso</span>
                        <span className="text-xs font-bold text-slate-800">{data.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full ${data.bgClass}`}
                            style={{ width: `${data.progress}%` }}
                        ></div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                    <Lock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400">Desbloquea al completar nivel actual</span>
                </div>
            )}
        </div>
    );
};

export default function MisRetos() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'active' | 'completed'>('active');

    const challenges: ChallengeCardData[] = [
        {
            category: 'Finanzas',
            title: 'Auditoría de Gastos Hormiga',
            description: 'Analiza tus pequeños gastos diarios para recuperar control financiero.',
            progress: 33,
            colorClass: 'text-emerald-500',
            bgClass: 'bg-emerald-500',
            badgeClass: 'bg-emerald-50 text-emerald-600',
            status: 'active'
        },
        {
            category: 'Mindset',
            title: 'Diario de Gratitud',
            description: 'Reconfigura tu cerebro para ver lo positivo durante 7 días continuos.',
            progress: 70,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500',
            badgeClass: 'bg-blue-50 text-blue-600',
            status: 'active'
        },
        {
            category: 'Social',
            title: 'Networking Consciente',
            description: 'Conecta con 3 personas clave fuera de tu círculo habitual.',
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500',
            badgeClass: 'bg-purple-50 text-purple-600',
            status: 'locked'
        }
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

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
                            <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex self-start md:self-auto">
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
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {challenges.map((challenge, index) => (
                                <ChallengeCard
                                    key={index}
                                    data={challenge}
                                    onClick={() => {
                                        if (challenge.status === 'active') {
                                            navigate('/challenges/detail');
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <MobileNav />

        </div>
    );
}
