import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery } from '@tanstack/react-query';
import { C } from '../../styles/colors';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ChallengeCardData {
    id: string;
    category: string;
    title: string;
    description: string;
    progress?: number;
    status: 'active' | 'locked' | 'completed';
    completedAt?: string | null;
    lastActivityAt?: string | null;
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

const ArchivedChallengeCard = ({ data, onClick }: { data: ChallengeCardData; onClick?: () => void }) => {
    const isDone = data.status === 'completed';
    const dateLabel = isDone
        ? (data.completedAt ? `Completado · ${formatDate(data.completedAt)}` : 'Completado')
        : (data.lastActivityAt ? `Quedó incompleto · última actividad ${formatDate(data.lastActivityAt)}` : 'Quedó incompleto');

    return (
        <div
            onClick={onClick}
            className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
            style={{ background: C.surface1, borderColor: C.border }}
        >
            <span className="text-[10px] font-bold tracking-wider uppercase mb-3" style={{ color: C.label }}>
                {data.category}
            </span>

            <h3 className="text-xl font-bold mb-2" style={{ color: C.text }}>
                {data.title}
            </h3>

            <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: C.textMuted }}>
                {data.description}
            </p>

            <div className="flex items-center gap-2.5 pt-4 border-t" style={{ borderColor: C.border }}>
                <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={isDone ? { background: `${C.green}22`, color: C.green } : { background: `${C.amber}22`, color: C.amber }}
                >
                    {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                </div>
                <span className="text-xs font-medium" style={{ color: C.textSec }}>{dateLabel}</span>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs font-bold" style={{ color: C.label }}>
                Ver expediente <ArrowRight size={14} />
            </div>
        </div>
    );
};

import Header from '../../components/shared/Header';

export default function MisRetos() {
    const navigate = useNavigate();
    const [categoryFilter, setCategoryFilter] = useState('Todas');

    const { data: challenges, isLoading } = useQuery<ChallengeCardData[]>({
        queryKey: ['challenges'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch challenges');
            const data = await res.json();

            return data.map((c: any) => ({
                id: c.id,
                category: c.category,
                title: c.title,
                description: c.description,
                progress: c.progress || 0,
                status: c.status,
                completedAt: c.completedAt,
                lastActivityAt: c.lastActivityAt,
            }));
        }
    });

    // Archivo: solo retos con los que la persona ya interactuó (algo de progreso o completados).
    const archivedChallenges = (challenges ?? [])
        .filter(c => (c.progress ?? 0) > 0 || c.status === 'completed')
        .sort((a, b) => new Date(b.completedAt || b.lastActivityAt || 0).getTime() - new Date(a.completedAt || a.lastActivityAt || 0).getTime());

    const categories = ['Todas', ...Array.from(new Set(archivedChallenges.map(c => c.category)))];

    const filteredChallenges = categoryFilter === 'Todas'
        ? archivedChallenges
        : archivedChallenges.filter(c => c.category === categoryFilter);

    const handleChallengeClick = (challenge: ChallengeCardData) => {
        navigate(`/challenges/detail?id=${challenge.id}`);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Retos" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-sm mb-2 transition-colors group"
                                    style={{ color: C.label }}
                                >
                                    <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Dashboard
                                </button>
                                <h2 className="text-3xl font-light mb-2" style={{ color: C.text }}>Archivo de Retos</h2>
                                <p className="text-sm leading-relaxed max-w-lg" style={{ color: C.textMuted }}>
                                    Cada paso que diste, cada respuesta que dejaste, todo tu recorrido en estos retos
                                    queda guardado aquí, listo para que lo repases cuando quieras.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/challenge-logs')}
                                className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
                                style={{ color: C.green }}
                            >
                                <Star size={15} />
                                Registros de Retos
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* Category filter */}
                        {categories.length > 1 && (
                            <div className="flex gap-2 flex-wrap mb-8">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className="px-4 py-1.5 text-sm font-medium rounded-lg border transition-all"
                                        style={categoryFilter === cat
                                            ? { background: C.surface3, color: C.text, borderColor: '#4A4442' }
                                            : { background: C.surface2, color: C.textMuted, borderColor: C.border }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Grid */}
                        {isLoading ? (
                            <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredChallenges.map((challenge) => (
                                    <ArchivedChallengeCard
                                        key={challenge.id}
                                        data={challenge}
                                        onClick={() => handleChallengeClick(challenge)}
                                    />
                                ))}
                                {filteredChallenges.length === 0 && (
                                    <div className="col-span-full text-center py-12" style={{ color: C.label }}>
                                        Todavía no tienes retos archivados en esta categoría.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
