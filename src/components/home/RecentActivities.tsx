
import React, { useEffect, useMemo, useState } from 'react';
import { C } from '../../styles/colors';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, ArrowRight, PlusCircle, Dumbbell, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');
const CARDS_PER_PAGE = 3;

const MOTIVATIONAL_MESSAGES = [
    'Cada minuto cuenta — registra tu próxima actividad',
    'Tu cuerpo también es parte del viaje',
    '¿Ya te moviste hoy? Déjalo aquí registrado',
];

interface ActivityLog {
    id: string;
    activity: string;
    duration: string;
    evidenceUrl: string;
    createdAt: string;
}

interface RecentActivitiesProps {
    onAddActivity: () => void;
}

function ActivityTile({ activity }: { activity: ActivityLog }) {
    return (
        <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: '#252020' }}>
            {activity.evidenceUrl ? (
                <img src={activity.evidenceUrl} alt={activity.activity} className="w-full h-20 rounded-lg object-cover" />
            ) : (
                <div className="w-full h-20 rounded-lg flex items-center justify-center" style={{ background: '#1E1A1B' }}>
                    <Dumbbell size={24} style={{ color: '#6B6460' }} />
                </div>
            )}
            <div>
                <p className="font-bold text-xs truncate" style={{ color: '#F5F0E8' }}>{activity.activity}</p>
                <div className="flex items-center gap-1 text-[11px] mt-1" style={{ color: '#A8A29E' }}>
                    <Clock size={10} /> {activity.duration} min
                </div>
                <div className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: '#6B6460' }}>
                    <Calendar size={10} /> {new Date(activity.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </div>
            </div>
        </div>
    );
}

function MotivationalTile({ message, onAddActivity }: { message: string; onAddActivity: () => void }) {
    return (
        <button
            onClick={onAddActivity}
            className="rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed transition-colors hover:opacity-80"
            style={{ borderColor: '#333330' }}
        >
            <Sparkles size={20} style={{ color: C.red }} />
            <p className="text-[11px] leading-snug" style={{ color: '#A8A29E' }}>{message}</p>
        </button>
    );
}

export const RecentActivities = ({ onAddActivity }: RecentActivitiesProps) => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['recent-activities'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log?limit=9`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            return await res.json() as ActivityLog[];
        }
    });

    // Páginas de 3 en 3 — si hay más de 3 actividades, se rota entre páginas.
    const pages = useMemo(() => {
        if (!activities || activities.length === 0) return [];
        const chunks: ActivityLog[][] = [];
        for (let i = 0; i < activities.length; i += CARDS_PER_PAGE) chunks.push(activities.slice(i, i + CARDS_PER_PAGE));
        return chunks;
    }, [activities]);

    const [page, setPage] = useState(0);

    useEffect(() => {
        if (pages.length <= 1) return;
        const interval = setInterval(() => setPage(p => (p + 1) % pages.length), 5000);
        return () => clearInterval(interval);
    }, [pages.length]);

    if (isLoading) return <div className="p-4 rounded-2xl shadow-sm border h-64 animate-pulse" style={{ background: '#1E1A1B', borderColor: '#333330' }}></div>;

    if (!activities || activities.length === 0) return (
        <div className="rounded-2xl shadow-sm border p-8 mb-8 text-center" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Comienza tu registro</h3>
            <p className="mb-6" style={{ color: '#A8A29E' }}>Aún no tienes actividades físicas registradas.</p>
            <button
                onClick={onAddActivity}
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-opacity hover:opacity-90"
                style={{ background: C.red }}
            >
                <PlusCircle size={20} />
                Registrar primera actividad
            </button>
        </div>
    );

    const currentPage = pages[page] ?? [];
    const slots: (ActivityLog | null)[] = [...currentPage, ...Array(Math.max(0, CARDS_PER_PAGE - currentPage.length)).fill(null)];

    return (
        <div className="rounded-2xl shadow-sm border p-6 mb-8" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h3 className="text-lg font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Registro Actividad - Retos Físicos</h3>
                <button
                    onClick={onAddActivity}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                    style={{ background: '#EE2A2822', color: C.red }}
                >
                    <PlusCircle size={14} />
                    Registrar Actividad
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {slots.map((activity, idx) => activity
                    ? <ActivityTile key={activity.id} activity={activity} />
                    : <MotivationalTile key={`filler-${idx}`} message={MOTIVATIONAL_MESSAGES[idx % MOTIVATIONAL_MESSAGES.length]} onAddActivity={onAddActivity} />
                )}
            </div>

            {pages.length > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    {pages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage(idx)}
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: idx === page ? 20 : 6, background: idx === page ? C.red : '#333330' }}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Link to="/activities" className="text-sm font-bold flex items-center gap-1 group transition-opacity hover:opacity-80" style={{ color: C.red }}>
                    Ver todas <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};
