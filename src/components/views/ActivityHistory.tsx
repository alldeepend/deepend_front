
import React from 'react';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { C } from '../../styles/colors';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ActivityLog {
    id: string;
    activity: string;
    duration: string;
    evidenceUrl: string;
    createdAt: string;
}

export default function ActivityHistory() {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['all-activities'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log`, { // No limit = all
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            return await res.json() as ActivityLog[];
        }
    });

    return (
        <div className="flex min-h-screen" style={{ background: C.bg }}>
            {/* Sidebar */}
            <div className="hidden lg:block w-72 fixed h-ful">
                <HomeSidebar activeTab="Dashboard" />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-6 lg:p-10">
                <header className="mb-8">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 transition-colors hover:opacity-80" style={{ color: C.label }}>
                        <ArrowLeft size={20} /> Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-light" style={{ color: C.text }}>Historial de Actividad</h1>
                    <p className="mt-2" style={{ color: C.textMuted }}>Tu registro completo de disciplina y progreso.</p>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-2xl" style={{ background: C.surface2 }}></div>
                        ))}
                    </div>
                ) : !activities || activities.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border" style={{ background: C.surface1, borderColor: C.border }}>
                        <p className="text-lg" style={{ color: C.label }}>Aún no has registrado actividades.</p>
                        <Link to="/dashboard" className="font-bold mt-4 inline-block hover:underline" style={{ color: C.green }}>
                            Ir a registrar una
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activities.map((log) => (
                            <div key={log.id} className="rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group" style={{ background: C.surface1, borderColor: C.border }}>
                                <div className="aspect-[4/3] relative overflow-hidden" style={{ background: C.surface2 }}>
                                    {log.evidenceUrl ? (
                                        <img
                                            src={log.evidenceUrl}
                                            alt={log.activity}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center transition-colors" style={{ background: C.surface2, color: C.label }}>
                                            <Clock size={32} className="mb-2" />
                                            <span className="text-xl font-bold" style={{ color: C.textMuted }}>{log.duration} min</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Clock size={12} /> {log.duration}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.label }}>
                                        <Calendar size={14} />
                                        {new Date(log.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight" style={{ color: C.text }}>{log.activity}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
