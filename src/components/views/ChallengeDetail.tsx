import React, { useState } from 'react';
import { ArrowLeft, Trophy, Circle, FileText, Download, Video, Link, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/shared/Header';
import { C } from '../../styles/colors';
import WeeklyProgressSection from '../shared/WeeklyProgressSection';
import { getYouTubeEmbedUrl } from '../../utils/youtube';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ChallengeStep {
    id: string;
    text: string;
    completed: boolean;
}

interface ContentBlock {
    id: string;
    title: string;
    type: 'text' | 'video';
    content: string;
}

interface ChallengeDetail {
    id: string;
    title: string;
    tasks: ChallengeStep[];
    submissions: any[];
    que_es?: string;
    para_que_sirve?: string;
    que_lograra?: string;
    tiempos?: string;
    que_se_requiere?: string;
    que_recibe?: string;
    requerimientos?: string;
    content_blocks?: ContentBlock[];
    disclaimerAccepted?: boolean;
}

const AccordionSection = ({ title, content }: { title: string, content: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left transition-colors"
                style={{ color: C.text }}
            >
                <h3 className="text-md font-bold uppercase tracking-wider" style={{ color: C.text }}>{title}</h3>
                {isOpen ? <ChevronUp style={{ color: C.label }} /> : <ChevronDown style={{ color: C.label }} />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <div
                        className="prose max-w-none leading-relaxed [&_h3]:text-base [&_h3]:font-normal [&_h3]:mb-3 [&_h3:empty]:mb-0 [&_h3:last-child]:mb-0"
                        style={{ lineHeight: '1.75', color: C.textMuted }}
                        dangerouslySetInnerHTML={{ __html: content.replaceAll('&nbsp;', ' ') }}
                    />
                </div>
            )}
        </div>
    );
};

