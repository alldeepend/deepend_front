import React, { useState } from 'react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { MobileNav } from '../home/MobileNav';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
    >
        <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);

export default function Perfil() {
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            <HomeSidebar activeTab="Perfil" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-slate-400 text-sm mb-2 hover:text-slate-600 transition-colors group"
                                >
                                    <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Dashboard
                                </button>
                                <h2 className="text-3xl font-light text-slate-800">Perfil de Viajero</h2>
                            </div>
                            <button className="text-sm font-medium text-slate-400 hover:text-slate-600 underline">
                                Editar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Profile Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center h-full">
                                    <div className="relative mb-6">
                                        <div className="w-32 h-32 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center relative overflow-hidden">
                                            {/* Stylized Avatar Placeholder similar to image */}
                                            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M50 20 L50 40 M30 30 L70 30 M30 50 L70 50 M40 70 L60 70" className="opacity-10" />
                                                {/* Geometric Face */}
                                                <path d="M30 35 L40 60 L50 80 L60 60 L70 35 L50 20 Z" />
                                                <line x1="30" y1="35" x2="70" y2="35" />
                                                <line x1="40" y1="60" x2="60" y2="60" />
                                                <line x1="50" y1="20" x2="50" y2="80" />
                                                <circle cx="40" cy="45" r="3" fill="currentColor" className="text-slate-800" />
                                                <circle cx="60" cy="45" r="3" fill="currentColor" className="text-slate-800" />
                                            </svg>
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-md hover:bg-emerald-600 transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">Alex</h3>
                                    <p className="text-slate-400 text-xs font-medium mb-6">Unido en Septiembre 2024</p>

                                    <div className="flex gap-2">
                                        <span className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full">Re-Builder</span>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full">Lvl 2</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Stats & Settings */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Stats Cards Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">RETOS COMPLETADOS</p>
                                        <p className="text-4xl font-light text-slate-800">12</p>
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">RACHA ACTUAL</p>
                                        <p className="text-4xl font-light text-slate-800 flex items-center gap-2">
                                            5 días <span className="text-2xl">🔥</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Settings Section */}
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex-1">
                                    <h3 className="text-sm font-bold text-slate-900 mb-6">Configuración</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium text-slate-800">Notificaciones diarias</p>
                                                <p className="text-xs text-slate-400">Recordatorios de microretos</p>
                                            </div>
                                            <Toggle
                                                enabled={notificationsEnabled}
                                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium text-slate-800">Modo Oscuro</p>
                                                <p className="text-xs text-slate-400">Interfaz de alto contraste</p>
                                            </div>
                                            <Toggle
                                                enabled={darkModeEnabled}
                                                onChange={() => setDarkModeEnabled(!darkModeEnabled)}
                                            />
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
}
