import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../../components/shared/Header';
import { DollarSign, Home, Zap, ShoppingCart, Car, Coffee, HeartPulse, HelpCircle, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
// @ts-ignore
import canvasConfetti from 'canvas-confetti';
import { C } from '../../styles/colors';

interface FinancialState {
    [key: string]: number;
}

export default function FinancialAssessmentBasic() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const challengeId = searchParams.get('challengeId');
    const { user } = useAuth();
    const userId = user?.id;

    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    // --- STATE ---

    // Initial state factories to try loading from localStorage first
    const loadState = (key: string, defaultState: any) => {
        if (!userId) return defaultState;
        const saved = localStorage.getItem(`financial_assessment_${userId}_${key}`);
        return saved ? JSON.parse(saved) : defaultState;
    };

    // INGRESOS
    const [ingresos, setIngresos] = useState(() => loadState('ingresos', {
        salario: 0,
        adicionales: 0,
        ocasionales: 0
    }));

    // VIVIENDA
    const [vivienda, setVivienda] = useState(() => loadState('vivienda', {
        arriendo: 0,
        hipoteca: 0,
        administracion: 0
    }));

    // SERVICIOS
    const [servicios, setServicios] = useState(() => loadState('servicios', {
        luz: 0,
        agua: 0,
        gas: 0,
        internet: 0,
        celular: 0
    }));

    // ALIMENTACIÓN
    const [alimentacion, setAlimentacion] = useState(() => loadState('alimentacion', {
        supermercado: 0,
        otro: 0
    }));

    // TRANSPORTE
    const [transporte, setTransporte] = useState(() => loadState('transporte', {
        gasolina_publico: 0,
        uber_taxi: 0,
        estacionamiento: 0,
        seguro_auto: 0,
        lavado_auto: 0,
        mantenimiento: 0
    }));

    // ESTILO DE VIDA
    const [estiloVida, setEstiloVida] = useState(() => loadState('estiloVida', {
        streaming: 0,
        gimnasio: 0,
        salidas: 0,
        ropa_estetica: 0,
        hobbies: 0
    }));

    // SALUD
    const [salud, setSalud] = useState(() => loadState('salud', {
        seguros: 0,
        medicina: 0,
        consultas: 0
    }));

    // OTROS
    const [otros, setOtros] = useState(() => loadState('otros', {
        valor_otros: 0,
        imprevistos: 0
    }));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');


    // --- EFFECTS ---

    // Save to LocalStorage on change
    useEffect(() => {
        if (!userId) return;
        localStorage.setItem(`financial_assessment_${userId}_ingresos`, JSON.stringify(ingresos));
        localStorage.setItem(`financial_assessment_${userId}_vivienda`, JSON.stringify(vivienda));
        localStorage.setItem(`financial_assessment_${userId}_servicios`, JSON.stringify(servicios));
        localStorage.setItem(`financial_assessment_${userId}_alimentacion`, JSON.stringify(alimentacion));
        localStorage.setItem(`financial_assessment_${userId}_transporte`, JSON.stringify(transporte));
        localStorage.setItem(`financial_assessment_${userId}_estiloVida`, JSON.stringify(estiloVida));
        localStorage.setItem(`financial_assessment_${userId}_salud`, JSON.stringify(salud));
        localStorage.setItem(`financial_assessment_${userId}_otros`, JSON.stringify(otros));
        setSaveStatus('saved');
        const timer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }, [ingresos, vivienda, servicios, alimentacion, transporte, estiloVida, salud, otros, userId]);


    // --- CALCULATIONS ---

    const totalIngresos = (Object.values(ingresos) as number[]).reduce((a, b) => a + b, 0);

    const totalVivienda = (Object.values(vivienda) as number[]).reduce((a, b) => a + b, 0);
    const pctVivienda = totalIngresos > 0 ? (totalVivienda / totalIngresos) * 100 : 0;

    const totalServicios = (Object.values(servicios) as number[]).reduce((a, b) => a + b, 0);
    const pctServicios = totalIngresos > 0 ? (totalServicios / totalIngresos) * 100 : 0;

    const totalAlimentacion = (Object.values(alimentacion) as number[]).reduce((a, b) => a + b, 0);
    const pctAlimentacion = totalIngresos > 0 ? (totalAlimentacion / totalIngresos) * 100 : 0;

    const totalTransporte = (Object.values(transporte) as number[]).reduce((a, b) => a + b, 0);
    const pctTransporte = totalIngresos > 0 ? (totalTransporte / totalIngresos) * 100 : 0;

    const totalEstiloVida = (Object.values(estiloVida) as number[]).reduce((a, b) => a + b, 0);
    const pctEstiloVida = totalIngresos > 0 ? (totalEstiloVida / totalIngresos) * 100 : 0;

    const totalSalud = (Object.values(salud) as number[]).reduce((a, b) => a + b, 0);
    const pctSalud = totalIngresos > 0 ? (totalSalud / totalIngresos) * 100 : 0;

    const totalOtros = (Object.values(otros) as number[]).reduce((a, b) => a + b, 0);
    const pctOtros = totalIngresos > 0 ? (totalOtros / totalIngresos) * 100 : 0;

    // TOTAL GASTOS
    const totalGastos = totalVivienda + totalServicios + totalAlimentacion + totalTransporte + totalEstiloVida + totalSalud + totalOtros;
    const pctTotalGastos = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;

    // BALANCE
    const flujoCaja = totalIngresos - totalGastos;
    const gastosBasicos = totalVivienda + totalServicios + totalAlimentacion; // "Gastos Básicos" usually includes Health
    const pctGastosBasicos = totalIngresos > 0 ? (gastosBasicos / totalIngresos) * 100 : 0;

    const gastosNoBasicos = totalEstiloVida + totalOtros + totalTransporte + totalSalud;

    const ratioAhorro = totalIngresos > 0 ? (flujoCaja / totalIngresos) * 100 : 0;

    // Unused calculation kept for reference if needed
    // const balanceIngresos = totalIngresos > 0 ? (flujoCaja / totalIngresos) * 100 : 0; 

    // --- HANDLERS ---

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<any>>, field: string) => {
        const val = parseFloat(e.target.value) || 0;
        setter((prev: any) => ({ ...prev, [field]: val }));
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    }
    const formatPercent = (val: number) => {
        return `${val.toFixed(1)}%`;
    }

    const handleSubmit = async () => {
        if (!challengeId) {
            alert("No se encontró el ID del reto. Asegúrate de acceder desde el detalle del reto.");
            return;
        }

        if (!window.confirm("¿Estás seguro de que deseas guardar tu evaluación financiera?")) {
            return;
        }

        setIsSubmitting(true);
        const data = {
            ingresos,
            vivienda,
            servicios,
            alimentacion,
            transporte,
            estiloVida,
            salud,
            otros,
            summary: {
                totalIngresos,
                totalGastos,
                flujoCaja,
                gastosBasicos,
                ratioAhorro
            },
            submittedAt: new Date().toISOString()
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${host}/api/challenges/${challengeId}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ responses: data })
            });

            if (!response.ok) {
                throw new Error('Error al guardar la evaluación');
            }

            // Success
            canvasConfetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Clear LocalStorage
            if (userId) {
                localStorage.removeItem(`financial_assessment_${userId}_ingresos`);
                localStorage.removeItem(`financial_assessment_${userId}_vivienda`);
                localStorage.removeItem(`financial_assessment_${userId}_servicios`);
                localStorage.removeItem(`financial_assessment_${userId}_alimentacion`);
                localStorage.removeItem(`financial_assessment_${userId}_transporte`);
                localStorage.removeItem(`financial_assessment_${userId}_estiloVida`);
                localStorage.removeItem(`financial_assessment_${userId}_salud`);
                localStorage.removeItem(`financial_assessment_${userId}_otros`);
            }

            alert("Evaluación guardada exitosamente!");
            // Redirect to Challenge Detail
            navigate(`/challenges/detail?id=${challengeId}`);
        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar la evaluación.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Recursos" />

            <main className="flex-1 overflow-y-auto">
                <div
                    className="max-w-4xl mx-auto p-6 md:p-12 pb-32"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                >

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2" style={{ color: C.text }}>Evaluación Financiera (Básica)</h1>
                            <p style={{ color: C.textMuted }}>Ingresa tus datos mensuales para obtener un diagnóstico de tu salud financiera.</p>
                            {saveStatus === 'saved' && <span className="text-xs flex items-center mt-2" style={{ color: C.green }}><CheckCircle size={12} className="mr-1" /> Guardado en borrador</span>}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center" style={{ background: C.green }}
                        >
                            {isSubmitting ? 'Guardando...' : <><Save size={18} className="mr-2" /> Guardar Resultados</>}
                        </button>
                    </div>

                    <div className="space-y-8">

                        {/* SECCION: INGRESOS */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.green, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <DollarSign className="mr-2" /> INGRESOS
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    label="Salario/Ingreso principal"
                                    subLabel="(después de impuestos)"
                                    value={ingresos.salario}
                                    onChange={(e) => handleNumberChange(e, setIngresos, 'salario')}
                                    tooltip="Registra únicamente el dinero que efectivamente llegó a tu cuenta."
                                />
                                <InputGroup
                                    label="Otros ingresos"
                                    subLabel="(freelance, rentas, etc.)"
                                    value={ingresos.adicionales}
                                    onChange={(e) => handleNumberChange(e, setIngresos, 'adicionales')}
                                />
                                <InputGroup
                                    label="Ingresos no recurrentes"
                                    subLabel="(promedio mensual)"
                                    value={ingresos.ocasionales}
                                    onChange={(e) => handleNumberChange(e, setIngresos, 'ocasionales')}
                                />
                            </div>
                            <div className="mt-6 p-4 rounded-xl flex justify-between items-center font-bold" style={{ background: C.forest, color: C.green }}>
                                <span>TOTAL INGRESOS MENSUALES</span>
                                <span className="text-xl">{formatCurrency(totalIngresos)}</span>
                            </div>
                        </section>

                        {/* SECCION: VIVIENDA */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <Home className="mr-2" /> VIVIENDA
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Arriendo" value={vivienda.arriendo} onChange={(e) => handleNumberChange(e, setVivienda, 'arriendo')} />
                                <InputGroup label="Hipoteca" value={vivienda.hipoteca} onChange={(e) => handleNumberChange(e, setVivienda, 'hipoteca')} />
                                <InputGroup label="Administración" value={vivienda.administracion} onChange={(e) => handleNumberChange(e, setVivienda, 'administracion')} />
                            </div>
                            <SummaryRow label="GASTO VIVIENDA" value={totalVivienda} percent={pctVivienda} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </section>

                        {/* SECCION: SERVICIOS */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <Zap className="mr-2" /> SERVICIOS
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Luz" value={servicios.luz} onChange={(e) => handleNumberChange(e, setServicios, 'luz')} />
                                <InputGroup label="Agua" value={servicios.agua} onChange={(e) => handleNumberChange(e, setServicios, 'agua')} />
                                <InputGroup label="Gas" value={servicios.gas} onChange={(e) => handleNumberChange(e, setServicios, 'gas')} />
                                <InputGroup label="Internet" value={servicios.internet} onChange={(e) => handleNumberChange(e, setServicios, 'internet')} />
                                <InputGroup label="Celular" value={servicios.celular} onChange={(e) => handleNumberChange(e, setServicios, 'celular')} />
                            </div>
                            <SummaryRow label="GASTO SERVICIOS" value={totalServicios} percent={pctServicios} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </section>

                        {/* SECCION: ALIMENTACIÓN */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <ShoppingCart className="mr-2" /> ALIMENTACIÓN
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Supermercado" value={alimentacion.supermercado} onChange={(e) => handleNumberChange(e, setAlimentacion, 'supermercado')} />
                                <InputGroup label="Otro" value={alimentacion.otro} onChange={(e) => handleNumberChange(e, setAlimentacion, 'otro')} />
                            </div>
                            <SummaryRow label="GASTO ALIMENTACIÓN" value={totalAlimentacion} percent={pctAlimentacion} formatCurrency={formatCurrency} formatPercent={formatPercent} />

                            <div className="mt-2 pt-2 md:col-span-2" style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: C.border }}>
                                <div className="flex justify-between items-center text-sm" style={{ color: C.textMuted }}>
                                    <span>Subtotal Gastos Básicos (Vivienda+Servicios+Alim)</span>
                                    <span>{formatCurrency(totalVivienda + totalServicios + totalAlimentacion)}</span>
                                </div>
                            </div>
                        </section>

                        {/* SECCION: TRANSPORTE */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <Car className="mr-2" /> TRANSPORTE
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Gasolina / transporte público" value={transporte.gasolina_publico} onChange={(e) => handleNumberChange(e, setTransporte, 'gasolina_publico')} />
                                <InputGroup label="Uber / Taxi" value={transporte.uber_taxi} onChange={(e) => handleNumberChange(e, setTransporte, 'uber_taxi')} />
                                <InputGroup label="Estacionamiento" value={transporte.estacionamiento} onChange={(e) => handleNumberChange(e, setTransporte, 'estacionamiento')} />
                                <InputGroup label="Seguro auto" value={transporte.seguro_auto} onChange={(e) => handleNumberChange(e, setTransporte, 'seguro_auto')} />
                                <InputGroup label="Lavado auto" value={transporte.lavado_auto} onChange={(e) => handleNumberChange(e, setTransporte, 'lavado_auto')} />
                                <InputGroup label="Mantenimiento auto" value={transporte.mantenimiento} onChange={(e) => handleNumberChange(e, setTransporte, 'mantenimiento')} />
                            </div>
                            <SummaryRow label="GASTO TRANSPORTE" value={totalTransporte} percent={pctTransporte} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </section>

                        {/* SECCION: ESTILO DE VIDA */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <Coffee className="mr-2" /> ESTILO DE VIDA
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Streaming" value={estiloVida.streaming} onChange={(e) => handleNumberChange(e, setEstiloVida, 'streaming')} />
                                <InputGroup label="Gimnasio" value={estiloVida.gimnasio} onChange={(e) => handleNumberChange(e, setEstiloVida, 'gimnasio')} />
                                <InputGroup label="Salidas sociales" value={estiloVida.salidas} onChange={(e) => handleNumberChange(e, setEstiloVida, 'salidas')} />
                                <InputGroup label="Ropa/Estética" value={estiloVida.ropa_estetica} onChange={(e) => handleNumberChange(e, setEstiloVida, 'ropa_estetica')} />
                                <InputGroup label="Hobbies" value={estiloVida.hobbies} onChange={(e) => handleNumberChange(e, setEstiloVida, 'hobbies')} />
                            </div>
                            <SummaryRow label="GASTO ESTILO DE VIDA" value={totalEstiloVida} percent={pctEstiloVida} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </section>

                        {/* SECCION: SALUD */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <HeartPulse className="mr-2" /> SALUD
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Seguros" value={salud.seguros} onChange={(e) => handleNumberChange(e, setSalud, 'seguros')} />
                                <InputGroup label="Medicina" value={salud.medicina} onChange={(e) => handleNumberChange(e, setSalud, 'medicina')} />
                                <InputGroup label="Consultas médicas" value={salud.consultas} onChange={(e) => handleNumberChange(e, setSalud, 'consultas')} />
                            </div>
                            <SummaryRow label="GASTO SALUD" value={totalSalud} percent={pctSalud} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </section>

                        {/* SECCION: OTROS */}
                        <section className="rounded-2xl shadow-sm p-6" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
                            <h2 className="flex items-center text-xl font-bold mb-6 pb-2" style={{ color: C.textSec, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <HelpCircle className="mr-2" /> OTROS
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Valor de esos otros gastos" value={otros.valor_otros} onChange={(e) => handleNumberChange(e, setOtros, 'valor_otros')} />
                                <InputGroup label="Imprevistos" value={otros.imprevistos} onChange={(e) => handleNumberChange(e, setOtros, 'imprevistos')} />
                            </div>
                            <SummaryRow label="OTROS GASTOS" value={totalOtros} percent={pctOtros} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </section>

                        {/* RESULTADOS y BALANCE */}
                        <section className="rounded-3xl shadow-xl p-8 text-white mt-8" style={{ background: C.bgDeep }}>
                            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: C.green }}>Balance Financiero</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8" style={{ borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: C.border }}>
                                <div className="text-center">
                                    <h3 className="text-sm uppercase tracking-wider mb-2" style={{ color: C.label }}>Total Ingresos</h3>
                                    <p className="text-3xl font-bold" style={{ color: C.text }}>{formatCurrency(totalIngresos)}</p>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm uppercase tracking-wider mb-2" style={{ color: C.label }}>Total Gastos</h3>
                                    <p className="text-3xl font-bold text-red-400">{formatCurrency(totalGastos)}</p>
                                    <p className="text-sm" style={{ color: C.textMuted }}>{formatPercent(pctTotalGastos)} de tus ingresos</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ResultCard
                                    label="Flujo de Caja"
                                    value={formatCurrency(flujoCaja)}
                                    subtext={flujoCaja >= 0 ? "Superávit" : "Déficit"}
                                    color={flujoCaja >= 0 ? "text-emerald-400" : "text-red-400"}
                                />
                                <ResultCard
                                    label="Gastos Básicos"
                                    value={formatCurrency(gastosBasicos)}
                                    subtext={`${formatPercent(pctGastosBasicos)} de ingresos`}
                                />
                                <ResultCard
                                    label="Otros Gastos"
                                    value={formatCurrency(gastosNoBasicos)}
                                    subtext="Estilo de vida + Otros"
                                />
                                <ResultCard
                                    label="Ratio de Ahorro"
                                    value={formatPercent(ratioAhorro)}
                                    subtext="Meta saludable: >20%"
                                    color={ratioAhorro > 20 ? "text-emerald-400" : (ratioAhorro > 0 ? "text-yellow-400" : "text-red-400")}
                                />
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function InputGroup({ label, subLabel, value, onChange, tooltip }: { label: string, subLabel?: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, tooltip?: string }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium mb-1" style={{ color: C.textSec }}>
                {label}
                {subLabel && <span className="font-normal ml-1" style={{ color: C.label }}>{subLabel}</span>}
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.label }}>$</span>
                <input
                    type="number"
                    min="0"
                    value={value || ''}
                    onChange={onChange}
                    className="w-full pl-7 pr-4 py-2 rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, borderWidth: 1, borderStyle: 'solid', borderColor: C.border, color: C.text }}
                    placeholder="0"
                />
            </div>
            {tooltip && <p className="text-xs mt-1" style={{ color: C.label }}>{tooltip}</p>}
        </div>
    );
}

function SummaryRow({ label, value, percent, formatCurrency, formatPercent }: { label: string, value: number, percent: number, formatCurrency: (v: number) => string, formatPercent: (v: number) => string }) {
    return (
        <div className="mt-6 p-4 rounded-xl flex justify-between items-center font-medium" style={{ background: C.surface2, color: C.textSec }}>
            <div className="flex flex-col">
                <span className="uppercase text-xs font-bold tracking-wider" style={{ color: C.label }}>Subtotal</span>
                <span>{label}</span>
            </div>
            <div className="text-right">
                <div className="text-lg font-bold">{formatCurrency(value)}</div>
                <div className="text-xs" style={{ color: C.label }}>{formatPercent(percent)} de ingresos</div>
            </div>
        </div>
    );
}

function ResultCard({ label, value, subtext, color = "text-white" }: { label: string, value: string, subtext?: string, color?: string }) {
    return (
        <div className="p-4 rounded-2xl" style={{ background: C.surface1, borderWidth: 1, borderStyle: 'solid', borderColor: C.border }}>
            <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: C.label }}>{label}</h4>
            <div className={`text-xl font-bold ${color} mb-1`}>{value}</div>
            {subtext && <p className="text-xs" style={{ color: C.textMuted }}>{subtext}</p>}
        </div>
    );
}
