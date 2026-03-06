
import React, { useState } from 'react';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, ArrowLeft, Star, Heart, Activity } from 'lucide-react';
import { Link } from 'react-router';
import Header from '../shared/Header';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ActivityLog {
    id: string;
    activity: string;
    duration: string;
    evidenceUrl: string;
    createdAt: string;
}

interface Recognition {
    id: string;
    question1: string;
    question2: string;
    createdAt: string;
}

export default function ChallengeLogs() {
    const [activeTab, setActiveTab] = useState<'physical' | 'recognition'>('physical');

    const { data: activities, isLoading: loadingActivities } = useQuery({
        queryKey: ['all-activities'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            return await res.json() as ActivityLog[];
        }
    });

    const { data: recognitions, isLoading: loadingRecognitions } = useQuery({
        queryKey: ['all-recognitions'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/recognitions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch recognitions');
            return await res.json() as Recognition[];
        }
    });

    const isLoading = activeTab === 'physical' ? loadingActivities : loadingRecognitions;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden w-full">
                <Header />
            </div>

            {/* Sidebar */}
            <HomeSidebar activeTab="Mis Retos" />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    <header className="mb-8">
                        <Link to="/challenges" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 transition-colors group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver a Mis Retos
                        </Link>
                        <h1 className="text-3xl font-light text-slate-800">Registros de Retos</h1>
                        <p className="text-slate-500 mt-2">Consulta tu historial de progreso y momentos de valor.</p>
                    </header>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('physical')}
                            className={`pb-4 px-2 text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'physical'
                                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Activity size={18} />
                            Actividad Física
                        </button>
                        <button
                            onClick={() => setActiveTab('recognition')}
                            className={`pb-4 px-2 text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'recognition'
                                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Star size={18} />
                            Reconocimientos
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
                            ))}
                        </div>
                    ) : activeTab === 'physical' ? (
                        /* Physical Activities Content */
                        !activities || activities.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <p className="text-slate-400 text-lg">Aún no has registrado actividades físicas.</p>
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
                                                <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                                                    <Clock size={32} className="mb-2" />
                                                    <span className="text-xl font-bold text-slate-500">{log.duration} min</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Clock size={12} /> {log.duration} min
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
                        )
                    ) : (
                        /* Recognition History Content */
                        !recognitions || recognitions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <p className="text-slate-400 text-lg">Aún no tienes registros en tu cofre de reconocimiento.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recognitions.map((rec) => (
                                    <div key={rec.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <Heart size={18} className="fill-emerald-600" />
                                                <span className="font-bold text-sm uppercase tracking-wider">Cofre de Valor</span>
                                            </div>
                                            <div className="text-slate-400 text-xs font-medium">
                                                {new Date(rec.createdAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Merezco ser reconocido por:</h4>
                                                <p className="text-slate-700 text-sm leading-relaxed">{rec.question1}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Me recordó que mi vida tiene valor:</h4>
                                                <p className="text-slate-700 text-sm leading-relaxed">{rec.question2}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}