const VideoAccordionSection = ({ title, url }: { title: string, url: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const embedUrl = getYouTubeEmbedUrl(url);
    return (
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left transition-colors"
            >
                <h3 className="text-md font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: C.text }}>
                    <Video size={16} style={{ color: C.label }} />
                    {title}
                </h3>
                {isOpen ? <ChevronUp style={{ color: C.label }} /> : <ChevronDown style={{ color: C.label }} />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    {embedUrl ? (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={embedUrl}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full rounded-xl"
                            />
                        </div>
                    ) : (
                        <p className="text-sm" style={{ color: C.label }}>URL de video no válida.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const PHYSICAL_CHALLENGE_ID = 'dcf4574f-8cd3-4925-b88f-c66df26ed8cc';

export default function ChallengeDetail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const challengeId = searchParams.get('id');
    const [currentFinancialIndex, setCurrentFinancialIndex] = useState(0);
    const [currentResponseIndex, setCurrentResponseIndex] = useState(0);

    // Fetch the full 8-week breakdown (meta vs. registrado) para este participante — solo lectura.
    const { data: progressHistory } = useQuery({
        queryKey: ['challenge-progress-history'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenge/progress/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json();
        },
        enabled: challengeId === PHYSICAL_CHALLENGE_ID,
    });

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
    const areTasksCompleted = stepsSafe.length > 0 && stepsSafe.every((s: any) => s.completed);

    // Special Logic for My Money In Action (4544a365-a761-4678-a420-ccf59eadb9c7)
    // Needs both Tasks + Submission
    const hasSubmission = challenge?.submissions && challenge.submissions.length > 1;
    const isSpecialChallenge = challengeId === '4544a365-a761-4678-a420-ccf59eadb9c7';

    const isTotallyCompletedSafe = isSpecialChallenge
        ? areTasksCompleted && hasSubmission
        : areTasksCompleted;

    if (!challengeId) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.textMuted }}>
            No se proporcionó un reto.
        </div>
    );
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
            <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: `${C.border} ${C.green} ${C.border} ${C.border}` }}
            />
        </div>
    );
    if (!challenge) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.textMuted }}>
            No se encontró este reto.
        </div>
    );

    // Calculate progress (using backend data)
    const steps = challenge.tasks || [];
    const completedSteps = steps.filter((s: ChallengeStep) => s.completed).length;
    const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

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

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Retos" />

            <main className="flex-1 overflow-y-auto relative">
                <div className="max-w-5xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Back Button */}
                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            <button
                                onClick={() => navigate('/challenges')}
                                className="flex items-center text-sm transition-colors group"
                                style={{ color: C.label }}
                            >
                                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                Volver al archivo
                            </button>
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                                style={{ background: `${C.green}1F`, border: `1px solid ${C.green}59`, color: C.green }}
                            >
                                Solo lectura
                            </span>
                        </div>

                        {/* Hero Section */}
                        <div className="rounded-3xl shadow-sm overflow-hidden mb-8" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                            {/* Banner Image - Dynamic based on category if available, or static fallback */}
                            <div className={`h-64 relative overflow-hidden ${challenge.category === 'Finanzas' ? 'bg-emerald-900' : 'bg-slate-900'}`}>
                                {challengeId === 'dcf4574f-8cd3-4925-b88f-c66df26ed8cc' && (
                                    <img
                                        src="/Reto Desde Aquí.png"
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover md:object-center object-left"
                                    />
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>


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
                            {/* <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"> */}

                            {/* <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 lg:col-span-1">
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
                                </div> */}
                            {/* </div> */}
                        </div>
                    </div>

                    {challengeId === PHYSICAL_CHALLENGE_ID && progressHistory?.isParticipant && (
                        <WeeklyProgressSection history={progressHistory} />
                    )}

                    {/* Details Grid - New Fields */}
                    <div className="flex flex-col gap-6 mb-8">


                        <div className="lg:col-span-2">

                            {/* Resultado financiero histórico (solo lectura) */}
                            {(challengeId === 'a3ae5adc-a689-4082-a691-4338000ced3a' || challenge?.title?.includes('En la Orilla') || challenge?.title?.includes('En Nado')) && isTotallyCompletedSafe && (
                                <div className="mt-6 space-y-4">
                                    {/* Financial Summary Slider */}
                                    {financialSummary && (
                                        <div className="rounded-2xl p-6 shadow-sm" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-lg font-bold flex items-center" style={{ color: C.text }}>
                                                    <Trophy style={{ color: C.green }} className="mr-2" size={20} />
                                                    Tu Resultado Financiero
                                                </h4>

                                                {financialSubmissions.length > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setCurrentFinancialIndex(prev => Math.min(prev + 1, financialSubmissions.length - 1))}
                                                            disabled={currentFinancialIndex === financialSubmissions.length - 1}
                                                            className="p-1 rounded-full disabled:opacity-30 transition-colors"
                                                            style={{ color: C.textMuted }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                                        </button>
                                                        <span className="text-xs font-medium whitespace-nowrap" style={{ color: C.textMuted }}>
                                                            {financialSubmissions.length - currentFinancialIndex} / {financialSubmissions.length}
                                                        </span>
                                                        <button
                                                            onClick={() => setCurrentFinancialIndex(prev => Math.max(prev - 1, 0))}
                                                            disabled={currentFinancialIndex === 0}
                                                            className="p-1 rounded-full disabled:opacity-30 transition-colors"
                                                            style={{ color: C.textMuted }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>


                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="p-4 rounded-xl shadow-sm" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                    <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: C.textMuted }}>Flujo de Caja Libre</p>
                                                    <p className="text-2xl font-bold" style={{ color: financialSummary.flujoCaja >= 0 ? C.green : C.red }}>
                                                        {formatCurrency(financialSummary.flujoCaja)}
                                                    </p>
                                                    <p className="text-[10px] mt-1" style={{ color: C.label }}>Ingresos - Gastos - Deudas - Ahorro</p>
                                                </div>
                                                <div className="p-4 rounded-xl shadow-sm" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                    <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: C.textMuted }}>Ratio de Ahorro</p>
                                                    <p className="text-2xl font-bold" style={{ color: financialSummary.ratioAhorro > 0 ? C.green : C.amber }}>
                                                        {formatPercent(financialSummary.ratioAhorro)}
                                                    </p>
                                                    <p className="text-[10px] mt-1" style={{ color: C.label }}>Meta: &gt;20%</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                                <div className="p-3 rounded-lg" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                    <p className="text-xs mb-1" style={{ color: C.label }}>{financialSummary.ingresoNetoMensual ? 'Ingreso Neto' : 'Ingresos'}</p>
                                                    <p className="font-bold" style={{ color: C.text }}>{formatCurrency(financialSummary.ingresoNetoMensual || financialSummary.totalIngresos)}</p>
                                                </div>
                                                <div className="p-3 rounded-lg" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                    <p className="text-xs mb-1" style={{ color: C.label }}>{financialSummary.totalGastosOperativos ? 'Gastos Oper.' : 'Gastos'}</p>
                                                    <p className="font-bold" style={{ color: C.text }}>{formatCurrency(financialSummary.totalGastosOperativos || financialSummary.totalGastos)}</p>
                                                </div>
                                                <div className="p-3 rounded-lg" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                    <p className="text-xs mb-1" style={{ color: C.label }}>Deudas</p>
                                                    <p className="font-bold" style={{ color: C.red }}>{formatCurrency(financialSummary.totalDeudas || 0)}</p>
                                                </div>
                                                <div className="p-3 rounded-lg" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                    <p className="text-xs mb-1" style={{ color: C.label }}>Inversión/Ahorro</p>
                                                    <p className="font-bold" style={{ color: C.green }}>{formatCurrency(financialSummary.totalAhorroInversion || 0)}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs" style={{ color: C.label }}>
                                                    Registrado el {new Date(currentFinancialSubmission.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {challenge.content_blocks && challenge.content_blocks.length > 0 ? (
                            challenge.content_blocks.map((block: ContentBlock) =>
                                block.type === 'video' ? (
                                    <VideoAccordionSection key={block.id} title={block.title} url={block.content} />
                                ) : (
                                    <AccordionSection key={block.id} title={block.title} content={block.content} />
                                )
                            )
                        ) : (
                            <>
                                {challenge.que_es && <AccordionSection title="¿Qué es?" content={challenge.que_es} />}
                                {challenge.para_que_sirve && <AccordionSection title="¿Para qué sirve?" content={challenge.para_que_sirve} />}
                                {challenge.que_lograra && <AccordionSection title="¿Qué lograrás?" content={challenge.que_lograra} />}
                                {challenge.tiempos && <AccordionSection title="Tiempos" content={challenge.tiempos} />}
                                {challenge.que_se_requiere && <AccordionSection title="Alcance y entregable" content={challenge.que_se_requiere} />}
                                {challenge.requerimientos && <AccordionSection title="Requerimientos" content={challenge.requerimientos} />}
                            </>
                        )}

                    </div>

                    {/* Content Grid */}
                    <div className="flex flex-col gap-6 mb-8">

                        {/* Left Column - Action Steps */}
                        <div className="lg:col-span-2">
                            <div className="rounded-3xl shadow-sm p-8 mb-8" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                <div className="flex justify-between items-end mb-6">
                                    <h3 className="text-xl font-bold" style={{ color: C.text }}>Toma acción</h3>
                                    <span className="text-sm font-medium" style={{ color: C.label }}>{completedSteps}/{steps.length} Completados</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full rounded-full h-2 mb-8" style={{ background: C.surface3 }}>
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%`, background: C.green }}
                                    ></div>
                                </div>

                                {/* Steps List — solo lectura */}
                                <div className="space-y-4">
                                    {steps.map((step: any) => (
                                        <div
                                            key={step.id}
                                            className="p-4 rounded-xl border flex items-center gap-4"
                                            style={{
                                                background: step.completed ? C.surface1 : C.surface2,
                                                borderColor: step.completed ? C.forest : C.border
                                            }}
                                        >
                                            <div
                                                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
                                                style={step.completed
                                                    ? { background: C.forest, color: C.green }
                                                    : { background: C.surface3, color: C.label }}
                                            >
                                                {step.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                            </div>
                                            <span
                                                className="flex-1 text-sm font-medium"
                                                style={{ color: step.completed ? C.label : C.text, textDecoration: step.completed ? 'line-through' : 'none' }}
                                            >
                                                {step.text}
                                            </span>
                                        </div>
                                    ))}
                                    {steps.length === 0 && <p className="text-sm" style={{ color: C.label }}>No hay pasos definidos para este reto aún.</p>}
                                </div>
                            </div>

                            {/* Submissions Section - Generic Carrousel (Hidden for Financial Challenge) */}
                            {challengeId !== 'a3ae5adc-a689-4082-a691-4338000ced3a' && genericSubmissions.length > 0 && currentGenericSubmission && (
                                <div className="rounded-3xl shadow-sm p-8" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold" style={{ color: C.text }}>Tus Respuestas</h3>

                                        {/* Controls */}
                                        {genericSubmissions.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentResponseIndex(prev => Math.min(prev + 1, genericSubmissions.length - 1))}
                                                    disabled={currentResponseIndex === genericSubmissions.length - 1}
                                                    className="p-1 rounded-full disabled:opacity-30 transition-colors"
                                                    style={{ color: C.textMuted }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                                </button>
                                                <span className="text-xs font-medium" style={{ color: C.textMuted }}>
                                                    {currentResponseIndex + 1} / {genericSubmissions.length}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentResponseIndex(prev => Math.max(prev - 1, 0))}
                                                    disabled={currentResponseIndex === 0}
                                                    className="p-1 rounded-full disabled:opacity-30 transition-colors"
                                                    style={{ color: C.textMuted }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Slide Content */}
                                    <div className="p-6 rounded-xl min-h-[150px]" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                        {(() => {
                                            const sub = currentGenericSubmission;
                                            try {
                                                const parsed = JSON.parse(sub.content);
                                                // Handle varying structures
                                                let displayContent: any[] = [];

                                                // Case 1: Wrapped in "responses" object (e.g., { responses: [...] })
                                                const content = parsed.responses || parsed;

                                                // Case 2: Array of objects (New Format: [{ question, answer }])
                                                if (Array.isArray(content)) {
                                                    displayContent = content;
                                                }
                                                // Case 3: Object with an 'ordered' property (The new hybrid format for Life Chart)
                                                else if (typeof content === 'object' && content !== null && Array.isArray(content.ordered)) {
                                                    displayContent = content.ordered;
                                                }
                                                // Case 4: Indexed Object (Legacy format: {"0": { question, answer }, "1": ...})
                                                else if (typeof content === 'object' && content !== null) {
                                                    // Check if keys are numeric indices (excluding system keys like taskId)
                                                    const keys = Object.keys(content).filter(k => k !== 'taskId');
                                                    const isIndexed = keys.length > 0 && keys.every(k => !isNaN(parseInt(k)));

                                                    if (isIndexed) {
                                                        // Sort by numeric key to ensure order
                                                        displayContent = keys.sort((a, b) => parseInt(a) - parseInt(b)).map(k => content[k]);
                                                    } else {
                                                        // Fallback: Simple Key-Value Object (e.g., { "Question": "Answer" })
                                                        displayContent = Object.entries(content).map(([key, value]) => {
                                                            if (key === 'taskId') return null; // Skip taskId in fallback too
                                                            return {
                                                                question: key,
                                                                answer: typeof value === 'object' ? JSON.stringify(value) : String(value)
                                                            };
                                                        }).filter(Boolean); // Remove nulls
                                                    }
                                                }

                                                if (displayContent.length > 0) {
                                                    return (
                                                        <div className="space-y-4">
                                                            {displayContent.map((item: any, idx: number) => {
                                                                // Handle if item is simple string (fallback)
                                                                if (typeof item !== 'object') {
                                                                    return <div key={idx} className="text-slate-600">{String(item)}</div>;
                                                                }

                                                                const question = item.question || item.label || `Pregunta ${idx + 1}`;
                                                                const answer = item.answer || item.value || JSON.stringify(item);

                                                                return (
                                                                    <div key={idx} className="pb-3 last:pb-0" style={{ borderBottom: `1px solid ${C.border}` }}>
                                                                        <p className="font-bold text-sm mb-1" style={{ color: C.text }}>{question}</p>
                                                                        <p className="text-sm whitespace-pre-wrap" style={{ color: C.textMuted }}>{String(answer)}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }

                                                return <div className="italic" style={{ color: C.textMuted }}>Formato de respuesta no reconocido.</div>;
                                            } catch (e) {
                                                return <div style={{ color: C.textMuted }}>{sub.content}</div>;
                                            }
                                        })()}
                                    </div>


                                    <div className="mt-4 pt-4 text-right" style={{ borderTop: `1px solid ${C.border}` }}>
                                        <span className="text-xs" style={{ color: C.label }}>
                                            Enviado el {new Date(currentGenericSubmission.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Resources & Badge */}
                        <div className="space-y-6">

                            <div className="rounded-3xl shadow-sm p-6" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.text }}>Recursos Útiles</h3>
                                <div className="space-y-3">
                                    {challenge.resources && challenge.resources.length > 0 ? (
                                        challenge.resources.map((resource: any) => (
                                            <a
                                                key={resource.id}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer group"
                                            >
                                                <div className="p-2 rounded-lg" style={{ background: C.surface2, color: C.textMuted }}>
                                                    {resource.type === 'video' ? <Video size={18} /> :
                                                        resource.type === 'download' ? <Download size={18} /> :
                                                            resource.type === 'link' ? <Link size={18} /> :
                                                                <FileText size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold transition-colors" style={{ color: C.text }}>{resource.title}</h4>
                                                    <p className="text-xs" style={{ color: C.label }}>{resource.description || resource.category}</p>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-xs italic" style={{ color: C.label }}>No hay recursos disponibles para este reto.</p>
                                    )}
                                </div>
                            </div>

                            {/* Allies Section */}
                            <div className="rounded-3xl shadow-sm p-6" style={{ background: C.surface1, border: `1px solid ${C.border}` }}>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.text }}>Aliados</h3>
                                <div className="space-y-3">
                                    {challenge.allies && challenge.allies.length > 0 ? (
                                        challenge.allies.map((ally: any) => (
                                            <a
                                                key={ally.id}
                                                href={ally.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group"
                                            >
                                                {ally.logoUrl ? (
                                                    <div className="w-10 h-10 rounded-lg p-1 flex items-center justify-center" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                                                        <img src={ally.logoUrl} alt={ally.name} className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg p-1 flex items-center justify-center font-bold" style={{ background: C.forest, color: C.green, border: `1px solid ${C.forest}` }}>
                                                        {ally.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-bold transition-colors" style={{ color: C.text }}>{ally.name}</h4>
                                                    <p className="text-xs" style={{ color: C.label }}>{ally.category}</p>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-xs italic" style={{ color: C.label }}>No hay aliados asociados a este reto.</p>
                                    )}
                                </div>
                            </div>


                            {/* <div className="bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-200 p-6 text-center text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <Trophy size={32} className="mx-auto mb-3 opacity-90" />
                                    <h3 className="font-bold text-lg mb-1">Insignia: Halcón</h3>
                                    <p className="text-emerald-100 text-xs text-opacity-90">Completa este reto para ganar esta insignia.</p>
                                </div>

                                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                            </div> */}
                        </div>

                    </div>

                </div >
            </main >



        </div >
    );
}
