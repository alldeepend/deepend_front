import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../../home/HomeSidebar';
import Header from '../../shared/Header';
import { ArrowLeft, CheckCircle2, ShieldCheck, Share2, AlertTriangle, BookOpen, Bell } from 'lucide-react';
import { useAuth } from '../../../store/useAuth';
import { C } from '../../../styles/colors';

// Step Types
type StepId =
    | 'START'
    | 'P1_DECISION'
    | 'P2_OPTION'
    | 'GASTO_HORMIGA_REDIRECT'
    | 'CLOSING_FEEDBACK'
    // Liquidity Flow
    | 'L_DATE_SELECTION'      // n1, n2, n3
    | 'L_AMOUNT_RANGE'        // n5
    | 'L_HIGH_AMOUNT_PLACEHOLDER' // Deprecated, will redirect to B flow
    // Insights Flow (< 200) - RUTA A
    | 'INSIGHTS_INTRO'        // A
    | 'INSIGHTS_TEST'         // A1
    | 'INSIGHTS_RESOURCE'     // A2 (Failed test)
    | 'SMART_OBJECTIVE'       // A3
    | 'ACTION_DECISION_INS'   // A4
    | 'OTHER_PLATFORM_INS'    // A5
    | 'LINK_INSIGHTS'         // C (Step E equivalent)
    // Insights Flow (>= 200) - RUTA B
    | 'HIGH_AMOUNT_INTRO'     // B Intro
    | 'HIGH_AMOUNT_TEST'      // B1
    | 'HIGH_AMOUNT_RESOURCE'  // B2
    | 'HIGH_AMOUNT_OBJECTIVE' // B3
    | 'HIGH_AMOUNT_DECISION'  // B4
    | 'HIGH_AMOUNT_OTHER_PLATFORM' // B5
    | 'HIGH_AMOUNT_FINAL_DECISION' // B6
    // Global 66 Flow
    | 'GLOBAL66_INTRO'
    | 'GLOBAL66_TEST'         // D1
    | 'GLOBAL66_RESOURCE'     // (Failed test)
    | 'ACTION_DECISION_G66'   // D3
    | 'LINK_GLOBAL66'         // E
    // Commons
    | 'ALTERNATIVE_OFFER'     // D (Redirects)
    | 'SHARE_ACCOUNTABILITY'  // 4
    | 'REMINDERS'             // 5
    | 'REMINDER_DATE_SELECTION' // 6
    | 'SUBMISSION_SUCCESS';   // Final

