import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../../home/HomeSidebar';
import Header from '../../shared/Header';
import { ArrowLeft, CheckCircle2, ShieldCheck, Share2, AlertTriangle, BookOpen, Bell } from 'lucide-react';
import { useAuth } from '../../../store/useAuth';

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
                        <h1 className="text-4xl font-bold text-slate-800 mb-6">Activa tu Reto: <br /> <span className="text-emerald-600">My Money in Action</span> 🎯</h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            La claridad financiera es fundamental, pero empieza cuando tú decides hacerlo.
                            <br />Este formulario te guiará paso a paso para tomar la mejor decisión según tu situación actual.
                        </p>
                        <button
                            onClick={() => goToStep('P1_DECISION')}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                        >
                            Comenzar Ahora
                        </button>
                    </div>
                );

            case 'P1_DECISION':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paso 1</span>
                            <h2 className="text-2xl font-bold text-slate-800 mt-2 mb-4">¿Decides participar en el reto MY MONEY IN ACTION este mes?</h2>
                            <p className="text-slate-500 italic">La claridad financiera empieza cuando tú decides hacerlo.</p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('p1_decision', 'yes');
                                    goToStep('P2_OPTION');
                                }}
                                className="p-6 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3 font-bold text-slate-700 group-hover:text-emerald-700 text-lg">
                                    <span className="text-2xl">✅</span> Sí, acepto el reto
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    handleAnswer('p1_decision', 'no');
                                    goToStep('CLOSING_FEEDBACK');
                                }}
                                className="p-6 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                            >
                                <div className="flex items-center gap-3 font-bold text-slate-700 text-lg">
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
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paso 2</span>
                            <h2 className="text-2xl font-bold text-slate-800 mt-2 mb-4">¿Para cuál de las opciones estás list@?</h2>
                            <p className="text-slate-500 mb-4">Como todo DeepEnd, tod@s partimos de puntos diferentes. Elige tu ruta:</p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('p2_option', 'liquidity');
                                    goToStep('L_DATE_SELECTION');
                                }}
                                className="p-6 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                            >
                                <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-emerald-700">a. Opción 1: Tengo liquidez</h3>
                                <p className="text-slate-600 text-sm">Tengo liquidez hoy (desde $5 USD) y estoy list@ para que mi dinero rente.</p>
                            </button>

                            <button
                                onClick={() => {
                                    handleAnswer('p2_option', 'no_surplus');
                                    navigate('/challenges/gasto-hormiga');
                                }}
                                className="p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                                <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-700">b. Opción 2: No tengo excedente</h3>
                                <p className="text-slate-600 text-sm">Quiero crearlo. (Ir a Gasto Hormiga)</p>
                            </button>
                        </div>
                    </div>
                );

            // --- Liquidity Flow ---

            case 'L_DATE_SELECTION':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Tu cita para tomar Acción 📅</h2>
                            <p className="text-slate-600">El éxito ama la preparación. Elige cuándo tomarás acción.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿Qué día vas a hacer tu acción? (Próximos 7 días)</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    max={next7Days[6]}
                                    value={answers.action_date || ''}
                                    className="w-full p-3 rounded-xl border border-slate-200"
                                    onChange={(e) => handleAnswer('action_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">¿En qué momento del día te queda mejor?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Mañana', 'Tarde', 'Noche'].map(time => (
                                        <button
                                            key={time}
                                            onClick={() => handleAnswer('action_time', time)}
                                            className={`p-3 rounded-lg border ${answers.action_time === time ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Si ese día se complica, ¿qué fecha sería tu Plan B?</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={answers.plan_b_date || ''}
                                    className="w-full p-3 rounded-xl border border-slate-200"
                                    onChange={(e) => handleAnswer('plan_b_date', e.target.value)}
                                />
                            </div>

                            <button
                                disabled={!answers.action_date || !answers.action_time || !answers.plan_b_date}
                                onClick={() => goToStep('L_AMOUNT_RANGE')}
                                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-slate-900 transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );

            case 'L_AMOUNT_RANGE':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-3 font-center">Paso 3: Tu punto de partida</h2>
                        <p className="text-slate-600 text-sm mb-6">Pensando en el monto que estás dispuesto a mover en este reto, ¿En qué rango se encuentra ese valor?</p>

                        <div className="grid gap-4">
                            <button
                                onClick={() => {
                                    handleAnswer('amount_range', 'less_200');
                                    goToStep('INSIGHTS_INTRO');
                                }}
                                className="p-6 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                            >
                                <span className="font-bold text-lg text-slate-700 block mb-1">💵 Menos de 200 USD</span>
                                <span className="text-xs text-slate-500">Ruta A</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('amount_range', 'more_200');
                                    goToStep('HIGH_AMOUNT_INTRO');
                                }}
                                className="p-6 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                            >
                                <span className="font-bold text-lg text-slate-700 block mb-1">💰 200 USD o más</span>
                                <span className="text-xs text-slate-500">Ruta B</span>
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
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Tarjeta – Mi Efectivo Rentable (Insights WM)</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                <strong>Mi Efectivo Rentable</strong> es un "bolsillo" en dólares dentro de tu cuenta de Insights que, al activarlo, pone automáticamente tu saldo a generar intereses en bonos del tesoro de EE.UU. (bajo riesgo). <br /><br />
                                Ideal para: Fondo de emergencia o metas a corto plazo. Liquidez <em>"A la vista"</em>.
                            </p>
                            <button
                                onClick={() => goToStep('INSIGHTS_TEST')}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
                            >
                                Entendido, Validar Conocimiento (Paso A1)
                            </button>
                        </div>
                    </div>
                );

            case 'INSIGHTS_TEST':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Paso A1: Evaluación 🧠</h2>
                        <div className="space-y-6">

                            {/* Q1 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">1. ¿Qué organismo controla principalmente las tasas de interés de corto plazo en Estados Unidos?</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="q1" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                        <span className="text-sm">La Superintendencia Financiera en Colombia</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="q1" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                        <span className="text-sm">El Sistema de la Reserva Federal (FED) de Estados Unidos</span>
                                    </label>
                                </div>
                            </div>

                            {/* Q2 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">2. Si tienes $1,000 USD en "Mi Efectivo Rentable" y el dólar se devalúa 10% frente al peso...</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="q2" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                        <span className="text-sm">Vale 10% menos en pesos colombianos, aunque mantienes los mismos $1,000 USD.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="q2" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                        <span className="text-sm">Vale 10% más en pesos colombianos.</span>
                                    </label>
                                </div>
                            </div>

                            {/* Q3 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">3. ¿Qué significa que el producto financiero tenga regulación dual?</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="q3" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                        <span className="text-sm">Que es un activo regulado solo en Colombia.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="q3" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                        <span className="text-sm">Que está supervisado por la SEC (EE.UU) y aprobado por la Superfinanciera (Colombia).</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                disabled={Object.keys(currentTestAnswers).length < 3}
                                onClick={validateInsightsTest}
                                className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            >
                                Enviar Respuestas
                            </button>
                        </div>
                    </div>
                );

            case 'INSIGHTS_RESOURCE':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="border border-yellow-200 bg-yellow-50 p-6 rounded-2xl mb-6">
                            <div className="flex items-center gap-3 mb-4 text-yellow-800">
                                <AlertTriangle />
                                <h3 className="font-bold text-lg">Parece que hay conceptos por reforzar</h3>
                            </div>
                            <p className="text-slate-700 mb-4 text-sm">
                                Es crucial entender el producto antes de invertir. No te preocupes, revisa estos conceptos clave:
                            </p>
                            <div className="bg-white p-4 rounded-xl border border-yellow-100 mb-4 text-sm text-slate-600 space-y-2">
                                <p>• <strong>Riesgo Cambiario:</strong> Si el dólar baja, tus pesos bajan, pero conservas tus dólares.</p>
                                <p>• <strong>Regulación Dual:</strong> Doble capa de seguridad (EE.UU. y Colombia).</p>
                                <p>• <strong>FED:</strong> Es quien define las tasas, no el banco central de Colombia.</p>
                            </div>

                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" onChange={(e) => { if (e.target.checked) goToStep('INSIGHTS_TEST') }} />
                                <span className="font-bold text-slate-700">Ya leí los conceptos, quiero reintentar.</span>
                            </label>
                        </div>
                    </div>
                );

            case 'SMART_OBJECTIVE':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paso A3: Definir Objetivo</span>
                        <h2 className="text-xl font-bold text-slate-800 mb-2 mt-2">Tu Objetivo SMART 🎯</h2>
                        <p className="text-slate-500 mb-6 text-sm">Antes de entrar en acción, pongámosle un objetivo claro a esa inversión. (Específico, Medible, Alcanzable, Relevante, Temporal)</p>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 h-32 mb-6"
                            placeholder="Ej: Ahorrar $500 para mi fondo de emergencia en 3 meses..."
                            value={answers.smart_objective || ''}
                            onChange={(e) => handleAnswer('smart_objective', e.target.value)}
                        />
                        <button
                            disabled={!answers.smart_objective}
                            onClick={() => goToStep('ACTION_DECISION_INS')}
                            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'ACTION_DECISION_INS':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paso A4: Decisión</span>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center mt-2">¿List@ para tomar Acción? 🚀</h2>
                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer', 'Insights WM');
                                    goToStep('LINK_INSIGHTS');
                                }}
                                className="p-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-left"
                            >
                                a. Sí, quiero hacerlo con el producto presentado (Insights WM)
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer', 'Otro Producto');
                                    goToStep('OTHER_PLATFORM_INS');
                                }}
                                className="p-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 text-left"
                            >
                                b. Sí, pero usaré otro producto
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer', 'No interesa');
                                    goToStep('ALTERNATIVE_OFFER');
                                }}
                                className="p-4 bg-slate-100 text-slate-500 text-sm hover:text-slate-700 rounded-xl text-left"
                            >
                                c. No, no me interesa esta opción
                            </button>
                        </div>
                    </div>
                );

            case 'OTHER_PLATFORM_INS':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">¿Qué plataforma usarás?</h2>
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-6">⚠️ Importante: Asegúrate de hacer tu debida diligencia sobre riesgos y regulaciones.</p>
                        <input
                            className="w-full p-3 rounded-xl border border-slate-200 mb-6"
                            placeholder="Nombre de la plataforma..."
                            value={answers.other_platform_name || ''}
                            onChange={(e) => handleAnswer('other_platform_name', e.target.value)}
                        />
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Continuar</button>
                    </div>
                );

            case 'ALTERNATIVE_OFFER':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Otras Opciones</h2>
                        <div className="grid gap-4">
                            <button onClick={() => {
                                handleAnswer('alternative_choice', 'Global 66');
                                goToStep('GLOBAL66_INTRO');
                            }} className="p-4 border rounded-xl text-left hover:bg-slate-50">
                                <span className="font-bold block text-slate-800">Ver otra opción de inversión (Global 66)</span>
                                <span className="text-xs text-slate-500">Cuenta en dólares para proteger patrimonio.</span>
                            </button>
                            <button onClick={() => {
                                handleAnswer('alternative_choice', 'Gasto Hormiga');
                                navigate('/challenges/gasto-hormiga');
                            }} className="p-4 border rounded-xl text-left hover:bg-slate-50">
                                <span className="font-bold block text-slate-800">Ver opción sin inversión (Gasto Hormiga)</span>
                            </button>
                            <button onClick={() => {
                                handleAnswer('alternative_choice', 'Ninguna');
                                goToStep('CLOSING_FEEDBACK');
                            }} className="p-4 text-slate-500 text-sm text-center">
                                No quiero ninguna opción
                            </button>
                        </div>
                    </div>
                );

            // --- Insights Flow (Ruta B: >= 200) ---

            case 'HIGH_AMOUNT_INTRO':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Tarjeta – Portafolios Gestionados (Insights WM)</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                Son <strong>portafolios</strong> conformados a partir de ETFs que cubren una amplia gama de clases de activo. Son gestionados por algoritmos y asset managers como BlackRock, Vanguard, etc.<br /><br />
                                Ideal para: Protección contra inflación y crecimiento a corto, mediano y largo plazo.
                            </p>
                            <button
                                onClick={() => goToStep('HIGH_AMOUNT_TEST')}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
                            >
                                Entendido, Validar Conocimiento (Paso B1)
                            </button>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_TEST':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Paso B1: Evaluación 🧠</h2>
                        <div className="space-y-6">

                            {/* Q1 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">1. Un portafolio gestionado significa que:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="bq1" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                        <span className="text-sm">El inversionista elige cada acción.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="bq1" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                        <span className="text-sm">Un equipo profesional y algoritmos administran la inversión.</span>
                                    </label>
                                </div>
                            </div>

                            {/* Q2 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">2. Si un portafolio tiene nivel de riesgo 10, es probable que:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="bq2" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                        <span className="text-sm">Tenga mayor potencial de retorno, pero mayor riesgo a corto plazo.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="bq2" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                        <span className="text-sm">Nunca tenga pérdidas.</span>
                                    </label>
                                </div>
                            </div>

                            {/* Q3 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">3. Si tu portafolio cae -4% en un mes, lo más adecuado es:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="bq3" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                        <span className="text-sm">Retirar inmediatamente para no perder más.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-500">
                                        <input type="radio" name="bq3" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                        <span className="text-sm">Entender que es normal y evaluar según mi horizonte de largo plazo.</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                disabled={Object.keys(currentTestAnswers).length < 3}
                                onClick={validateHighAmountTest}
                                className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                            >
                                Enviar Respuestas
                            </button>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_RESOURCE':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="border border-yellow-200 bg-yellow-50 p-6 rounded-2xl mb-6">
                            <div className="flex items-center gap-3 mb-4 text-yellow-800">
                                <AlertTriangle />
                                <h3 className="font-bold text-lg">Conceptos Básicos (Ruta B)</h3>
                            </div>
                            <ul className="text-slate-700 mb-6 text-sm space-y-2 list-disc pl-4">
                                <li><strong>Portafolio Gestionado:</strong> No eliges acciones individuales, delegas la estrategia.</li>
                                <li><strong>Riesgo/Retorno:</strong> A mayor riesgo (nivel 10), mayor volatilidad esperada a corto plazo.</li>
                                <li><strong>Fluctuaciones:</strong> Son normales en el mercado. La clave es el largo plazo.</li>
                            </ul>
                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" onChange={(e) => { if (e.target.checked) goToStep('HIGH_AMOUNT_TEST') }} />
                                <span className="font-bold text-slate-700">Ya leí los conceptos, intentar nuevamente.</span>
                            </label>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_OBJECTIVE':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paso B3: Definir Objetivo</span>
                        <h2 className="text-xl font-bold text-slate-800 mb-2 mt-2">Tu Objetivo SMART (Ruta B) 🎯</h2>
                        <p className="text-slate-500 mb-6 text-sm">Define tu meta para este portafolio (Específico, Medible, Alcanzable, Relevante, Temporal).</p>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 h-32 mb-6"
                            placeholder="Ej: Invertir $200 para retiro en 10 años..."
                            value={answers.smart_objective_high || ''}
                            onChange={(e) => handleAnswer('smart_objective_high', e.target.value)}
                        />
                        <button
                            disabled={!answers.smart_objective_high}
                            onClick={() => goToStep('HIGH_AMOUNT_DECISION')}
                            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'HIGH_AMOUNT_DECISION':
                return (
                    <div className="max-w-xl mx-auto">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paso B4: Decisión</span>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center mt-2">¿List@ para tomar Acción? 🚀</h2>
                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer_high', 'Insights WM');
                                    goToStep('LINK_INSIGHTS');
                                }}
                                className="p-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-left"
                            >
                                a. Sí, quiero hacerlo con Portafolios Gestionados (Insights WM)
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer_high', 'Otro Producto');
                                    goToStep('HIGH_AMOUNT_OTHER_PLATFORM');
                                }}
                                className="p-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 text-left"
                            >
                                b. Sí, pero usaré otro producto
                            </button>
                            <button
                                onClick={() => {
                                    handleAnswer('decision_initial_offer_high', 'No interesa');
                                    goToStep('HIGH_AMOUNT_FINAL_DECISION');
                                }}
                                className="p-4 bg-slate-100 text-slate-500 text-sm hover:text-slate-700 rounded-xl text-left"
                            >
                                c. No, no me interesa esta opción
                            </button>
                        </div>
                    </div>
                );

            case 'HIGH_AMOUNT_OTHER_PLATFORM':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">¿Qué plataforma usarás?</h2>
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-6">⚠️ Importante: Asegúrate de hacer tu debida diligencia sobre riesgos y regulaciones.</p>
                        <input
                            className="w-full p-3 rounded-xl border border-slate-200 mb-6"
                            placeholder="Nombre de la plataforma..."
                            value={answers.other_platform_name_high || ''}
                            onChange={(e) => handleAnswer('other_platform_name_high', e.target.value)}
                        />
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Continuar</button>
                    </div>
                );

            case 'HIGH_AMOUNT_FINAL_DECISION':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">¿Qué prefieres hacer?</h2>
                        <div className="grid gap-3">
                            <button onClick={() => {
                                handleAnswer('alternative_choice_high', 'Global 66');
                                goToStep('GLOBAL66_INTRO');
                            }} className="p-4 border rounded-xl text-left hover:bg-slate-50">
                                <span className="font-bold text-slate-800 block">a. Ver otra opción de inversión (Global 66)</span>
                            </button>
                            <button onClick={() => {
                                handleAnswer('alternative_choice_high', 'Gasto Hormiga');
                                navigate('/challenges/gasto-hormiga');
                            }} className="p-4 border rounded-xl text-left hover:bg-slate-50">
                                <span className="font-bold text-slate-800 block">b. Ver una opción que no implique invertir</span>
                                <span className="text-xs text-slate-500">Ir a Reto Gasto Hormiga</span>
                            </button>
                            <button onClick={() => {
                                handleAnswer('alternative_choice_high', 'Ninguna');
                                goToStep('CLOSING_FEEDBACK');
                            }} className="p-4 text-slate-500 text-center text-sm">
                                c. No quiero ninguna opción
                            </button>
                        </div>
                    </div>
                );


            // --- Global 66 Flow (Simplified for brevity, similar structure) ---
            case 'GLOBAL66_INTRO':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Tarjeta – Cuenta en Dólares Global 66</h2>
                            <p className="text-slate-600 mb-6">Cuenta global en dólares para proteger tu patrimonio de la devaluación. Producto digital que permite mantener saldo en USD.</p>
                            <button onClick={() => goToStep('GLOBAL66_TEST')} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Validar Conocimiento</button>
                        </div>
                    </div>
                );

            case 'GLOBAL66_TEST':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Validación Global 66 🧠</h2>
                        <div className="space-y-6">
                            {/* Q1 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">1. Si decido tener parte de mi dinero en dólares o euros, el objetivo principal suele ser:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-purple-500">
                                        <input type="radio" name="gq1" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                        <span className="text-sm">Garantizar que nunca perderé poder adquisitivo.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-purple-500">
                                        <input type="radio" name="gq1" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q1: e.target.value })} />
                                        <span className="text-sm">Diversificar moneda y reducir exposición a una sola economía.</span>
                                    </label>
                                </div>
                            </div>

                            {/* Q2 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">2. Cuando usas una plataforma para enviar/recibir dinero intl, ten en cuenta:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-purple-500">
                                        <input type="radio" name="gq2" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                        <span className="text-sm">El tipo de cambio puede afectar el valor final que recibo.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-purple-500">
                                        <input type="radio" name="gq2" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q2: e.target.value })} />
                                        <span className="text-sm">El valor en otra moneda siempre es exacto al que envía.</span>
                                    </label>
                                </div>
                            </div>

                            {/* Q3 */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-bold text-slate-800 mb-3 text-sm">3. Al invertir mi dinero en una cuenta en dólares rentable, entiendo que:</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-purple-500">
                                        <input type="radio" name="gq3" value="a" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                        <span className="text-sm">No existe ningún riesgo ni condición asociada.</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-purple-500">
                                        <input type="radio" name="gq3" value="b" onChange={(e) => setCurrentTestAnswers({ ...currentTestAnswers, q3: e.target.value })} />
                                        <span className="text-sm">Puede generar rendimiento, pero no es un producto bancario tradicional.</span>
                                    </label>
                                </div>
                            </div>

                            <button onClick={validateGlobal66Test} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Enviar Respuestas</button>
                        </div>
                    </div>
                );

            case 'GLOBAL66_RESOURCE':
                return (
                    <div className="max-w-xl mx-auto text-center border p-8 rounded-2xl border-yellow-100 bg-yellow-50">
                        <div className="flex items-center justify-center gap-2 mb-4 text-yellow-700">
                            <BookOpen />
                            <h3 className="font-bold">Repasemos conceptos (Global 66)</h3>
                        </div>
                        <ul className="text-left text-sm space-y-2 mb-6 text-slate-700">
                            <li>• <strong>Diversificación:</strong> Clave para reducir riesgos.</li>
                            <li>• <strong>Tasa de Cambio:</strong> Siempre varía y afecta el monto final.</li>
                            <li>• <strong>Naturaleza del Producto:</strong> Es fintech, no banco tradicional.</li>
                        </ul>
                        <label className="flex items-center gap-3 mb-6 cursor-pointer justify-center">
                            <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" onChange={(e) => { if (e.target.checked) goToStep('GLOBAL66_TEST') }} />
                            <span className="font-bold text-slate-700">Ya leí los conceptos, intentar nuevamente.</span>
                        </label>
                    </div>
                );

            case 'ACTION_DECISION_G66':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">¿List@ para tomar Acción con Global 66? 🚀</h2>
                        <div className="grid gap-3">
                            <button onClick={() => goToStep('LINK_GLOBAL66')} className="p-4 bg-purple-600 text-white rounded-xl font-bold">Sí, quiero hacerlo con el producto presentado</button>
                            <button onClick={() => goToStep('OTHER_PLATFORM_INS')} className="p-4 border rounded-xl hover:bg-slate-50">Sí, quiero hacerlo pero usaré otro producto</button>
                            <button onClick={() => goToStep('CLOSING_FEEDBACK')} className="p-4 text-slate-500 text-sm">No me interesa</button>
                        </div>
                    </div>
                );

            // --- Links & Sharing ---
            case 'LINK_INSIGHTS':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
                            <p className="font-bold mb-2">Paso E: Tomar Acción</p>
                            <p>Abre YA tu cuenta gratis en Insights WM. Si te pide algún código, solo debes escribir <strong>DEEPEND</strong>.</p>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Abre tu cuenta en Insights WM 🔗</h2>
                        <a href="https://insightswm.com" target="_blank" className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold mb-4">Ir a Insights WM</a>
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="text-slate-500 underline font-medium">Ya abrí la cuenta, Continuar</button>
                    </div>
                );
            case 'LINK_GLOBAL66':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl text-purple-800 text-sm">
                            <p className="font-bold mb-2">Paso E: Tomar Acción</p>
                            <p>Abre YA tu cuenta gratis en Global66.</p>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Abre tu cuenta en Global 66 🔗</h2>
                        <a href="https://global66.com" target="_blank" className="block w-full bg-purple-600 text-white py-4 rounded-xl font-bold mb-4">Ir a Global 66</a>
                        <button onClick={() => goToStep('SHARE_ACCOUNTABILITY')} className="text-slate-500 underline font-medium">Ya abrí la cuenta, Continuar</button>
                    </div>
                );

            case 'SHARE_ACCOUNTABILITY':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><Share2 /></div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Compártelo con tu Tribu! 🗣️</h2>
                        <p className="text-slate-600 mb-6">Comparte el registro y tus avances. Tus acciones pueden ser inspiración para otras personas.</p>
                        <div className="p-4 bg-slate-50 rounded-xl mb-6 italic text-slate-500">
                            "Hoy abrí mi cuenta y/o hice mi primera inversión para la universidad de mi hij@ 🎓"
                        </div>
                        <button onClick={() => goToStep('REMINDERS')} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">Listo, Siguiente</button>
                    </div>
                );

            case 'REMINDERS':
                return (
                    <div className="max-w-xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex justify-center items-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                                <Bell size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">¿Activamos Recordatorios? 🔔</h2>
                            <p className="text-slate-500">¿Deseas activar los recordatorios por parte de DeepEnd? Solo serán en tus fechas programadas.</p>
                        </div>
                        <div className="grid gap-3">
                            <button onClick={() => { handleAnswer('reminders', true); goToStep('REMINDER_DATE_SELECTION'); }} className="p-4 bg-emerald-600 text-white rounded-xl font-bold">Sí, quiero recordatorios</button>
                            <button onClick={() => { handleAnswer('reminders', false); saveReminders(); saveSubmission(); goToStep('SUBMISSION_SUCCESS'); }} className="p-4 border rounded-xl hover:bg-slate-50">No, gracias</button>
                        </div>
                    </div>
                );

            case 'REMINDER_DATE_SELECTION':
                return (
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">¿Qué día del mes quieres recibir los recordatorios?</h2>
                        <p className="text-slate-600 mb-6">Selecciona un día (1-31) para que te enviemos el recordatorio mensual.</p>

                        <select
                            className="w-full p-4 rounded-xl border border-slate-200 mb-6 bg-white"
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
                            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                );

            case 'SUBMISSION_SUCCESS':
                return (
                    <div className="max-w-xl mx-auto text-center py-12">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Reto Activado! 🚀</h2>
                        <p className="text-slate-600 mb-8">Has dado un gran paso hacia tu claridad financiera.</p>
                        <button onClick={() => navigate('/challenges')} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold">Volver a mis Retos</button>
                    </div>
                );

            case 'GASTO_HORMIGA_REDIRECT':
                return (
                    <div className="max-w-xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <span className="text-3xl">🔄</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Muy bien! Vamos a generar liquidez.</h2>
                            <p className="text-slate-600">
                                Para esta ruta, te recomendamos ir al reto de <strong>"Gasto Hormiga"</strong>. Allí encontrarás las herramientas para liberar flujo de caja.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/challenges')} // Or specific ID if known
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            Ir a Retos
                        </button>
                    </div>
                );

            case 'CLOSING_FEEDBACK':
                return (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 space-y-6">
                        <div className="bg-emerald-100 p-4 rounded-lg border border-emerald-200 mb-6">
                            <h3 className="font-bold text-emerald-800 text-lg mb-1">¡Entendido!</h3>
                            <p className="text-emerald-700 text-sm">
                                Consideramos muy valioso entender tu <strong>por qué</strong> ❓. Nos ayuda a mejorar y a ofrecer recursos que puedan aportarte más valor y a también a otros usuarios.
                            </p>
                        </div>

                        <div className="bg-emerald-500 text-white p-2 rounded-lg text-center font-bold mb-6">
                            Un par de preguntas más y ¡terminamos! Lo hiciste increíble 🟢
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                ¡Cuéntanos!: ¿Qué te impide dar el paso ahora? 🚫
                            </label>
                            <p className="text-xs text-slate-500 mb-2 italic">La respuesta que resuene más contigo, nos ayudará mucho para seguir avanzando ↓</p>
                            <textarea
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all h-24 resize-none"
                                placeholder="Escribe tu respuesta aquí..."
                                onChange={(e) => handleAnswer('feedback_impediment', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                ✍️ ¿Hay algo que podamos aclarar, simplificar o compartir para que te resulte útil en el futuro?
                            </label>
                            <p className="text-xs text-slate-500 mb-2 italic">La respuesta que resuene más contigo, nos ayudará mucho para seguir avanzando</p>
                            <textarea
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-200 outline-none transition-all h-24 resize-none"
                                placeholder="Escribe tu respuesta aquí..."
                                onChange={(e) => handleAnswer('feedback_improvement', e.target.value)}
                            />
                        </div>
                        <button
                            onClick={async () => {
                                await saveSubmission();
                                navigate('/challenges');
                            }}
                            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold mt-6"
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
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
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
                            className="flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            {history.length > 0 ? 'Volver' : 'Cancelar'}
                        </button>
                        <div className="text-sm font-bold text-slate-300">MY MONEY IN ACTION</div>
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
