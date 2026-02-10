
import React from 'react';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

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
        <div className="flex min-h-screen bg-[#FAFAFA]">
            {/* Sidebar */}
            <div className="hidden lg:block w-72 fixed h-ful">
                <HomeSidebar activeTab="Dashboard" />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-6 lg:p-10">
                <header className="mb-8">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                        <ArrowLeft size={20} /> Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-light text-slate-800">Historial de Actividad</h1>
                    <p className="text-slate-500 mt-2">Tu registro completo de disciplina y progreso.</p>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
                        ))}
                    </div>
                ) : !activities || activities.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                        <p className="text-slate-400 text-lg">Aún no has registrado actividades.</p>
                        <Link to="/dashboard" className="text-emerald-600 font-bold mt-4 inline-block hover:underline">
                            Ir a registrar una
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activities.map((log) => (
                            <div key={log.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                    {log.evidenceUrl ? (
                                        <img
                                            src={log.evidenceUrl}
                                            alt={log.activity}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                                            <Clock size={32} className="mb-2" />
                                            <span className="text-xl font-bold text-slate-500">{log.duration} min</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Clock size={12} /> {log.duration}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <Calendar size={14} />
                                        {new Date(log.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{log.activity}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
