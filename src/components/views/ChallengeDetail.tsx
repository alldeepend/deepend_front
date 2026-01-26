import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, FileText, Download, Zap, Trophy } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/shared/Header';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ChallengeStep {
    id: string;
    text: string;
    completed: boolean;
}

export default function ChallengeDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const challengeId = searchParams.get('id');
    const queryClient = useQueryClient();

    // Fetch challenge details
    const { data: challenge, isLoading } = useQuery({
        queryKey: ['challenge', challengeId],
        queryFn: async () => {
            if (!challengeId) return null;
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges/${challengeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch challenge');
            return await res.json();
        },
        enabled: !!challengeId
    });

    // Toggle Task Mutation
    const toggleTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges/${challengeId}/tasks/${taskId}/toggle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to toggle task');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
        }
    });

    if (!challengeId) return <div>No challenge ID provided</div>;
    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div></div>;
    if (!challenge) return <div>Challenge not found</div>;

    // Calculate progress (using backend data)
    const steps = challenge.tasks || [];
    const completedSteps = steps.filter((s: ChallengeStep) => s.completed).length;
    const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

    const toggleStep = (id: string) => {
        toggleTaskMutation.mutate(id);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Retos" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/challenges')}
                            className="flex items-center text-slate-400 text-sm mb-6 hover:text-slate-600 transition-colors group"
                        >
                            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                            Volver a Retos
                        </button>

                        {/* Hero Section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                            {/* Banner Image - Dynamic based on category if available, or static fallback */}
                            <div className={`h-64 relative overflow-hidden ${challenge.category === 'Finanzas' ? 'bg-emerald-900' : 'bg-slate-900'}`}>
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>

                                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 opacity-90">
                                    {/* Placeholder image logic */}
                                    <img
                                        src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
                                        alt={challenge.title}
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                </div>

                                <div className="absolute bottom-8 left-8 z-20">
                                    <span className="inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase mb-3">
                                        {challenge.category}
                                    </span>
                                    <h1 className="text-4xl font-bold text-white tracking-tight">
                                        {challenge.title}
                                    </h1>
                                </div>
                            </div>

                            {/* Mission & Rewards Row */}
                            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-2">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Misión</h3>
                                    <p className="text-slate-500 text-lg leading-relaxed">
                                        {challenge.description}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 lg:col-span-1">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-slate-400 text-sm">Recompensa</span>
                                        <div className="flex items-center text-emerald-500 font-bold">
                                            <Zap size={16} className="mr-1 fill-current" />
                                            <span>{challenge.xpReward || 150} XP</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Dificultad</span>
                                        <span className="bg-white px-2 py-1 rounded border border-slate-200 text-xs font-bold text-slate-600">Media</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column - Action Steps */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
                                    <div className="flex justify-between items-end mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Pasos de Acción</h3>
                                        <span className="text-sm text-slate-400 font-medium">{completedSteps}/{steps.length} Completados</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>

                                    {/* Steps List */}
                                    <div className="space-y-4">
                                        {steps.map((step: ChallengeStep) => (
                                            <div
                                                key={step.id}
                                                onClick={() => toggleStep(step.id)}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${step.completed
                                                    ? 'bg-white border-emerald-100 shadow-none'
                                                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'
                                                    }`}>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <span className={`text-sm font-medium transition-colors ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                                    }`}>
                                                    {step.text}
                                                </span>
                                            </div>
                                        ))}
                                        {steps.length === 0 && <p className="text-slate-400 text-sm">No hay pasos definidos para este reto aún.</p>}
                                    </div>
                                </div>

                                {/* Submissions Section */}
                                {challenge.submissions && challenge.submissions.length > 0 && (
                                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6">Tus Respuestas</h3>
                                        <div className="space-y-4">
                                            {challenge.submissions.map((sub: any) => (
                                                <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    {(() => {
                                                        try {
                                                            const parsed = JSON.parse(sub.content);
                                                            if (typeof parsed === 'object' && parsed !== null) {
                                                                return (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                                        {Object.entries(parsed).map(([key, value]) => (
                                                                            <div key={key} className="flex flex-col border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                                                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                                                                    {key.replace(/_/g, ' ')}
                                                                                </span>
                                                                                <span className="text-sm font-medium text-slate-700">
                                                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                            return <p className="text-slate-600 text-sm">{sub.content}</p>;
                                                        } catch (e) {
                                                            return <p className="text-slate-600 text-sm">{sub.content}</p>;
                                                        }
                                                    })()}
                                                    <span className="text-xs text-slate-400 mt-2 block">
                                                        Enviado el {new Date(sub.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Resources & Badge */}
                            <div className="space-y-6">
                                {/* Useful Resources */}
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Recursos Útiles</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                            <div className="bg-blue-50 text-blue-500 p-2 rounded-lg">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">Guía de Gastos</h4>
                                                <p className="text-xs text-slate-400">Lectura de 3 min</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                            <div className="bg-red-50 text-red-500 p-2 rounded-lg">
                                                <Download size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">Plantilla Excel</h4>
                                                <p className="text-xs text-slate-400">Descarga .xlsx</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge Reward Preview */}
                                <div className="bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-200 p-6 text-center text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <Trophy size={32} className="mx-auto mb-3 opacity-90" />
                                        <h3 className="font-bold text-lg mb-1">Insignia: Halcón</h3>
                                        <p className="text-emerald-100 text-xs text-opacity-90">Completa este reto para ganar esta insignia.</p>
                                    </div>
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </main>



        </div>
    );
}
