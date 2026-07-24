import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../../home/HomeSidebar';
import Header from '../../shared/Header';
import { ArrowLeft, CheckCircle2, Share2, Bell, Wallet, PiggyBank, Globe } from 'lucide-react';
import { useAuth } from '../../../store/useAuth';
import { C } from '../../../styles/colors';

// Step Types based on flowcharts
type StepId =
    | 'START'
    | 'INTRO_DECISION'      // Step 1
    | 'IDENTIFY_EXPENSES'   // Step 2
    | 'SMART_OBJECTIVE'     // Step 3
    | 'DATE_SELECTION'      // Step 3.1 - 3.3
    | 'SELECT_EXPENSES'     // Step 4 (Checkboxes)
    | 'DEPOSIT_PLAN'        // Step 5 (Has platform?)
    | 'PLATFORM_INPUT'      // Step 5.1 (Yes -> Input name -> Reminders)
    | 'GLOBAL66_INFO'       // Step 5.2 (No -> G66 Pitch) & Step 6 in Image 2
    | 'GLOBAL66_DECISION'   // Step 7 (Image 2) - Decision after info
    | 'GLOBAL66_INSTRUCTIONS' // Step 6.1
    | 'OTHER_PLATFORM_INPUT'  // Step 6.2
    | 'REMINDERS'           // Step 6.3 / 9
    | 'REMINDER_DATE_SELECTION' // Step 6.3 - Date Selection
    | 'FINAL_TIPS'          // Step 7 (Image 3 - Últimos Ajustes)
    | 'FEEDBACK'            // Step 6.4 (If rejected)
    | 'SUBMISSION_SUCCESS';

