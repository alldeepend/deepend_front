import React from 'react';
import { ArrowLeft, Lock, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { MobileNav } from '../home/MobileNav';

export default function MyJourney() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            <HomeSidebar activeTab="Mi Viaje" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="mb-8">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center text-slate-400 text-sm mb-2 hover:text-slate-600 transition-colors group"
                            >
                                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                Dashboard
                            </button>
                            <h2 className="text-3xl font-light text-slate-800">Mi Viaje</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column - Passport Card */}
                            <div className="lg:col-span-4">
                                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-slate-200 lg:sticky lg:top-8">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold mb-1">Pasaporte DeepEnd</h3>
                                        <p className="text-slate-400 text-sm">Nivel 2: Re-Builder</p>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-emerald-400">1,250</span>
                                            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Puntos de EXP</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                                        <div className="bg-emerald-500 h-3 rounded-full w-[65%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 text-right">750 XP para el siguiente nivel</p>

                                    <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Racha Actual</p>
                                            <p className="text-xl font-bold">5 Días</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Insignias</p>
                                            <p className="text-xl font-bold">12</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Map */}
                            <div className="lg:col-span-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-8 px-4">Mapa de Mundos</h3>

                                <div className="relative pl-4">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-slate-100"></div>

                                    {/* World 1 - Completed */}
                                    <div className="relative flex gap-8 mb-12 opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm mt-1"></div>
                                        <div className="flex-1 pt-0.5">
                                            <h4 className="text-lg font-bold text-slate-700">Mundo 1: El Despertar</h4>
                                            <div className="flex items-center gap-2 mt-1 mb-3">
                                                <span className="text-xs text-emerald-600 font-medium">Completado el 15 de Octubre</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">3 Retos</span>
                                                <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded">100% Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* World 2 - Active */}
                                    <div className="relative flex gap-8 mb-12">
                                        <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-100 shadow-lg shadow-emerald-100 mt-1 animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                                {/* Green glow effect */}
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>

                                                <div className="flex justify-between items-start mb-2 relative z-10">
                                                    <h4 className="text-xl font-bold text-slate-800">Mundo 2: Conexión</h4>
                                                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Actual</span>
                                                </div>

                                                <p className="text-slate-500 text-sm mb-6">Enfocado en reconstruir relaciones y comunicación.</p>

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                        <Target className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                                        <span className="block text-2xl font-bold text-slate-800">2/5</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Retos</span>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                        <Trophy className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                                        <span className="block text-2xl font-bold text-slate-800">3</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Insignias</span>
                                                    </div>
                                                </div>

                                                <button className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                                    Continuar Exploración
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* World 3 - Locked */}
                                    <div className="relative flex gap-8">
                                        <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-slate-200 mt-1 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-bold text-slate-400">Mundo 3: Maestría</h4>
                                                <Lock size={14} className="text-slate-400" />
                                            </div>
                                            <p className="text-sm text-slate-400">Desbloquea al completar Mundo 2</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <MobileNav />

        </div>
    );
};