export default function MyMoneyInAction() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<StepId>('START');
    const [history, setHistory] = useState<StepId[]>([]);
    const [answers, setAnswers] = useState<any>({});
    const [currentTestAnswers, setCurrentTestAnswers] = useState<any>({});

    const handleAnswer = (key: string, value: any) => {
        setAnswers((prev: any) => ({ ...prev, [key]: value }));
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
                    title: 'Tu cita para tomar Acción (My Money In Action)',
                    description: `Objetivo: ${answers.smart_objective || 'Sin especificar'}`,
                    type: 'ONE_TIME',
                    date: answers.action_date,
                    time: answers.action_time || 'Mañana',
                    source: 'CHALLENGE_MY_MONEY_IN_ACTION',
                    sourceId: '4544a365-a761-4678-a420-ccf59eadb9c7'
                });
            }

            // 2. Plan B Date
            if (answers.plan_b_date) {
                remindersToSave.push({
                    userId: user.id,
                    title: 'Plan B: Acción Financiera',
                    description: 'Recuperación de la acción no realizada.',
                    type: 'ONE_TIME',
                    date: answers.plan_b_date,
                    time: answers.action_time || 'Mañana',
                    source: 'CHALLENGE_MY_MONEY_IN_ACTION',
                    sourceId: '4544a365-a761-4678-a420-ccf59eadb9c7'
                });
            }

            // 3. Monthly Reminder (if selected)
            if (answers.reminder_day) {
                remindersToSave.push({
                    userId: user.id,
                    title: 'Recordatorio Mensual DeepEnd',
                    description: 'Seguimiento de tus objetivos financieros.',
                    type: 'RECURRING_MONTHLY',
                    dayOfMonth: answers.reminder_day,
                    time: 'Mañana',
                    source: 'CHALLENGE_MY_MONEY_IN_ACTION',
                    sourceId: '4544a365-a761-4678-a420-ccf59eadb9c7'
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
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            // 1. Get Challenge ID (Quick lookup by title)
            const challengesRes = await fetch(`${API_URL}/challenges`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const challenges = await challengesRes.json();
            const challenge = challenges.find((c: any) => c.title.toLowerCase().includes("my money") || c.title.toLowerCase().includes("action"));

            if (!challenge) {
                console.error("Challenge My Money Not Found");
                return;
            }

            // 2. Build Ordered Answers
            const orderedResponses = [];

            // P1 Decision
            if (answers.p1_decision) {
                orderedResponses.push({
                    question: "¿Estás list@ para tomar acción?",
                    answer: answers.p1_decision
                });
            }
            // P2 Option (Liquidity)
            if (answers.p2_option) {
                orderedResponses.push({
                    question: "¿Cuál es tu situación actual?",
                    answer: answers.p2_option === 'liquidity' ? "Tengo liquidez" : "No tengo excedente"
                });
            }

            // Liquidity Flow
            if (answers.action_date) {
                orderedResponses.push({
                    question: "¿Qué día vas a hacer tu acción?",
                    answer: answers.action_date
                });
            }
            if (answers.action_time) {
                orderedResponses.push({
                    question: "¿En qué momento del día?",
                    answer: answers.action_time
                });
            }
            if (answers.plan_b_date) {
                orderedResponses.push({
                    question: "Fecha Plan B",
                    answer: answers.plan_b_date
                });
            }

            // Amount Range
            if (answers.amount_range) {
                orderedResponses.push({
                    question: "Rango de Monto a Invertir",
                    answer: answers.amount_range === 'less_200' ? "Menos de 200 USD" : "Más de 200 USD"
                });
            }

            // Test Results (Ruta A o B)
            if (currentTestAnswers && Object.keys(currentTestAnswers).length > 0) {
                // Map test answers. 
                let testContext = "";
                if (history.includes('INSIGHTS_TEST')) testContext = "Test Ruta A (Insights <200)";
                else if (history.includes('HIGH_AMOUNT_TEST')) testContext = "Test Ruta B (Insights >200)";
                else if (history.includes('GLOBAL66_TEST')) testContext = "Test Ruta D (Global66)";
                else testContext = "Test General";

                Object.entries(currentTestAnswers).forEach(([key, value]) => {
                    let questionLabel = key;
                    // Simple mapping attempt (keys are q1, q2, q3)
                    if (key === 'q1') questionLabel = "Pregunta 1 (Riesgo/Conocimiento)";
                    if (key === 'q2') questionLabel = "Pregunta 2 (Plazo)";
                    if (key === 'q3') questionLabel = "Pregunta 3 (Objetivo)";

                    orderedResponses.push({
                        question: `${testContext} - ${questionLabel}`,
                        answer: value
                    });
                });
            }

            // High Amount Flow - Platform Selection
            if (answers.platform_choice) {
                orderedResponses.push({
                    question: "¿Qué plataforma elegiste?",
                    answer: answers.platform_choice
                });
            }
            if (answers.other_platform) {
                orderedResponses.push({
                    question: "Otra Plataforma",
                    answer: answers.other_platform
                });
            }

            // Feedback (if rejected flow)
            if (answers.feedback_impediment) {
                orderedResponses.push({
                    question: "¿Qué te impide dar el paso ahora?",
                    answer: answers.feedback_impediment
                });
            }
            if (answers.feedback_improvement) {
                orderedResponses.push({
                    question: "¿Qué podemos mejorar?",
                    answer: answers.feedback_improvement
                });
            }

            if (answers.smart_objective) {
                orderedResponses.push({
                    question: "Objetivo SMART",
                    answer: answers.smart_objective
                });
            }
            if (answers.smart_objective_high) {
                orderedResponses.push({
                    question: "Objetivo SMART (Ruta Alta)",
                    answer: answers.smart_objective_high
                });
            }

            // High Amount / Low Amount specific decisions
            if (answers.decision_initial_offer) {
                orderedResponses.push({
                    question: "¿List@ para tomar Acción? (Ruta <200)",
                    answer: answers.decision_initial_offer
                });
            }
            if (answers.decision_initial_offer_high) {
                orderedResponses.push({
                    question: "¿List@ para tomar Acción? (Ruta >200)",
                    answer: answers.decision_initial_offer_high
                });
            }

            // Other Platforms (both routes)
            if (answers.other_platform_name) {
                orderedResponses.push({
                    question: "Nombre de Otra Plataforma (Ruta <200)",
                    answer: answers.other_platform_name
                });
            }
            if (answers.other_platform_name_high) {
                orderedResponses.push({
                    question: "Nombre de Otra Plataforma (Ruta >200)",
                    answer: answers.other_platform_name_high
                });
            }

            // Alternative Choices
            if (answers.alternative_choice) {
                orderedResponses.push({
                    question: "Elección Alternativa (Ruta <200)",
                    answer: answers.alternative_choice
                });
            }
            if (answers.alternative_choice_high) {
                orderedResponses.push({
                    question: "Elección Alternativa (Ruta >200)",
                    answer: answers.alternative_choice_high
                });
            }

            // Final Reminders
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
            navigate(-1); // Cancel/Exit if no history
            return;
        }
        const prevStep = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCurrentStep(prevStep);
        window.scrollTo(0, 0);
    };

    // Reset test answers when entering a test step
    useEffect(() => {
        if (currentStep === 'INSIGHTS_TEST' || currentStep === 'GLOBAL66_TEST' || currentStep === 'HIGH_AMOUNT_TEST') {
            setCurrentTestAnswers({});
        }
    }, [currentStep]);

    // Helper to calculate next 7 days
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d.toISOString().split('T')[0];
    });

    const validateInsightsTest = () => {
        const a = currentTestAnswers;
        // Correct answers based on Image 2
        const correct =
            a.q1 === 'b' && // Fed
            a.q2 === 'a' && // Vale 10% menos en pesos...
            a.q3 === 'b';   // Supervisado por SEC... y aprobado por Superfinanciera

        if (correct) {
            goToStep('SMART_OBJECTIVE');
        } else {
            goToStep('INSIGHTS_RESOURCE');
        }
    };

    const validateHighAmountTest = () => {
        const a = currentTestAnswers;
        // Correct answers based on Image B1
        const correct =
            a.q1 === 'b' && // Un equipo profesional administra...
            a.q2 === 'a' && // Tenga mayor potencial de retorno...
            a.q3 === 'b';   // Entender que las fluctuaciones son parte normal...

        if (correct) {
            goToStep('HIGH_AMOUNT_OBJECTIVE'); // B3
        } else {
            goToStep('HIGH_AMOUNT_RESOURCE'); // B2
        }
    };

    const validateGlobal66Test = () => {
        const a = currentTestAnswers;
        // Correct answers based on Image 4
        const correct =
            a.q1 === 'b' && // Diversificar
            a.q2 === 'a' && // Tipo de cambio
            a.q3 === 'b';   // Puede generar rendimiento pero no es banco...

        if (correct) {
            goToStep('ACTION_DECISION_G66'); // D3
        } else {
            goToStep('GLOBAL66_RESOURCE');
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case 'START':
                return (
                    <div className="text-center max-w-2xl mx-auto py-12">
                        <h1 className="text-4xl font-bold mb-6" style={{ color: C.text }}>Activa tu Reto: <br /> <span style={{ color: C.green }}>My Money in Action</span> 🎯</h1>
                        <p className="text-lg mb-8 leading-relaxed" style={{ color: C.textMuted }}>
                            La claridad financiera es fundamental, pero empieza cuando tú decides hacerlo.
                            <br />Este formulario te guiará paso a paso para tomar la mejor decisión según tu situación actual.
                        </p>
                        <button
                            onClick={() => goToStep('P1_DECISION')}
                            className="text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                            style={{ background: C.red }}
                        >
                            Comenzar Ahora
                        </button>
                    </div>
                );

            case 'P1_DECISION':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 1</span>
                            <h2 className="text-2xl font-bold mt-2 mb-4" style={{ color: C.text }}>¿Decides participar en el reto MY MONEY IN ACTION este mes?</h2>
                            <p className="italic" style={{ color: C.textMuted }}>La claridad financiera empieza cuando tú decides hacerlo.</p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('p1_decision', 'yes');
                                    goToStep('P2_OPTION');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <div className="flex items-center gap-3 font-bold text-lg">
                                    <span className="text-2xl">✅</span> Sí, acepto el reto
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    handleAnswer('p1_decision', 'no');
                                    goToStep('CLOSING_FEEDBACK');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <div className="flex items-center gap-3 font-bold text-lg">
                                    <span className="text-2xl">❌</span> No, por ahora no
                                </div>
                            </button>
                        </div>
                    </div>
                );

            case 'P2_OPTION':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso 2</span>
                            <h2 className="text-2xl font-bold mt-2 mb-4" style={{ color: C.text }}>¿Para cuál de las opciones estás list@?</h2>
                            <p className="mb-4" style={{ color: C.textMuted }}>Como todo DeepEnd, tod@s partimos de puntos diferentes. Elige tu ruta:</p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('p2_option', 'liquidity');
                                    goToStep('L_DATE_SELECTION');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <h3 className="font-bold text-lg mb-2">a. Opción 1: Tengo liquidez</h3>
                                <p className="text-sm" style={{ color: C.textMuted }}>Tengo liquidez hoy (desde $5 USD) y estoy list@ para que mi dinero rente.</p>
                            </button>

                            <button
                                onClick={() => {
                                    if (window.confirm("¿Estás seguro de que deseas ir al reto Gasto Hormiga?")) {
                                        handleAnswer('p2_option', 'no_surplus');
                                        navigate('/challenges/gasto-hormiga');
                                    }
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <h3 className="font-bold text-lg mb-2">b. Opción 2: No tengo excedente</h3>
                                <p className="text-sm" style={{ color: C.textMuted }}>Quiero crearlo. (Ir a Gasto Hormiga)</p>
                            </button>
                        </div>
                    </div>
                );

            // --- Liquidity Flow ---

            case 'L_DATE_SELECTION':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Tu cita para tomar Acción 📅</h2>
                            <p style={{ color: C.textMuted }}>El éxito ama la preparación. Elige cuándo tomarás acción.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: C.textMuted }}>¿Qué día vas a hacer tu acción? (Próximos 7 días)</label>
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
                                onClick={() => goToStep('L_AMOUNT_RANGE')}
                                className="w-full text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-colors"
                                style={{ background: C.red }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );

            case 'L_AMOUNT_RANGE':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold mb-3 font-center" style={{ color: C.text }}>Paso 3: Tu punto de partida</h2>
                        <p className="text-sm mb-6" style={{ color: C.textMuted }}>Pensando en el monto que estás dispuesto a mover en este reto, ¿En qué rango se encuentra ese valor?</p>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('amount_range', 'less_200');
                                    goToStep('INSIGHTS_INTRO');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <span className="font-bold text-lg block mb-1">💵 Menos de 200 USD</span>
                                <span className="text-xs" style={{ color: C.textMuted }}>Ruta A</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('amount_range', 'more_200');
                                    goToStep('HIGH_AMOUNT_INTRO');
                                }}
                                className="p-6 rounded-xl border transition-all text-left"
                                style={{ borderColor: C.border, background: C.surface1, color: C.text }}
                            >
                                <span className="font-bold text-lg block mb-1">💰 200 USD o más</span>
                                <span className="text-xs" style={{ color: C.textMuted }}>Ruta B</span>
                            </button>
                        </div>
                    </div>
                );

            case 'L_HIGH_AMOUNT_PLACEHOLDER':
                // Keeping this as a fallback but routing logic handles it to HIGH_AMOUNT_INTRO
                return (
                    <div className="text-center p-8">Redireccionando...</div>
                );

            // --- Insights Flow (Ruta A: < 200) ---

            case 'INSIGHTS_INTRO':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="p-6 rounded-2xl shadow-sm border" style={{ background: C.surface1, borderColor: C.border }}>
                            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: C.surface2, color: C.textMuted }}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Tarjeta – Mi Efectivo Rentable (Insights WM)</h2>

                            <div className="text-sm space-y-4 mb-6" style={{ color: C.textMuted }}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>¿Qué es?</span>
                                    <div className="md:col-span-2">
                                        Mi Efectivo Rentable es un "bolsillo" en dólares dentro de tu cuenta de Insights que, al activarlo, pone automáticamente tu saldo de efectivo en el mercado monetario de muy corto plazo. Cada día genera intereses y los acredita al cierre de mes; puedes entrar o salir cuando quieras sin plazos de permanencia.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Tipo de producto</span>
                                    <div className="md:col-span-2">"Bolsillo" de inversión en USD, similar a un fondo monetario de muy corto plazo.</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Horizonte temporal</span>
                                    <div className="md:col-span-2">Corto, mediano y largo plazo.</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Activos subyacentes</span>
                                    <div className="md:col-span-2">ETFs / UCITs expuestos a tasas de interés de corto plazo de EE. UU. (por ej. letras del Tesoro y otros instrumentos money-market)</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Liquidez</span>
                                    <div className="md:col-span-2">
                                        "A la vista": Puedes añadir o retirar dinero en cualquier momento desde la app, sin plazos de permanencia.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Rentabilidad</span>
                                    <div className="md:col-span-2">Variable, referenciada a la Tasa Fed. Se acumula a diario y se abona mensualmente en el mismo bolsillo (re-inversión automática).</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Comisión</span>
                                    <div className="md:col-span-2">0,10 % anual sobre saldo promedio mensual (se descuenta mensualmente). Sin comisión de compra/venta. Retiros ACH: USD 5–25</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Inversión mínima</span>
                                    <div className="md:col-span-2 font-bold" style={{ color: C.green }}>2 USD</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Perfil de riesgo</span>
                                    <div className="md:col-span-2">Conservador; ideal para colchón de efectivo o metas de corto y mediano plazo.</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Protección patrimonial</span>
                                    <div className="md:col-span-2">
                                        SIPC: Valores segregados a nombre del cliente; cobertura hasta USD 500 000 (USD 250 000 en efectivo)
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <span className="font-bold" style={{ color: C.text }}>Custodia & regulación</span>
                                    <div className="md:col-span-2">
                                        RIA: Registered Investment Advisor. <br />
                                        SEC: Securities and Exchange Commission. <br />
                                        FINRA: los brokers con los que trabajan. <br />
                                        SFC: Superfinanciera Financiera de Colombia.
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => goToStep('INSIGHTS_TEST')}
                                className="w-full text-white py-3 rounded-xl font-bold"
                                style={{ background: C.red }}
                            >
                                Entendido, Validar Conocimiento (Paso A1)
                            </button>
                        </div>
                    </div>
                );

            case 'INSIGHTS_TEST':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>Paso A1: Evaluación 🧠</h2>
                        <div className="space-y-6">

                            {/* Q1 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>1. ¿Qué organismo controla principalmente las tasas de interés de corto plazo en Estados Unidos?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'La Superintendencia Financiera en Colombia' },
                                        { v: 'b', l: 'El Sistema de la Reserva Federal (FED) de Estados Unidos' },
                                        { v: 'c', l: 'A y B son ciertas' },
                                        { v: 'd', l: 'La plataforma de inversión' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="q1" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Q2 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>2. Si tienes $1,000 USD en "Mi Efectivo Rentable" y el dólar se devalúa 10% frente al peso...</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'Vale 10% menos en pesos colombianos, aunque mantienes los mismos $1,000 USD.' },
                                        { v: 'b', l: 'Vale 10% más en pesos colombianos y 10% menos en dolares' },
                                        { v: 'c', l: 'Vale lo mismo en pesos Colombianos' },
                                        { v: 'd', l: 'Mi inversión no se ve afectada' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="q2" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Q3 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>3. ¿Qué significa que el producto financiero tenga regulación dual?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'Que es un activo regulado solo en Colombia.' },
                                        { v: 'b', l: 'Que está supervisado tanto por la SEC en Estados Unidos (donde operan los activos) como aprobado por la Superfinanciera en Colombia (donde se promociona).' },
                                        { v: 'c', l: 'Que es un activo seguro.' },
                                        { v: 'd', l: 'Ninguna de las anteriores.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="q3" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                disabled={Object.keys(currentTestAnswers).length < 3}
                                onClick={validateInsightsTest}
                                className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                                style={{ background: C.red }}
                            >
                                Enviar Respuestas
                            </button>
                        </div>
                    </div>
                );

            case 'INSIGHTS_RESOURCE':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="border p-6 rounded-2xl mb-6" style={{ borderColor: C.amber, background: C.surface2 }}>
                            <div className="flex items-center gap-3 mb-4" style={{ color: C.amber }}>
                                <AlertTriangle />
                                <h3 className="font-bold text-lg">Parece que hay conceptos por reforzar</h3>
                            </div>
                            <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                                Es crucial entender el producto antes de invertir. ¡No te preocupes!
                            </p>
                            <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                                Vamos a presentarte algunos conceptos para que los estudies y cuando finalices estarás list@ para intentar nuevamente. Haz clic aquí 👉 <a href="https://drive.google.com/file/d/1KPtExJXGokKayCA6-qXmhusehyLdLkYt/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="font-bold underline" style={{ color: C.green }}>Conceptos Básicos</a>
                            </p>

                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" onChange={(e) => { if (e.target.checked) goToStep('INSIGHTS_TEST') }} />
                                <span className="font-bold" style={{ color: C.text }}>Ya leí los conceptos, quiero reintentar.</span>
                            </label>
                        </div>
                    </div>
                );

            case 'SMART_OBJECTIVE':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso A3: Definir Objetivo</span>
                        <h2 className="text-xl font-bold mb-2 mt-2" style={{ color: C.text }}>Tu Objetivo SMART 🎯</h2>
                        <p className="mb-6 text-sm" style={{ color: C.textMuted }}>Antes de entrar en acción, pongámosle un objetivo claro a esa inversión. (Específico, Medible, Alcanzable, Relevante, Temporal)</p>
                        <textarea
                            className="w-full p-4 rounded-xl border h-32 mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Ej: Ahorrar $500 para mi fondo de emergencia en 3 meses..."
                            value={answers.smart_objective || ''}
                            onChange={(e) => handleAnswer('smart_objective', e.target.value)}
                        />
                        <button
                            disabled={!answers.smart_objective}
                            onClick={() => goToStep('ACTION_DECISION_INS')}
                            className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            style={{ background: C.red }}
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'ACTION_DECISION_INS':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso A4: Decisión</span>
                        <h2 className="text-2xl font-bold mb-6 text-center mt-2" style={{ color: C.text }}>¿List@ para tomar Acción? 🚀</h2>
                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer', 'Insights WM');
                                    goToStep('LINK_INSIGHTS');
                                }}
                                className="p-4 text-white rounded-xl font-bold text-left"
                                style={{ background: C.red }}
                            >
                                a. Sí, quiero hacerlo con el producto presentado (Insights WM)
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer', 'Otro Producto');
                                    goToStep('OTHER_PLATFORM_INS');
                                }}
                                className="p-4 border rounded-xl font-bold text-left"
                                style={{ background: C.surface1, borderColor: C.border, color: C.text }}
                            >
                                b. Sí, pero usaré otro producto
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer', 'No interesa');
                                    goToStep('ALTERNATIVE_OFFER');
                                }}
                                className="p-4 text-sm rounded-xl text-left"
                                style={{ background: C.surface2, color: C.textMuted }}
                            >
                                c. No, no me interesa esta opción
                            </button>
                        </div>
                    </div>
                );

            case 'OTHER_PLATFORM_INS':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4" style={{ color: C.text }}>¿Qué plataforma usarás?</h2>
                        <p className="text-sm p-3 rounded-lg mb-6" style={{ color: C.amber, background: C.surface2 }}>⚠️ Importante: Asegúrate de hacer tu debida diligencia sobre riesgos y regulaciones.</p>
                        <input
                            className="w-full p-3 rounded-xl border mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Nombre de la plataforma..."
                            value={answers.other_platform_name || ''}
                            onChange={(e) => handleAnswer('other_platform_name', e.target.value)}
                        />
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Continuar</button>
                    </div>
                );

            case 'ALTERNATIVE_OFFER':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>Otras Opciones</h2>
                        <div className="grid gap-4">
                            <button onClick={() => {
                                handleAnswer('alternative_choice', 'Global 66');
                                goToStep('GLOBAL66_INTRO');
                            }} className="p-4 border rounded-xl text-left" style={{ borderColor: C.border, background: C.surface1, color: C.text }}>
                                <span className="font-bold block">Ver otra opción de inversión (Global 66)</span>
                                <span className="text-xs" style={{ color: C.textMuted }}>Cuenta en dólares para proteger patrimonio.</span>
                            </button>
                            <button onClick={() => {
                                if (window.confirm("¿Estás seguro de que deseas ir al reto Gasto Hormiga?")) {
                                    handleAnswer('alternative_choice', 'Gasto Hormiga');
                                    navigate('/challenges/gasto-hormiga');
                                }
                            }} className="p-4 border rounded-xl text-left" style={{ borderColor: C.border, background: C.surface1, color: C.text }}>
                                <span className="font-bold block">Ver opción sin inversión (Gasto Hormiga)</span>
                            </button>
                            <button onClick={() => {
                                handleAnswer('alternative_choice', 'Ninguna');
                                goToStep('CLOSING_FEEDBACK');
                            }} className="p-4 text-sm text-center" style={{ color: C.textMuted }}>
                                No quiero ninguna opción
                            </button>
                        </div>
                    </div>
                );

            // --- Insights Flow (Ruta B: >= 200) ---

            case 'HIGH_AMOUNT_INTRO':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="p-6 rounded-2xl shadow-sm border" style={{ background: C.surface1, borderColor: C.border }}>
                            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: C.surface2, color: C.textMuted }}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Tarjeta – Portafolios Gestionados (Insights WM)</h2>

                            <div className="text-sm space-y-4 mb-6" style={{ color: C.textMuted }}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>¿Qué es?</span>
                                    <div className="md:col-span-2">
                                        Son <strong>portafolios</strong> conformados a partir de <strong>ETFs</strong> que cubren una amplia gama de clases de activo, sectores y geografías. Son gestionados por algoritmos que seleccionan tu portafolio a partir de un conjunto de más de <strong>55 ETFs</strong> altamente liquidos y administrados por los <em>asset managers</em> más importantes del mundo, dentro de los que se encuentran <strong>BlackRock, Vanguard y State Street Global Advisors e Invesco</strong>.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Tipo de producto</span>
                                    <div className="md:col-span-2">Portafolio de inversión en USD</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Horizonte temporal</span>
                                    <div className="md:col-span-2">
                                        Protección contra <strong>inflación</strong> y crecimiento a corto, mediano y largo plazo.
                                        <p className="mt-2 text-xs italic" style={{ color: C.label }}>
                                            NOTA: Si necesitas el dinero en un periodo de tiempo menor a 3 meses sugerimos portafolios de bajo riesgo (1 y 2) y si no es así y el dinero puede estar en un producto financiero más de 6 meses e incluso años, los portafolios con mayor riesgo pero mayor retorno de inversión, pueden ser una mejor opción.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Activos subyacentes</span>
                                    <div className="md:col-span-2"><strong>ETFs, Bonos</strong> como los emitidos por el Tesoro americano o por empresas Estadounidenses, Acciones en compañías de EEUU, Europa y de economías emergentes (<em>como Asia y Latinoamérica</em>).</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Liquidez</span>
                                    <div className="md:col-span-2">
                                        "<strong>A la vista</strong>": Puedes añadir o retirar dinero en cualquier momento desde la app, sin plazos de permanencia.
                                        <p className="mt-1 text-xs" style={{ color: C.label }}>**Tener en cuenta la volatilidad del mercado</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Rentabilidad</span>
                                    <div className="md:col-span-2">Variable de acuerdo al <strong>Portafolio</strong> seleccionado. Puedes escoger entre <strong>10 niveles de riesgo</strong>, del <strong>1</strong> (más bajo 3,2% Anual aprox.) al <strong>10</strong> (más alto), según tu perfil de riesgo.</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Comisión</span>
                                    <div className="md:col-span-2">
                                        <strong>1%</strong> Anual de los AUM promedios (<em>activos bajo administración, por sus siglas en ingles</em>) y se cobra de manera mensual calculandose así: el <strong>1%</strong> del balance promedio de tus <em>Portafolios Gestionados</em> durante el mes, dividido en 12.
                                        <br />Retiros ACH: USD 5–25
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Inversión mínima</span>
                                    <div className="md:col-span-2">200 USD (<em>Cada vez que quieras agregar dinero al portafolio debe ser a partir de 200 USD</em>).</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Perfil de riesgo</span>
                                    <div className="md:col-span-2">Puedes escoger entre <strong>10 niveles</strong> de riesgo de conservadores a agresivos.</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-3" style={{ borderColor: C.border }}>
                                    <span className="font-bold" style={{ color: C.text }}>Protección patrimonial</span>
                                    <div className="md:col-span-2">
                                        <strong>SIPC</strong>: Valores segregados a nombre del cliente; <strong>cobertura</strong> hasta USD 500.000 (USD 250.000 en efectivo)
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <span className="font-bold" style={{ color: C.text }}>Custodia & regulación</span>
                                    <div className="md:col-span-2">
                                        RIA: Registered Investment Advisor. <br />
                                        SEC: Securities and Exchange Commission. <br />
                                        FINRA: los brokers con los que trabajan. <br />
                                        SFC: Superfinanciera Financiera de Colombia.
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => goToStep('HIGH_AMOUNT_TEST')}
                                className="w-full text-white py-3 rounded-xl font-bold"
                                style={{ background: C.red }}
                            >
                                Entendido, Validar Conocimiento (Paso B1)
                            </button>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_TEST':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>Paso B1: Evaluación 🧠</h2>
                        <div className="space-y-6">

                            {/* Q1 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>1. Un portafolio gestionado significa que:</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'El inversionista debe elegir manualmente cada acción o activo.' },
                                        { v: 'b', l: 'Un equipo profesional administra y rebalancea la inversión según una estrategia definida.' },
                                        { v: 'c', l: 'El dinero permanece en efectivo sin invertirse.' },
                                        { v: 'd', l: 'No existe diversificación porque todo se invierte en un solo activo.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="bq1" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Q2 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>2. Si un portafolio tiene nivel de riesgo 10, es probable que:</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'Tenga mayor potencial de retorno, pero también mayor posibilidad de fluctuaciones en el corto plazo.' },
                                        { v: 'b', l: 'No pueda tener pérdidas porque está diversificado.' },
                                        { v: 'c', l: 'Tenga rendimientos fijos y garantizados cada mes.' },
                                        { v: 'd', l: 'b y c son ciertas.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="bq2" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Q3 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>3. Si tu portafolio cae -4% en un mes, lo más adecuado es:</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'Retirar inmediatamente porque significa que el portafolio falló.' },
                                        { v: 'b', l: 'Entender que las fluctuaciones son parte normal del mercado y evaluar según tu horizonte de inversión.' },
                                        { v: 'c', l: 'Asumir que el dinero se perdió definitivamente.' },
                                        { v: 'd', l: 'EPedir que te cambien a un portafolio sin riesgo ni variación.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="bq3" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                disabled={Object.keys(currentTestAnswers).length < 3}
                                onClick={validateHighAmountTest}
                                className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                                style={{ background: C.red }}
                            >
                                Enviar Respuestas
                            </button>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_RESOURCE':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="border p-6 rounded-2xl mb-6" style={{ borderColor: C.amber, background: C.surface2 }}>
                            <div className="flex items-center gap-3 mb-4" style={{ color: C.amber }}>
                                <AlertTriangle />
                                <h3 className="font-bold text-lg">Conceptos Básicos</h3>
                            </div>
                            <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                                Es crucial entender el producto antes de invertir. ¡No te preocupes!
                            </p>
                            <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                                Vamos a presentarte algunos conceptos para que los estudies y cuando finalices estarás list@ para intentar nuevamente. Haz clic aquí 👉 <a href="https://drive.google.com/file/d/1ipQRIbIuBV05d4sm0KBKIQzBY7Yq0NTO/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="font-bold underline" style={{ color: C.green }}>Conceptos Básicos</a>
                            </p>

                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded" onChange={(e) => { if (e.target.checked) goToStep('HIGH_AMOUNT_TEST') }} />
                                <span className="font-bold" style={{ color: C.text }}>Ya leí los conceptos, intentar nuevamente.</span>
                            </label>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_OBJECTIVE':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso B3: Definir Objetivo</span>
                        <h2 className="text-xl font-bold mb-2 mt-2" style={{ color: C.text }}>Tu Objetivo SMART (Ruta B) 🎯</h2>
                        <p className="mb-6 text-sm" style={{ color: C.textMuted }}>Define tu meta para este portafolio (Específico, Medible, Alcanzable, Relevante, Temporal).</p>
                        <textarea
                            className="w-full p-4 rounded-xl border h-32 mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Ej: Invertir $200 para retiro en 10 años..."
                            value={answers.smart_objective_high || ''}
                            onChange={(e) => handleAnswer('smart_objective_high', e.target.value)}
                        />
                        <button
                            disabled={!answers.smart_objective_high}
                            onClick={() => goToStep('HIGH_AMOUNT_DECISION')}
                            className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            style={{ background: C.red }}
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'HIGH_AMOUNT_DECISION':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Paso B4: Decisión</span>
                        <h2 className="text-2xl font-bold mb-6 text-center mt-2" style={{ color: C.text }}>¿List@ para tomar Acción? 🚀</h2>
                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer_high', 'Insights WM');
                                    goToStep('LINK_INSIGHTS');
                                }}
                                className="p-4 text-white rounded-xl font-bold text-left"
                                style={{ background: C.red }}
                            >
                                a. Sí, quiero hacerlo con Portafolios Gestionados (Insights WM)
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer_high', 'Otro Producto');
                                    goToStep('HIGH_AMOUNT_OTHER_PLATFORM');
                                }}
                                className="p-4 border rounded-xl font-bold text-left"
                                style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            >
                                b. Sí, pero usaré otro producto
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer_high', 'No interesa');
                                    goToStep('HIGH_AMOUNT_FINAL_DECISION');
                                }}
                                className="p-4 text-sm rounded-xl text-left"
                                style={{ background: C.surface1, color: C.textMuted }}
                            >
                                c. No, no me interesa esta opción
                            </button>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_OTHER_PLATFORM':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4" style={{ color: C.text }}>¿Qué plataforma usarás?</h2>
                        <p className="text-sm p-3 rounded-lg mb-6" style={{ color: C.amber, background: C.surface2 }}>⚠️ Importante: Asegúrate de hacer tu debida diligencia sobre riesgos y regulaciones.</p>
                        <input
                            className="w-full p-3 rounded-xl border mb-6"
                            style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                            placeholder="Nombre de la plataforma..."
                            value={answers.other_platform_name_high || ''}
                            onChange={(e) => handleAnswer('other_platform_name_high', e.target.value)}
                        />
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Continuar</button>
                    </div>
                );

            case 'HIGH_AMOUNT_FINAL_DECISION':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>¿Qué prefieres hacer?</h2>
                        <div className="grid gap-3">
                            <button onClick={() => {
                                handleAnswer('alternative_choice_high', 'Global 66');
                                goToStep('GLOBAL66_INTRO');
                            }} className="p-4 border rounded-xl text-left" style={{ borderColor: C.border, background: C.surface1, color: C.text }}>
                                <span className="font-bold block">a. Ver otra opción de inversión (Global 66)</span>
                            </button>
                            <button onClick={() => {
                                if (window.confirm("¿Estás seguro de que deseas ir al reto Gasto Hormiga?")) {
                                    handleAnswer('alternative_choice_high', 'Gasto Hormiga');
                                    navigate('/challenges/gasto-hormiga');
                                }
                            }} className="p-4 border rounded-xl text-left" style={{ borderColor: C.border, background: C.surface1, color: C.text }}>
                                <span className="font-bold block">b. Ver una opción que no implique invertir</span>
                                <span className="text-xs" style={{ color: C.textMuted }}>Ir a Reto Gasto Hormiga</span>
                            </button>
                            <button onClick={() => {
                                handleAnswer('alternative_choice_high', 'Ninguna');
                                goToStep('CLOSING_FEEDBACK');
                            }} className="p-4 text-center text-sm" style={{ color: C.textMuted }}>
                                c. No quiero ninguna opción
                            </button>
                        </div>
                    </div>
                );


            // --- Global 66 Flow (Simplified for brevity, similar structure) ---
            case 'GLOBAL66_INTRO':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="p-6 rounded-2xl shadow-sm border" style={{ background: C.surface1, borderColor: C.border }}>
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
                            <button onClick={() => goToStep('GLOBAL66_TEST')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Validar Conocimiento</button>
                        </div>
                    </div>
                );

            case 'GLOBAL66_TEST':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>Validación Global 66 🧠</h2>
                        <div className="space-y-6">
                            {/* Q1 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>1. Si decido tener parte de mi dinero en dólares o euros, el objetivo principal suele ser:</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'Garantizar que nunca perderé poder adquisitivo.' },
                                        { v: 'b', l: 'Diversificar moneda y reducir exposición a una sola economía.' },
                                        { v: 'c', l: 'Obtener rentabilidad fija automática.' },
                                        { v: 'd', l: 'Evitar cualquier tipo de riesgo financiero.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="gq1" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Q2 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>2. Cuando usas una plataforma para enviar o recibir dinero internacionalmente, debo tener en cuenta que:</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'El tipo de cambio puede afectar el valor final que recibo.' },
                                        { v: 'b', l: 'El valor en otra moneda siempre es exacto al que envía.' },
                                        { v: 'c', l: 'Las monedas no fluctúan entre sí.' },
                                        { v: 'd', l: 'No existe impacto del mercado cambiario.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="gq2" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Q3 */}
                            <div className="p-4 rounded-xl" style={{ background: C.surface2 }}>
                                <p className="font-bold mb-3 text-sm" style={{ color: C.text }}>3. Al invertir mi dinero en una cuenta en dólares que genera rentabilidad, es importante entender que:</p>
                                <div className="space-y-2">
                                    {[
                                        { v: 'a', l: 'No existe ningún riesgo ni condición asociada.' },
                                        { v: 'b', l: 'Puede generar rendimiento, pero no es un producto bancario tradicional ni necesariamente tiene tasa fija garantizada como un CDT.' },
                                        { v: 'c', l: 'Que es un activo seguro.' },
                                        { v: 'd', l: 'Está protegida por el mismo seguro de depósitos que un banco colombiano.' },
                                    ].map(opt => (
                                        <label key={opt.v} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer" style={{ background: C.surface1, borderColor: C.border, color: C.text }}>
                                            <input type="radio" name="gq3" value={opt.v} onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                            <span className="text-sm">{opt.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={validateGlobal66Test} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Enviar Respuestas</button>
                        </div>
                    </div>
                );

            case 'GLOBAL66_RESOURCE':
                return (
                    <div className="max-w-xl mx-auto text-center border p-8 rounded-2xl" style={{ borderColor: C.amber, background: C.surface2 }}>
                        <div className="flex items-center justify-center gap-2 mb-4" style={{ color: C.amber }}>
                            <BookOpen />
                            <h3 className="font-bold">Repasemos conceptos</h3>
                        </div>
                        <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                            Es crucial entender el producto antes de invertir. ¡No te preocupes!
                        </p>
                        <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                            Vamos a presentarte algunos conceptos para que los estudies y cuando finalices estarás list@ para intentar nuevamente. Haz clic aquí 👉 <a href="https://drive.google.com/file/d/1IEbWSrHC9V39fJ2CxyjT353crlU3OiJU/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="font-bold underline" style={{ color: C.green }}>Conceptos Básicos</a>
                        </p>

                        <label className="flex items-center gap-3 mb-6 cursor-pointer justify-center">
                            <input type="checkbox" className="w-5 h-5 rounded" onChange={(e) => { if (e.target.checked) goToStep('GLOBAL66_TEST') }} />
                            <span className="font-bold" style={{ color: C.text }}>Ya leí los conceptos, intentar nuevamente.</span>
                        </label>
                    </div>
                );

            case 'ACTION_DECISION_G66':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: C.text }}>¿List@ para tomar Acción con Global 66? 🚀</h2>
                        <div className="grid gap-3">
                            <button onClick={() => goToStep('LINK_GLOBAL66')} className="p-4 text-white rounded-xl font-bold" style={{ background: C.red }}>Sí, quiero hacerlo con el producto presentado</button>
                            <button onClick={() => goToStep('OTHER_PLATFORM_INS')} className="p-4 border rounded-xl" style={{ borderColor: C.border, background: C.surface2, color: C.text }}>Sí, quiero hacerlo pero usaré otro producto</button>
                            <button onClick={() => goToStep('CLOSING_FEEDBACK')} className="p-4 text-sm" style={{ color: C.textMuted }}>No me interesa</button>
                        </div>
                    </div>
                );

            // --- Links & Sharing ---
            case 'LINK_INSIGHTS':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: C.surface2, color: C.textMuted }}>
                            <p className="font-bold mb-2" style={{ color: C.text }}>Paso E: Tomar Acción</p>
                            <p>Abre YA tu cuenta gratis en Insights WM. Si te pide algún código, solo debes escribir <strong>DEEPEND</strong>.</p>
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Abre tu cuenta en Insights WM 🔗</h2>
                        <a href="https://insightswm.com" target="_blank" className="block w-full text-white py-4 rounded-xl font-bold mb-4" style={{ background: C.red }}>Ir a Insights WM</a>
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="underline font-medium" style={{ color: C.textMuted }}>Ya abrí la cuenta, Continuar</button>
                    </div>
                );
            case 'LINK_GLOBAL66':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: C.surface2, color: C.textMuted }}>
                            <p className="font-bold mb-2" style={{ color: C.text }}>Paso E: Tomar Acción</p>
                            <p>Abre YA tu cuenta gratis en Global66.</p>
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>Abre tu cuenta en Global 66 🔗</h2>
                        <a href="https://share.global66.com/KARCEL411" target="_blank" className="block w-full text-white py-4 rounded-xl font-bold mb-4" style={{ background: C.red }}>Ir a Global 66</a>
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="underline font-medium" style={{ color: C.textMuted }}>Ya abrí la cuenta, Continuar</button>
                    </div>
                );

            case 'SHARE_ACCOUNTABILITY':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: C.forest, color: C.green }}><Share2 /></div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: C.text }}>¡Compártelo con tu Tribu! 🗣️</h2>
                        <p className="mb-6" style={{ color: C.textMuted }}>Comparte el registro y tus avances. Tus acciones pueden ser inspiración para otras personas.</p>
                        <div className="p-4 rounded-xl mb-6 italic" style={{ background: C.surface2, color: C.textMuted }}>
                            "Hoy abrí mi cuenta y/o hice mi primera inversión para la universidad de mi hij@ 🎓"
                        </div>
                        <button onClick={() => goToStep('REMINDERS')} className="w-full text-white py-3 rounded-xl font-bold" style={{ background: C.red }}>Listo, Siguiente</button>
                    </div>
                );

            case 'REMINDERS':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full mb-4" style={{ background: C.surface2, color: C.textMuted }}>
                                <Bell size={24} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>¿Activamos Recordatorios? 🔔</h2>
                            <p style={{ color: C.textMuted }}>¿Deseas activar los recordatorios por parte de DeepEnd? Solo serán en tus fechas programadas.</p>
                        </div>
                        <div className="grid gap-3">
                            <button onClick={() => { handleAnswer('reminders', true); goToStep('REMINDER_DATE_SELECTION'); }} className="p-4 text-white rounded-xl font-bold" style={{ background: C.red }}>Sí, quiero recordatorios</button>
                            <button onClick={() => { handleAnswer('reminders', false); saveReminders(); saveSubmission(); goToStep('SUBMISSION_SUCCESS'); }} className="p-4 border rounded-xl" style={{ borderColor: C.border, background: C.surface2, color: C.text }}>No, gracias</button>
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
                                saveSubmission();
                                goToStep('SUBMISSION_SUCCESS');
                            }}
                            className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            style={{ background: C.red }}
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'SUBMISSION_SUCCESS':
                return (
                    <div className="max-w-xl mx-auto text-center py-12">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ background: C.forest, color: C.green }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4" style={{ color: C.text }}>¡Gracias! 🚀</h2>
                        <p className="mb-8" style={{ color: C.textMuted }}>Recuerda: El Activo más importante eres TÚ 🟢</p>
                        <button onClick={() => navigate('/challenges')} className="text-white px-8 py-3 rounded-xl font-bold" style={{ background: C.red }}>Volver a mis Retos</button>
                    </div>
                );

            case 'GASTO_HORMIGA_REDIRECT':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: C.surface2, color: C.textMuted }}>
                                <span className="text-3xl">🔄</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>¡Muy bien! Vamos a generar liquidez.</h2>
                            <p style={{ color: C.textMuted }}>
                                Para esta ruta, te recomendamos ir al reto de <strong>"Gasto Hormiga"</strong>. Allí encontrarás las herramientas para liberar flujo de caja.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/challenges')} // Or specific ID if known
                            className="text-white px-8 py-3 rounded-xl font-bold transition-colors"
                            style={{ background: C.red }}
                        >
                            Ir a Retos
                        </button>
                    </div>
                );

            case 'CLOSING_FEEDBACK':
                return (
                    <div className="p-6 rounded-xl border mb-6 space-y-6" style={{ background: C.surface1, borderColor: C.border }}>
                        <div className="p-4 rounded-lg border mb-6" style={{ background: C.forest, borderColor: C.green }}>
                            <h3 className="font-bold text-lg mb-1" style={{ color: C.green }}>¡Entendido!</h3>
                            <p className="text-sm" style={{ color: C.green }}>
                                Consideramos muy valioso entender tu <strong>por qué</strong> ❓. Nos ayuda a mejorar y a ofrecer recursos que puedan aportarte más valor y a también a otros usuarios.
                            </p>
                        </div>

                        <div className="p-2 rounded-lg text-center font-bold mb-6" style={{ background: C.green, color: C.bg }}>
                            Un par de preguntas más y ¡terminamos! Lo hiciste increíble 🟢
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: C.text }}>
                                ¡Cuéntanos!: ¿Qué te impide dar el paso ahora? 🚫
                            </label>
                            <p className="text-xs mb-2 italic" style={{ color: C.label }}>La respuesta que resuene más contigo, nos ayudará mucho para seguir avanzando ↓</p>
                            <textarea
                                className="w-full p-3 rounded-lg border outline-none transition-all h-24 resize-none"
                                style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                placeholder="Escribe tu respuesta aquí..."
                                onChange={(e) => handleAnswer('feedback_impediment', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: C.text }}>
                                ✍️ ¿Hay algo que podamos aclarar, simplificar o compartir para que te resulte útil en el futuro?
                            </label>
                            <p className="text-xs mb-2 italic" style={{ color: C.label }}>La respuesta que resuene más contigo, nos ayudará mucho para seguir avanzando</p>
                            <textarea
                                className="w-full p-3 rounded-lg border outline-none transition-all h-24 resize-none"
                                style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                placeholder="Escribe tu respuesta aquí..."
                                onChange={(e) => handleAnswer('feedback_improvement', e.target.value)}
                            />
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
                    <div className="flex justify-between items-center mb-12">
                        <button
                            onClick={goBack}
                            className="flex items-center transition-colors"
                            style={{ color: C.label }}
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            {history.length > 0 ? 'Volver' : 'Cancelar'}
                        </button>
                        <div className="text-sm font-bold" style={{ color: C.label }}>MY MONEY IN ACTION</div>
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