export default function GastoHormiga() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<StepId>('START');
    const [history, setHistory] = useState<StepId[]>([]);
    const [answers, setAnswers] = useState<any>({
        selected_expenses: []
    });

    const handleAnswer = (key: string, value: any) => {
        setAnswers((prev: any) => ({ ...prev, [key]: value }));
    };

    const toggleExpense = (expense: string) => {
        setAnswers((prev: any) => {
            const current = prev.selected_expenses || [];
            if (current.includes(expense)) {
                return { ...prev, selected_expenses: current.filter((e: string) => e !== expense) };
            } else {
                return { ...prev, selected_expenses: [...current, expense] };
            }
        });
    };

    const goToStep = (nextStep: StepId) => {
        setHistory(prev => [...prev, currentStep]);
        setCurrentStep(nextStep);
        window.scrollTo(0, 0);
    };

    const saveReminders = async () => {
        if (!user?.id) return;

        // Only if reminders were accepted
        if (answers.reminders) {
            const remindersToSave = [];

            // 1. Action Date
            if (answers.action_date) {
                remindersToSave.push({
                    userId: user.id,
                    title: 'Tu cita para tomar Acción (Gasto Hormiga)',
                    description: `Objetivo: ${answers.smart_objective || 'Sin especificar'}`,
                    type: 'ONE_TIME',
                    date: answers.action_date,
                    time: answers.action_time || 'Mañana',
                    source: 'CHALLENGE_GASTO_HORMIGA',
                    sourceId: 'gasto_hormiga'
                });
            }

            // 2. Plan B Date
            if (answers.plan_b_date) {
                remindersToSave.push({
                    userId: user.id,
                    title: 'Plan B: Acción Financiera',
                    description: 'Recuperación de la acción no realizada (Gasto Hormiga).',
                    type: 'ONE_TIME',
                    date: answers.plan_b_date,
                    time: answers.action_time || 'Mañana',
                    source: 'CHALLENGE_GASTO_HORMIGA',
                    sourceId: 'gasto_hormiga'
                });
            }

            // 3. Monthly Reminder (if selected)
            if (answers.reminder_day) {
                remindersToSave.push({
                    userId: user.id,
                    title: 'Recordatorio Mensual DeepEnd (Gasto Hormiga)',
                    description: 'Seguimiento de disminución de gastos hormiga.',
                    type: 'RECURRING_MONTHLY',
                    dayOfMonth: answers.reminder_day,
                    time: 'Mañana',
                    source: 'CHALLENGE_GASTO_HORMIGA',
                    sourceId: 'gasto_hormiga'
                });
            }

            if (remindersToSave.length > 0) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                    await fetch(`${API_URL}/reminders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(remindersToSave)
                    });
                } catch (error) {
                    console.error('Error saving reminders:', error);
                }
            }
        }
    };

    const saveSubmission = async () => {
        if (!user?.id) return;

        // Challenge ID for Gasto Hormiga (Hardcoded or fetched)
        // Ideally should be dynamic, but for now specific ID or slug
        // Assuming we need a challenge ID to post to /api/challenges/:id/submissions
        // Let's use a known ID or fetch it. If it's a "Challenge", it should have an ID.
        // For now, let's try to key off the known ID from DB or context, otherwise we might fail.
        // If this page is standalone, maybe we need to find the ID first?
        // Let's assume the ID is passed or known. If not, we might need to fetch it by title?
        // User asked for "Gasto Hormiga" specifically.
        // Let's fetch the ID by title first if we don't have it, or use a placeholder if the backend handles it.
        // Actually the backend route is /api/challenges/:id/submissions.
        // We'll try to find it via API or use a constant if we knew it.
        // Let's add a robust lookup.

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            // 1. Get Challenge ID (Quick lookup by title to be safe)
            const challengesRes = await fetch(`${API_URL}/challenges`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const challenges = await challengesRes.json();
            // User requested to save as "My Money In Action" submission
            const challenge = challenges.find((c: any) => c.title.toLowerCase().includes("my money") || c.title.toLowerCase().includes("action"));

            if (!challenge) {
                console.error("Challenge My Money Not Found (for Gasto Hormiga submission)");
                return;
            }

            // 2. Build Ordered Answers
            const orderedResponses = [];

            // Add context header
            orderedResponses.push({
                question: "Fluxo Origen",
                answer: "Gasto Hormiga"
            });

            // Step 1: Pagar por ver
            if (answers.intro_decision !== undefined) {
                orderedResponses.push({
                    question: "¿Te gustaría saber cuál es esa opción?",
                    answer: answers.intro_decision ? "Sí" : "No"
                });
            }

            // Step 2: Identificar Gastos (Checkboxes)
            if (answers.selected_expenses && answers.selected_expenses.length > 0) {
                orderedResponses.push({
                    question: "Identifica tus gastos hormiga",
                    answer: answers.selected_expenses.join(", ")
                });

                // If "Otro", include custom text? (Not in current UI but good practice)
            }

            // Step 3: Objetivo SMART
            if (answers.smart_objective) {
                orderedResponses.push({
                    question: "Define tu objetivo (SMART)",
                    answer: answers.smart_objective
                });
            }

            // Step 3.1: Date Selections
            if (answers.action_date) {
                orderedResponses.push({
                    question: "Fecha de inicio",
                    answer: answers.action_date
                });
            }

            // Step 3.3: Action Time
            if (answers.action_time) {
                orderedResponses.push({
                    question: "Hora de acción",
                    answer: answers.action_time
                });
            }

            // Step 5: Deposit Plan (Has Platform?)
            if (answers.has_platform !== undefined) {
                orderedResponses.push({
                    question: "¿Ya tienes cuenta en alguna plataforma?",
                    answer: answers.has_platform ? "Sí" : "No"
                });
            }

            // Step 5.1: Platform Name
            if (answers.platform_name) {
                orderedResponses.push({
                    question: "¿Cuál plataforma usas?",
                    answer: answers.platform_name
                });
            }

            // Global 66 Decision (Old Key - Keeping for backward compatibility if needed, but new logic uses specific keys)
            if (answers.global66_decision) {
                orderedResponses.push({
                    question: "¿Te interesa abrir cuenta en Global66?",
                    answer: answers.global66_decision
                });
            }

            // New Fields - Platform Decision & Names
            if (answers.platform_decision_initial) {
                orderedResponses.push({
                    question: "¿Ya tienes cuenta destinada?",
                    answer: answers.platform_decision_initial
                });
            }
            if (answers.user_platform_name) {
                orderedResponses.push({
                    question: "Plataforma del Usuario",
                    answer: answers.user_platform_name
                });
            }
            if (answers.global66_decision_final) {
                orderedResponses.push({
                    question: "Decisión Final (Global66)",
                    answer: answers.global66_decision_final
                });
            }
            if (answers.other_platform_name_g66) {
                orderedResponses.push({
                    question: "Otra Plataforma (Alternativa a G66)",
                    answer: answers.other_platform_name_g66
                });
            }

            // Reminders
            if (answers.reminders !== undefined) {
                orderedResponses.push({
                    question: "¿Deseas activar recordatorios?",
                    answer: answers.reminders ? "Sí" : "No"
                });
            }

            if (answers.reminder_day) {
                orderedResponses.push({
                    question: "Día del mes para recordatorio",
                    answer: answers.reminder_day
                });
            }


            // Feedback (if any)
            if (answers.feedback_impediment) {
                orderedResponses.push({
                    question: "¿Qué te impide dar el paso ahora?",
                    answer: answers.feedback_impediment
                });
            }

            // 3. Send Submission
            await fetch(`${API_URL}/challenges/${challenge.id}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ responses: orderedResponses })
            });

        } catch (error) {
            console.error('Error saving submission:', error);
        }
    };

    const goBack = () => {
        if (history.length === 0) {
            navigate('/challenges'); // Or back to MyMoneyInAction if preferred
            return;
        }
        const prevStep = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCurrentStep(prevStep);
        window.scrollTo(0, 0);
    };

    // Helper to calculate next 7 days
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d.toISOString().split('T')[0];
    });

    const renderContent = () => {
        switch (currentStep) {
            case 'START':
                return (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: C.forest, color: C.green }}>
                            <PiggyBank size={40} />
                        </div>
                        <h1 className="text-4xl font-bold mb-6" style={{ color: C.text }}>Activa tu Reto: <br /> <span style={{ color: C.green }}>Ahorra con Propósito</span> 🐜</h1>
                        <p className="text-lg mb-8 leading-relaxed" style={{ color: C.textMuted }}>
                            "Cada paso financiero que demos, siempre será un primer paso que convierte nuestra intención en acción y esa acción en un Hábito recurrente."
                        </p>
                        <button
                            onClick={() => goToStep('INTRO_DECISION')}
                            className="text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                            style={{ background: C.red }}
                        >
                            Comenzar Reto
                        </button>
                    </div>
                );

            case 'INTRO_DECISION': // Step 1
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 1: Decisión</span>
                        <h2 className="text-2xl font-bold mt-2 mb-6" style={{ color: C.text }}>¿Quieres saber cuál es la opción?</h2>
                        <p className="mb-6" style={{ color: C.textMuted }}>Sabemos que no siempre tenemos la liquidez y/o el dinero para invertir, por eso traemos otra opción para ti.</p>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('intro_decision', true);
                                    goToStep('IDENTIFY_EXPENSES');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <span className="font-bold text-xl">a. Sí, quiero saber</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('intro_decision', false);
                                    goToStep('FEEDBACK');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <span className="font-bold text-xl">b. No, por ahora no</span>
                            </button>
                        </div>
                    </div>
                );

            case 'IDENTIFY_EXPENSES': // Step 2
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 2: Identificar</span>
                        <h2 className="text-2xl font-bold mt-2 mb-4" style={{ color: C.text }}>DeepEnd Cut It Challenge ✂️</h2>
                        <div className="p-6 rounded-xl border mb-6" style={{ background: C.surface2, borderColor: C.border }}>
                            <p className="font-medium mb-2" style={{ color: C.text }}>Vamos a identificar y eliminar <strong>3 gastos hormiga</strong> diarios, durante 10 días.</p>
                            <p className="text-sm" style={{ color: C.textMuted }}>¿Sabías que estos gastos pueden sumar entre 10% y 15% del ingreso mensual?</p>
                        </div>
                        <p className="mb-8" style={{ color: C.textMuted }}>Analiza durante unos minutos cuáles son esos 3 gastos hormiga que vamos a eliminar.</p>
                        <button
                            onClick={() => goToStep('SMART_OBJECTIVE')}
                            className="w-full text-white py-4 rounded-xl font-bold"
                            style={{ background: C.red }}
                        >
                            Listo, Siguiente {`->`}
                        </button>
                    </div>
                );

            case 'SMART_OBJECTIVE': // Step 3
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 3: Definir Objetivo</span>
                        <h2 className="text-xl font-bold mb-2 mt-2" style={{ color: C.text }}>Ponle nombre a ese dinero 🎯</h2>
                        <p className="mb-6 text-sm" style={{ color: C.textMuted }}>Antes de decidir qué gastos vas a eliminar, pongámosle un objetivo claro al dinero que vas a ahorrar. (SMART: Específico, Medible, Alcanzable...)</p>
                        <textarea
                            className="w-full p-4 rounded-xl border h-32 mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Ej: Ahorrar $50.000 para..."
                            value={answers.smart_objective || ''}
                            onChange={(e) => handleAnswer('smart_objective', e.target.value)}
                        />
                        <button
                            disabled={!answers.smart_objective}
                            onClick={() => goToStep('DATE_SELECTION')}
                            className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            style={{ background: C.red }}
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'DATE_SELECTION': // Step 3.1 - 3.3
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Tu cita para tomar Acción 📅</h2>
                        </div>

                        <div className="space-y-6">
                            {/* 3.1 */}
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: C.textMuted }}>¿Qué día vas a hacer tu acción de esta semana?</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    max={next7Days[6]}
                                    value={answers.action_date || ''}
                                    className="w-full p-3 rounded-xl border"
                                    style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                    onChange={(e) => handleAnswer('action_date', e.target.value)}
                                />
                            </div>
                            {/* 3.2 */}
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: C.textMuted }}>¿En qué momento del día te queda mejor?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Mañana', 'Tarde', 'Noche'].map(time => (
                                        <button
                                            key={time}
                                            onClick={() => handleAnswer('action_time', time)}
                                            className="p-3 rounded-lg border transition-colors"
                                            style={answers.action_time === time
                                                ? { background: C.forest, color: C.green, borderColor: C.forest }
                                                : { background: C.surface2, borderColor: C.border, color: C.text }}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* 3.3 */}
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: C.textMuted }}>Si ese día se complica, ¿qué fecha sería tu Plan B?</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={answers.plan_b_date || ''}
                                    className="w-full p-3 rounded-xl border"
                                    style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                    onChange={(e) => handleAnswer('plan_b_date', e.target.value)}
                                />
                            </div>

                            <button
                                disabled={!answers.action_date || !answers.action_time || !answers.plan_b_date}
                                onClick={() => goToStep('SELECT_EXPENSES')}
                                className="w-full text-white py-4 rounded-xl font-bold disabled:opacity-50"
                                style={{ background: C.red }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );

            case 'SELECT_EXPENSES': // Step 4
                const expensesList = [
                    "Cafés y bebidas diarias (Starbucks, jugos...)",
                    "Comida fuera de casa (Snacks, panaderías...)",
                    "Transporte urbano extra (Taxis, apps...)",
                    "Propinas y 'cambio' no registrado",
                    "Compras impulsivas pequeñas (Dulces, revistas...)",
                    "Suscripciones digitales poco usadas",
                    "Gastos en telefonía y datos móviles extra",
                    "Apps de delivery (costos de envío)",
                    "Gastos en efectivo invisibles (Parqueaderos...)",
                    "Pequeños 'gusticos' diarios (Accesorios...)",
                    "Intereses y comisiones bancarias",
                    "Juegos y apuestas en línea",
                    "Otro"
                ];
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 4: Elección</span>
                        <h2 className="text-xl font-bold mb-4 mt-2" style={{ color: C.text }}>¿Cuáles son esos 3 gastos a eliminar?</h2>
                        <p className="mb-6 text-sm" style={{ color: C.textMuted }}>Selecciona los 3 gastos del siguiente listado 👇</p>

                        <div className="grid gap-2 mb-6">
                            {expensesList.map((exp) => (
                                <label
                                    key={exp}
                                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                                    style={answers.selected_expenses?.includes(exp)
                                        ? { borderColor: C.green, background: C.forest }
                                        : { borderColor: C.border, background: C.surface1 }}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded"
                                        checked={answers.selected_expenses?.includes(exp)}
                                        onChange={() => toggleExpense(exp)}
                                    />
                                    <span className="text-sm" style={{ color: C.text }}>{exp}</span>
                                </label>
                            ))}
                        </div>

                        <button
                            disabled={!answers.selected_expenses || answers.selected_expenses.length < 1}
                            onClick={() => goToStep('DEPOSIT_PLAN')}
                            className="w-full text-white py-4 rounded-xl font-bold disabled:opacity-50"
                            style={{ background: C.red }}
                        >
                            Continuar ({answers.selected_expenses?.length || 0} seleccionados)
                        </button>

                    </div>
                );

            case 'DEPOSIT_PLAN': // Step 5
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 5: Traza un Plan</span>
                        <h2 className="text-xl font-bold mb-4 mt-2" style={{ color: C.text }}>¿En dónde vas a depositar el dinero ahorrado?</h2>
                        <p className="mb-6 font-medium" style={{ color: C.textMuted }}>¿Ya tienes una cuenta destinada a este objetivo?</p>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('platform_decision_initial', 'Sí');
                                    goToStep('PLATFORM_INPUT');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <span className="font-bold text-lg block">a. Sí</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('platform_decision_initial', 'No');
                                    goToStep('GLOBAL66_INFO');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <span className="font-bold text-lg block">b. No, aún no</span>
                            </button>
                        </div>
                    </div>
                );

            case 'PLATFORM_INPUT': // Step 5.1
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4" style={{ color: C.text }}>¿Podrías indicarnos qué plataforma o herramienta usarás?</h2>
                        <p className="text-sm p-3 rounded-lg mb-6" style={{ color: C.amber, background: C.surface2 }}>⚠️ Es importante que hagas la debida diligencia de la herramienta que elijas.</p>
                        <input
                            className="w-full p-3 rounded-xl border mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Nombre de la plataforma..."
                            value={answers.user_platform_name || ''}
                            onChange={(e) => handleAnswer('user_platform_name', e.target.value)}
                        />
                        <button onClick={() => goToStep('REMINDERS')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Continuar</button>
                    </div>
                );

            // --- Global 66 Sub-Flow ---

            case 'GLOBAL66_INFO': // Step 5.2 & Image 2 Info
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="p-6 rounded-2xl shadow-sm border" style={{ background: C.surface1, borderColor: C.border }}>
                            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full mb-4" style={{ background: C.surface2, color: C.textMuted }}>
                                <Globe size={24} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Tarjeta – Cuenta en Dólares Global 66</h2>
                            <div className="text-sm space-y-4 mb-6" style={{ color: C.textMuted }}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>¿Qué es?</span>
                                    <div className="md:col-span-2">
                                        La <strong>Cuenta en Dólares</strong> de <em>Global66</em> es un <strong>producto digital</strong> que permite mantener saldo en <strong>USD</strong> y generar un rendimiento anual sobre ese dinero, mientras sigues teniendo disponibilidad para transferir o convertirlo cuando lo necesites.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Tipo de producto</span>
                                    <div className="md:col-span-2">Es un <strong>producto financiero de inversión</strong> o colocación de liquidez en USD, estructurado dentro de una <strong>plataforma fintech</strong>.</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Horizonte temporal</span>
                                    <div className="md:col-span-2">Corto, mediano y largo plazo</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Activos subyacentes</span>
                                    <div className="md:col-span-2"><strong>Global66</strong> no reporta información sobre esto*</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Liquidez</span>
                                    <div className="md:col-span-2">
                                        <em>Global66</em> no publica de manera detallada y explícita en sus sitios cómo invierte los fondos de la cuenta remunerada para generar el rendimiento, es decir, no describe los activos subyacentes específicos dentro de la documentación pública general.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Rentabilidad</span>
                                    <div className="md:col-span-2">Hasta <strong>6% de rentabilidad E.A</strong> en dólares. (<em>La tasa puede cambiar según condiciones del mercado</em>).</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Comisión</span>
                                    <div className="md:col-span-2">
                                        <strong>Comisión:</strong> No cobra cuota fija; la rentabilidad puede cambiar y los costos están implícitos en la estructura del producto y en el tipo de cambio.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Inversión mínima</span>
                                    <div className="md:col-span-2">Desde 1 Dólar</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Perfil de riesgo</span>
                                    <div className="md:col-span-2"><strong>Conservador*</strong>; Está orientada a preservar capital en dólares</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Protección patrimonial</span>
                                    <div className="md:col-span-2">
                                        Cuenta con el <strong>respaldo del seguro de depósitos Fogafin</strong>. Este seguro garantiza la protección de los ahorros de sus clientes hasta un monto de <strong>COP $50.000.000</strong>, ofreciendo así una salvaguarda financiera sólida y confiable. (<em>En el caso de Colombia</em>)
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <span className="font-bold" style={{ color: C.text }}>Regulación</span>
                                    <div className="md:col-span-2">
                                        <strong>SFC:</strong> Superfinanciera Financiera de Colombia<br />
                                        En Colombia Global opera como una <strong>SEDPE:</strong> Sociedad Especializada en Depósitos y Pagos Electrónicos.
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => goToStep('GLOBAL66_DECISION')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Continuar</button>
                        </div>
                    </div>
                );

            case 'GLOBAL66_DECISION': // Step 7 in Diagram 2 (Decision)
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 7: Decisión</span>
                        <h2 className="text-2xl font-bold mb-6 text-center mt-2" style={{ color: C.text }}>¿Te interesa esta opción?</h2>
                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    handleAnswer('global66_decision_final', 'Sí, con Global66');
                                    goToStep('GLOBAL66_INSTRUCTIONS');
                                }}
                                className="p-4 text-white rounded-xl font-bold text-left"
                                style={{ background: C.red }}
                            >
                                a. Sí, quiero hacerlo con el producto presentado
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('global66_decision_final', 'Otro Producto');
                                    goToStep('OTHER_PLATFORM_INPUT');
                                }}
                                className="p-4 border rounded-xl font-bold text-left"
                                style={{ background: C.surface1, borderColor: C.border, color: C.text }}
                            >
                                b. Sí, pero usaré otro producto
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('global66_decision_final', 'No interesa');
                                    goToStep('FEEDBACK');
                                }}
                                className="p-4 text-sm rounded-xl text-left"
                                style={{ background: C.surface2, color: C.textMuted }}
                            >
                                c. No me interesa
                            </button>
                        </div>
                    </div>
                );

            case 'GLOBAL66_INSTRUCTIONS': // Step 6.1 (Instructions)
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-4" style={{ color: C.text }}>Paso 6.1: Tomar Acción 🚀</h2>
                            <p className="mb-4" style={{ color: C.textMuted }}>Abre YA tu cuenta gratis en Global66.</p>
                            <a href="https://share.global66.com/KARCEL411" target="_blank" className="block w-full text-white py-4 px-6 rounded-xl font-bold mb-6 text-center" style={{ background: C.red }}>
                                DeepEnd con Global66 <br /><span className="text-xs font-normal">Clic aquí para ir seguro</span>
                            </a>

                            <div className="p-4 rounded-xl text-sm space-y-2 border" style={{ background: C.surface2, borderColor: C.border, color: C.textMuted }}>
                                <p><strong style={{ color: C.text }}>IMPORTANTE:</strong></p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Regístrate sin costo.</li>
                                    <li>Prepara tu documento + selfie (KYC).</li>
                                    <li>Fondea vía PSE (Colombia) o local.</li>
                                    <li>Convierte a dólares en la app.</li>
                                </ul>
                            </div>
                        </div>
                        <button onClick={() => goToStep('REMINDERS')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>List@, Siguiente</button>
                    </div>
                );

            case 'OTHER_PLATFORM_INPUT': // Step 6.2
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4" style={{ color: C.text }}>¿Qué plataforma usarás?</h2>
                        <p className="text-sm p-3 rounded-lg mb-6" style={{ color: C.amber, background: C.surface2 }}>⚠️ Importante: Asegúrate de hacer tu debida diligencia.</p>
                        <input
                            className="w-full p-3 rounded-xl border mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Nombre de la plataforma..."
                            value={answers.other_platform_name_g66 || ''}
                            onChange={(e) => handleAnswer('other_platform_name_g66', e.target.value)}
                        />
                        <button onClick={() => goToStep('REMINDERS')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Continuar</button>
                    </div>
                );

            case 'REMINDERS': // Step 6.3 / 9
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full mb-4" style={{ background: C.surface2, color: C.textMuted }}>
                                <Bell size={24} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Recordatorios 🔔</h2>
                            <p style={{ color: C.textMuted }}>¿Deseas activar los recordatorios por parte de DeepEnd? Te ayudaremos a no perder de vista tu objetivo.</p>
                        </div>
                        <div className="grid gap-3">
                            <button onClick={() => { handleAnswer('reminders', true); goToStep('REMINDER_DATE_SELECTION'); }} className="p-4 text-white rounded-xl font-bold" style={{ background: C.red }}>Sí, quiero recordatorios</button>
                            <button onClick={() => { handleAnswer('reminders', false); saveReminders(); saveSubmission(); goToStep('FINAL_TIPS'); }} className="p-4 border rounded-xl" style={{ borderColor: C.border, color: C.textMuted, background: C.surface1 }}>No, gracias</button>
                        </div>
                    </div>
                );

            case 'REMINDER_DATE_SELECTION':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4" style={{ color: C.text }}>¿Qué día del mes quieres recibir los recordatorios?</h2>
                        <p className="mb-6" style={{ color: C.textMuted }}>Selecciona un día (1-31) para que te enviemos el recordatorio mensual.</p>

                        <select
                            className="w-full p-4 rounded-xl border mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            value={answers.reminder_day || ''}
                            onChange={(e) => handleAnswer('reminder_day', e.target.value)}
                        >
                            <option value="">Selecciona un día...</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <button
                            disabled={!answers.reminder_day}
                            onClick={() => {
                                saveReminders();
                                goToStep('FINAL_TIPS');
                            }}
                            className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            style={{ background: C.red }}
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'FINAL_TIPS': // Step 7 Final - Últimos ajustes
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: C.forest, color: C.green }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>¡Últimos Ajustes & Cierre!</h2>
                            <div className="p-6 rounded-xl border shadow-sm space-y-4" style={{ background: C.surface1, borderColor: C.border }}>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: C.forest, color: C.green }}>1</span>
                                    <p className="text-sm" style={{ color: C.textMuted }}>Cada vez que vayas a gastar en alguno de esos gastos hormiga, <strong>ahorra ese dinero</strong> (físico o digital).</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: C.forest, color: C.green }}>2</span>
                                    <p className="text-sm" style={{ color: C.textMuted }}>Lleva un <strong>registro diario</strong> del monto que evitaste gastar y el <strong>día 10 deposita ese dinero</strong> para tu objetivo.</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: C.forest, color: C.green }}>3</span>
                                    <p className="text-sm" style={{ color: C.textMuted }}><strong>Comparte</strong> el registro de lo que lograste ahorrar con tu tribu.</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={async () => {
                            await saveSubmission();
                            goToStep('SUBMISSION_SUCCESS');
                        }} className="w-full text-white py-4 rounded-xl font-bold" style={{ background: C.red }}>¡Entendido! Terminar Reto</button>
                    </div>
                );

            case 'SUBMISSION_SUCCESS':
                return (
                    <div className="max-w-xl mx-auto text-center py-12">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ background: C.forest, color: C.green }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4" style={{ color: C.text }}>¡Reto Gasto Hormiga Activado! 🐜</h2>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: C.textSec }}>Recuerda: El Activo más importante eres TÚ</h3>
                        <p className="mb-8" style={{ color: C.textMuted }}>Has dado el primer paso para liberar flujo de caja.</p>
                        <button onClick={() => navigate('/challenges')} className="text-white px-8 py-3 rounded-xl font-bold" style={{ background: C.red }}>Volver a mis Retos</button>
                    </div>
                );

            case 'FEEDBACK':
                return (
                    <div className="p-6 rounded-xl border mb-6 space-y-6" style={{ background: C.surface1, borderColor: C.border }}>
                        <div className="p-4 rounded-lg border mb-6" style={{ background: C.forest, borderColor: C.green }}>
                            <h3 className="font-bold text-lg mb-1" style={{ color: C.green }}>¡Entendido!!</h3>
                            <p className="text-sm" style={{ color: C.green }}>
                                Consideramos muy valioso entender tu <strong>por qué</strong>.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: C.textMuted }}>
                                ¡Cuéntanos!: ¿Qué te impide dar el paso ahora?
                            </label>
                            <textarea
                                className="w-full p-3 rounded-lg border h-24 resize-none"
                                style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                placeholder="Escribe tu respuesta aquí..."
                                onChange={(e) => handleAnswer('feedback_impediment', e.target.value)}
                            />
                        </div>
                        <br />
                        <div className="p-4 rounded-lg border text-sm italic text-center" style={{ background: C.surface2, borderColor: C.border, color: C.textMuted }}>
                            "La respuesta que resuene más contigo, nos ayudará mucho para seguir avanzando"
                        </div>

                        <button
                            onClick={async () => {
                                await saveSubmission();
                                navigate('/challenges');
                            }}
                            className="w-full text-white py-3 rounded-xl font-bold mt-6"
                            style={{ background: C.red }}
                        >
                            Enviar y Salir
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>
            <HomeSidebar activeTab="Mis Retos" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
                    {/* Top Nav */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={goBack}
                            className="flex items-center transition-colors"
                            style={{ color: C.label }}
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            {history.length > 0 ? 'Volver' : 'Cancelar'}
                        </button>
                        <div className="text-sm font-bold" style={{ color: C.label }}>GASTO HORMIGA</div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}
