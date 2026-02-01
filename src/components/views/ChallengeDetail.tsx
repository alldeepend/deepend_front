
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Trophy, Zap, Download } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import DynamicForm from '../shared/DynamicForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/shared/Header';
import { useAuth } from '../../store/useAuth';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ChallengeStep {
    id: string;
    text: string;
    completed: boolean;
}

interface ChallengeDetail {
    id: string;
    title: string;
    tasks: ChallengeStep[];
    submissions: any[];
    // New fields
    que_es?: string;
    para_que_sirve?: string;
    que_lograra?: string;
    tiempos?: string;
    que_se_requiere?: string;
    que_recibe?: string;
    requerimientos?: string;
}

export default function ChallengeDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const challengeId = searchParams.get('id');
    const queryClient = useQueryClient();
    const [currentFinancialIndex, setCurrentFinancialIndex] = useState(0);
    const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
    const { user } = useAuth();
    const [hasFinancialDraft, setHasFinancialDraft] = useState(false);

    // --- Auto Reload Logic (Moved to Top) ---
    const [shouldReloadOnComplete, setShouldReloadOnComplete] = useState(false);

    // Helper to calculate completion safely even before full data
    // We can't access 'challenge' directly if it's not loaded, but we can check if it exists in the effect

    // Check for draft
    React.useEffect(() => {
        if (user?.id) {
            const draft = localStorage.getItem(`financial_assessment_${user.id} _ingresos`);
            if (draft) {
                setHasFinancialDraft(true);
            }
        }
    }, [user?.id]);

    // Fetch challenge details
    const { data: challenge, isLoading } = useQuery({
        queryKey: ['challenge', challengeId],
        queryFn: async () => {
            if (!challengeId) return null;
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges/${challengeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.error("Challenge Detail Fetch Error:", res.status, res.statusText);
                const errorBody = await res.text();
                console.error("Error Body:", errorBody);
                throw new Error('Failed to fetch challenge');
            }
            const data = await res.json();
            return data;
        },
        enabled: !!challengeId
    });

    const stepsSafe = challenge?.tasks || [];
    const isTotallyCompletedSafe = stepsSafe.length > 0 && stepsSafe.every((s: any) => s.completed);

    // 1. Enable reload trigger ONLY if we start with an incomplete challenge
    React.useEffect(() => {
        if (!isLoading && challenge && !isTotallyCompletedSafe) {
            setShouldReloadOnComplete(true);
        }
    }, [isLoading, challenge, isTotallyCompletedSafe]);

    // 2. Trigger reload if we were tracking (started incomplete) and now it is complete
    React.useEffect(() => {
        if (shouldReloadOnComplete && isTotallyCompletedSafe) {
            window.location.reload();
        }
    }, [shouldReloadOnComplete, isTotallyCompletedSafe]);

    // Toggle Task Mutation
    const toggleTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host} /api/challenges / ${challengeId} /tasks/${taskId}/toggle`, {
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

    // --- Dynamic Form Logic (Moved to top level) ---
    const [activeTaskForm, setActiveTaskForm] = useState<{ id: string, schema: any } | null>(null);

    const submitFormMutation = useMutation({
        mutationFn: async ({ taskId, data }: { taskId: string, data: any }) => {
            const token = localStorage.getItem('token');

            // 1. Save Submission
            const resSub = await fetch(`${host}/api/challenges/${challengeId}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    responses: {
                        taskId: taskId,
                        ...data
                    }
                })
            });
            if (!resSub.ok) throw new Error('Failed to save submission');

            // 2. Mark Task as Complete (if not already)
            // Note: We need to find the task to check completion, but inside mutation we just blindly toggle if needed or rely on backend idempotency.
            // For safety, let's just toggle.
            const resToggle = await fetch(`${host}/api/challenges/${challengeId}/tasks/${taskId}/toggle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!resToggle.ok) throw new Error('Failed to complete task');

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
            setActiveTaskForm(null);
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

    // Helper to get financial assessments (parsed)
    const financialSubmissions = challenge.submissions && challenge.submissions.length > 0
        ? challenge.submissions
            .map((s: any) => {
                try {
                    return { ...s, parsedContent: JSON.parse(s.content) };
                } catch {
                    return { ...s, parsedContent: null };
                }
            })
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];

    const currentFinancialSubmission = financialSubmissions[currentFinancialIndex];
    const financialSummary = currentFinancialSubmission?.parsedContent?.responses?.summary || currentFinancialSubmission?.parsedContent?.summary;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
    };

    const formatPercent = (val: number) => {
        return `${(val || 0).toFixed(1)}%`;
    };

    // Generic submissions (for non-financial or fallback)
    const genericSubmissions = challenge.submissions || [];
    const currentGenericSubmission = genericSubmissions[currentResponseIndex];

    const handleTaskClick = (task: any) => {
        if (task.formSchema) {
            // Open Form
            setActiveTaskForm({ id: task.id, schema: task.formSchema });
        } else {
            // Standard Toggle
            toggleStep(task.id);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Retos" />

            <main className="flex-1 overflow-y-auto relative">
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

                                {/* <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 opacity-90">
                                  
                                    <img
                                        src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
                                        alt={challenge.title}
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                </div> */}

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
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">¿Qué es?</h3>
                                    <div
                                        className="text-slate-500 text-md leading-relaxed prose prose-slate"
                                        dangerouslySetInnerHTML={{ __html: challenge.que_es || '' }}
                                    />

                                    {/* Conditional Financial Assessment Button */}
                                    {challengeId === 'a3ae5adc-a689-4082-a691-4338000ced3a' && (
                                        <div className="mt-6 space-y-6">
                                            <button
                                                onClick={() => navigate(`/challenges/financial-assessment?challengeId=${challengeId}`)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                                {hasFinancialDraft ? 'Continuar Evaluación' : (financialSubmissions.length > 0 ? 'Nueva Evaluación' : 'Realizar Evaluación Financiera')}
                                            </button>

                                            {/* Financial Summary Slider */}
                                            {financialSummary && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-lg font-bold text-slate-800 flex items-center">
                                                            <Trophy className="text-emerald-500 mr-2" size={20} />
                                                            Tu Resultado Financiero
                                                        </h4>

                                                        {financialSubmissions.length > 1 && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setCurrentFinancialIndex(prev => Math.min(prev + 1, financialSubmissions.length - 1))}
                                                                    disabled={currentFinancialIndex === financialSubmissions.length - 1}
                                                                    className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-30 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                                                </button>
                                                                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                                                    {financialSubmissions.length - currentFinancialIndex} / {financialSubmissions.length}
                                                                </span>
                                                                <button
                                                                    onClick={() => setCurrentFinancialIndex(prev => Math.max(prev - 1, 0))}
                                                                    disabled={currentFinancialIndex === 0}
                                                                    className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-30 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>


                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Flujo de Caja Libre</p>
                                                            <p className={`text-2xl font-bold ${financialSummary.flujoCaja >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {formatCurrency(financialSummary.flujoCaja)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-1">Ingresos - Gastos - Deudas - Ahorro</p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Ratio de Ahorro</p>
                                                            <p className={`text-2xl font-bold ${financialSummary.ratioAhorro > 0 ? 'text-emerald-600' : 'text-yellow-600'}`}>
                                                                {formatPercent(financialSummary.ratioAhorro)}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-1">Meta: &gt;20%</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                                                            <p className="text-slate-400 text-xs mb-1">{financialSummary.ingresoNetoMensual ? 'Ingreso Neto' : 'Ingresos'}</p>
                                                            <p className="font-bold text-slate-700">{formatCurrency(financialSummary.ingresoNetoMensual || financialSummary.totalIngresos)}</p>
                                                        </div>
                                                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                                                            <p className="text-slate-400 text-xs mb-1">{financialSummary.totalGastosOperativos ? 'Gastos Oper.' : 'Gastos'}</p>
                                                            <p className="font-bold text-slate-700">{formatCurrency(financialSummary.totalGastosOperativos || financialSummary.totalGastos)}</p>
                                                        </div>
                                                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                                                            <p className="text-slate-400 text-xs mb-1">Deudas</p>
                                                            <p className="font-bold text-red-500">{formatCurrency(financialSummary.totalDeudas || 0)}</p>
                                                        </div>
                                                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                                                            <p className="text-slate-400 text-xs mb-1">Inversión/Ahorro</p>
                                                            <p className="font-bold text-emerald-600">{formatCurrency(financialSummary.totalAhorroInversion || 0)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-xs text-slate-400">
                                                            Registrado el {new Date(currentFinancialSubmission.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                    </div>

                    {/* Details Grid - New Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {challenge.para_que_sirve && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-2">¿Para qué sirve?</h4>
                                <div className="text-slate-600 text-sm prose prose-sm" dangerouslySetInnerHTML={{ __html: challenge.para_que_sirve }} />
                            </div>
                        )}
                        {challenge.que_lograra && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-2">¿Qué lograrás?</h4>
                                <div className="text-slate-600 text-sm prose prose-sm" dangerouslySetInnerHTML={{ __html: challenge.que_lograra }} />
                            </div>
                        )}
                        {challenge.tiempos && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-2">Tiempos</h4>
                                <div className="text-slate-600 text-sm prose prose-sm" dangerouslySetInnerHTML={{ __html: challenge.tiempos }} />
                            </div>
                        )}
                        {challenge.que_se_requiere && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-2">Alcance y entregable</h4>
                                <div className="text-slate-600 text-sm prose prose-sm" dangerouslySetInnerHTML={{ __html: challenge.que_se_requiere }} />
                            </div>
                        )}
                        {/* {challenge.que_recibe && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-2">¿Qué recibes?</h4>
                                <div className="text-slate-600 text-sm prose prose-sm" dangerouslySetInnerHTML={{ __html: challenge.que_recibe }} />
                            </div>
                        )} */}
                        {challenge.requerimientos && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-2">Requerimientos</h4>
                                <div className="text-slate-600 text-sm prose prose-sm" dangerouslySetInnerHTML={{ __html: challenge.requerimientos }} />
                            </div>
                        )}
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
                                    {steps.map((step: any) => (
                                        <div
                                            key={step.id}
                                            onClick={() => handleTaskClick(step)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${step.completed
                                                ? 'bg-white border-emerald-100 shadow-none'
                                                : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-[#ed2629]'
                                                }`}>
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-medium transition-colors ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                                    }`}>
                                                    {step.text}
                                                </span>
                                                {step.formSchema && !step.completed && (
                                                    <span className="block text-xs text-[#ed2629] font-bold mt-1">Requiere completar formulario</span>
                                                )}
                                            </div>
                                            {step.formSchema && (
                                                <div className="text-slate-400">
                                                    <FileText size={16} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {steps.length === 0 && <p className="text-slate-400 text-sm">No hay pasos definidos para este reto aún.</p>}
                                </div>
                            </div>

                            {/* Submissions Section - Generic Carrousel (Hidden for Financial Challenge) */}
                            {challengeId !== 'a3ae5adc-a689-4082-a691-4338000ced3a' && genericSubmissions.length > 0 && currentGenericSubmission && (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Tus Respuestas</h3>

                                        {/* Controls */}
                                        {genericSubmissions.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentResponseIndex(prev => Math.min(prev + 1, genericSubmissions.length - 1))} // Note: "Previous" in time means higher index in filtered/sorted array usually? Wait, genericSubmissions is raw from API potentially unsorted or sorted by backend.
                                                    // Assuming backend returns newest last? or usually newest first? Let's assume standard array order.
                                                    // Actually, let's implement safe bounds for generic carousel.
                                                    disabled={currentResponseIndex === genericSubmissions.length - 1}
                                                    className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                                </button>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {currentResponseIndex + 1} / {genericSubmissions.length}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentResponseIndex(prev => Math.max(prev - 1, 0))}
                                                    disabled={currentResponseIndex === 0}
                                                    className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Slide Content */}
                                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 min-h-[150px]">
                                        {(() => {
                                            const sub = currentGenericSubmission;
                                            try {
                                                const parsed = JSON.parse(sub.content);
                                                // Handle nested responses if standard dynamic form
                                                const displayContent = parsed.responses || parsed;

                                                if (typeof displayContent === 'object' && displayContent !== null) {
                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                            {Object.entries(displayContent).map(([key, value]) => {
                                                                // Skip taskId
                                                                if (key === 'taskId') return null;

                                                                return (
                                                                    <div key={key} className="flex flex-col border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                                                            {key.replace(/_/g, ' ')}
                                                                        </span>
                                                                        <span className="text-sm font-medium text-slate-700">
                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }
                                                return <p className="text-slate-600 text-sm whitespace-pre-wrap">{sub.content}</p>;
                                            } catch (e) {
                                                return <p className="text-slate-600 text-sm whitespace-pre-wrap">{sub.content}</p>;
                                            }
                                        })()}

                                        <div className="mt-4 pt-4 border-t border-slate-200 text-right">
                                            <span className="text-xs text-slate-400">
                                                Enviado el {new Date(currentGenericSubmission.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Resources & Badge */}
                        {/* <div className="space-y-6">
                            
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

                           
                            <div className="bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-200 p-6 text-center text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <Trophy size={32} className="mx-auto mb-3 opacity-90" />
                                    <h3 className="font-bold text-lg mb-1">Insignia: Halcón</h3>
                                    <p className="text-emerald-100 text-xs text-opacity-90">Completa este reto para ganar esta insignia.</p>
                                </div>
                                
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                            </div>
                        </div> */}

                    </div>

                </div>

                {/* MODAL FORM OVERLAY */}
                {activeTaskForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="p-6 md:p-8 overflow-y-auto">
                                <DynamicForm
                                    schema={activeTaskForm.schema}
                                    onSubmit={(data) => submitFormMutation.mutate({ taskId: activeTaskForm.id, data })}
                                    onCancel={() => setActiveTaskForm(null)}
                                    isSubmitting={submitFormMutation.isPending}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>



        </div >
    );
}
