import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../../components/shared/Header';
import { DollarSign, Home, Zap, ShoppingCart, Car, Coffee, HeartPulse, HelpCircle, Save, CheckCircle, TrendingUp, CreditCard, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../store/useAuth';
// @ts-ignore
import canvasConfetti from 'canvas-confetti';

// Types
interface NamedValue {
    id: string;
    label: string;
    value: number;
}

export default function FinancialAssessment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const challengeId = searchParams.get('challengeId');
    const { user } = useAuth();
    const userId = user?.id;

    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    // --- STATE ---

    // Load state helper (using v2 keys to separate from legacy data)
    const loadState = (key: string, defaultState: any) => {
        if (!userId) return defaultState;
        try {
            const saved = localStorage.getItem(`financial_assessment_v2_${userId}_${key}`);
            return saved ? JSON.parse(saved) : defaultState;
        } catch (e) {
            return defaultState;
        }
    };

    // 1. INGRESOS
    const [ingresos, setIngresos] = useState(() => loadState('ingresos', {
        principal: 0,
        adicionales: 0, // Freelance, rentas
        ocasionales: 0,
        // Descuentos de nómina
        seguridad_social: 0, // Salud
        pension: 0,
        retenciones: 0, // Impuestos
        otros_descuentos: [] as NamedValue[] // Libranzas, seguros, etc.
    }));

    // 2. AHORROS E INVERSIONES
    const [ahorros, setAhorros] = useState(() => loadState('ahorros', {
        programado: 0,
        inversion_automatica: 0,
        inmobiliaria: 0,
        pension_voluntaria: 0,
        otros_ahorros: [] as NamedValue[]
    }));

    // 3. DEUDAS
    const [deudas, setDeudas] = useState(() => loadState('deudas', {
        pagaste_deudas: false,
        items: [] as NamedValue[]
    }));

    // 4. GASTOS BÁSICOS - VIVIENDA
    const [vivienda, setVivienda] = useState(() => loadState('vivienda', {
        arriendo: 0,
        hipoteca: 0,
        administracion: 0
    }));

    // 5. GASTOS BÁSICOS - SERVICIOS
    const [servicios, setServicios] = useState(() => loadState('servicios', {
        luz: 0,
        agua: 0,
        gas: 0,
        internet: 0,
        celular: 0
    }));

    // 6. GASTOS BÁSICOS - ALIMENTACIÓN
    const [alimentacion, setAlimentacion] = useState(() => loadState('alimentacion', {
        supermercado: 0,
        otro: 0
    }));

    // 7. TRANSPORTE
    const [transporte, setTransporte] = useState(() => loadState('transporte', {
        gasolina_publico: 0,
        uber_taxi: 0,
        estacionamiento: 0,
        seguro_auto: 0,
        lavado_auto: 0,
        mantenimiento: 0
    }));

    // 8. ESTILO DE VIDA
    const [estiloVida, setEstiloVida] = useState(() => loadState('estiloVida', {
        streaming: 0,
        gimnasio: 0,
        salidas: 0,
        ropa_estetica: 0,
        hobbies: 0
    }));

    // 9. SALUD (GASTOS)
    const [salud, setSalud] = useState(() => loadState('salud', {
        seguros: 0,
        medicina: 0,
        consultas: 0
    }));

    // 10. OTROS
    const [otros, setOtros] = useState(() => loadState('otros', {
        valor_otros: 0,
        imprevistos: 0
    }));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // --- EFFECTS: SAVE TO STORAGE ---
    useEffect(() => {
        if (!userId) return;
        const keys = [
            { k: 'ingresos', v: ingresos },
            { k: 'ahorros', v: ahorros },
            { k: 'deudas', v: deudas },
            { k: 'vivienda', v: vivienda },
            { k: 'servicios', v: servicios },
            { k: 'alimentacion', v: alimentacion },
            { k: 'transporte', v: transporte },
            { k: 'estiloVida', v: estiloVida },
            { k: 'salud', v: salud },
            { k: 'otros', v: otros },
        ];
        keys.forEach(({ k, v }) => localStorage.setItem(`financial_assessment_v2_${userId}_${k}`, JSON.stringify(v)));

        setSaveStatus('saved');
        const timer = setTimeout(() => setSaveStatus('idle'), 2000);
        return () => clearTimeout(timer);
    }, [ingresos, ahorros, deudas, vivienda, servicios, alimentacion, transporte, estiloVida, salud, otros, userId]);


    // --- CALCULATIONS ---

    // 1. INGRESOS
    const totalIngresoBruto = (ingresos.principal || 0) + (ingresos.adicionales || 0) + (ingresos.ocasionales || 0);

    // Deducciones
    const sumOtrosDescuentos = ingresos.otros_descuentos.reduce((a: number, b: NamedValue) => a + (b.value || 0), 0);
    const totalDeducciones = (ingresos.seguridad_social || 0) + (ingresos.pension || 0) + (ingresos.retenciones || 0) + sumOtrosDescuentos;

    const ingresoNetoMensual = totalIngresoBruto - totalDeducciones;
    const pctDeducciones = ingresos.principal > 0 ? (totalDeducciones / ingresos.principal) * 100 : 0;

    // 2. AHORRO E INVERSION
    const sumOtrosAhorros = ahorros.otros_ahorros.reduce((a: number, b: NamedValue) => a + (b.value || 0), 0);
    const totalAhorroInversion = (ahorros.programado || 0) + (ahorros.inversion_automatica || 0) + (ahorros.inmobiliaria || 0) + (ahorros.pension_voluntaria || 0) + sumOtrosAhorros;
    // Prompt says: "PORCENTAJE AL QUE CORRESPONDE EL AHORRO DEL SALARIO" (Usually derived from Gross or Net? Standard is often Net, but prompts says "DEL SALARIO". Let's use Net for now as it's disposable).
    // Actually, traditionally savings rate is based on Gross or Net. Let's use Net as the denominator for all "share of wallet" metrics.
    const pctAhorro = ingresoNetoMensual > 0 ? (totalAhorroInversion / ingresoNetoMensual) * 100 : 0;

    // 3. DEUDAS
    const totalDeudas = deudas.pagaste_deudas ? deudas.items.reduce((a: number, b: NamedValue) => a + (b.value || 0), 0) : 0;
    const pctDeudas = ingresoNetoMensual > 0 ? (totalDeudas / ingresoNetoMensual) * 100 : 0;

    // 4. GASTOS BÁSICOS (Vivienda + Servicios + Alimentación)
    const totalVivienda = (Object.values(vivienda) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctVivienda = ingresoNetoMensual > 0 ? (totalVivienda / ingresoNetoMensual) * 100 : 0;

    const totalServicios = (Object.values(servicios) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctServicios = ingresoNetoMensual > 0 ? (totalServicios / ingresoNetoMensual) * 100 : 0;

    const totalAlimentacion = (Object.values(alimentacion) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctAlimentacion = ingresoNetoMensual > 0 ? (totalAlimentacion / ingresoNetoMensual) * 100 : 0;

    const subtotalGastosBasicos = totalVivienda + totalServicios + totalAlimentacion;
    const pctGastosBasicos = ingresoNetoMensual > 0 ? (subtotalGastosBasicos / ingresoNetoMensual) * 100 : 0;

    // 5. TRANSPORTE
    const totalTransporte = (Object.values(transporte) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctTransporte = ingresoNetoMensual > 0 ? (totalTransporte / ingresoNetoMensual) * 100 : 0;

    // 6. ESTILO DE VIDA
    const totalEstiloVida = (Object.values(estiloVida) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctEstiloVida = ingresoNetoMensual > 0 ? (totalEstiloVida / ingresoNetoMensual) * 100 : 0;

    // 7. SALUD (GASTOS)
    const totalSaludGastos = (Object.values(salud) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctSaludGastos = ingresoNetoMensual > 0 ? (totalSaludGastos / ingresoNetoMensual) * 100 : 0;

    // 8. OTROS
    const totalOtrosGastos = (Object.values(otros) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
    const pctOtrosGastos = ingresoNetoMensual > 0 ? (totalOtrosGastos / ingresoNetoMensual) * 100 : 0;

    // TOTAL GASTOS DE CONSUMO (Sin deudas ni ahorro)
    // "TOTAL GASTOS MENSUALES" in prompt results section context implies operational expenses.
    const totalGastosOperativos = subtotalGastosBasicos + totalTransporte + totalEstiloVida + totalSaludGastos + totalOtrosGastos;
    const pctGastosOperativos = ingresoNetoMensual > 0 ? (totalGastosOperativos / ingresoNetoMensual) * 100 : 0;

    // BALANCES
    // 1. "Cuál fue tu flujo de caja despues de ingresos y gastos" (Net Income - Op Expenses)
    const flujoDeCajaOperativo = ingresoNetoMensual - totalGastosOperativos;

    // 2. "Cuál fue tu flujo de caja despues de deudas y/o inversiones"
    // (Operativo - Deudas - Ahorro)?
    // Usually: Free Cash Flow = Income - Expenses - Debt - Savings.
    const flujoDeCajaLibre = flujoDeCajaOperativo - totalDeudas - totalAhorroInversion;

    // "Egresos totales del mes" (Includo inversiones, deudas, gastos)
    const egresosTotales = totalGastosOperativos + totalDeudas + totalAhorroInversion;

    // Savings Ratio (Again in Balance section of prompt)
    const savingsRatio = pctAhorro;

    // Formatting helpers
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val: number) => `${val.toFixed(1)}%`;

    // --- HANDLERS ---
    const handleIngresoChange = (field: string, val: number) => setIngresos((p: any) => ({ ...p, [field]: val }));
    const handleViviendaChange = (field: string, val: number) => setVivienda((p: any) => ({ ...p, [field]: val }));
    const handleServiciosChange = (field: string, val: number) => setServicios((p: any) => ({ ...p, [field]: val }));
    const handleAlimentacionChange = (field: string, val: number) => setAlimentacion((p: any) => ({ ...p, [field]: val }));
    const handleTransporteChange = (field: string, val: number) => setTransporte((p: any) => ({ ...p, [field]: val }));
    const handleEstiloVidaChange = (field: string, val: number) => setEstiloVida((p: any) => ({ ...p, [field]: val }));
    const handleSaludChange = (field: string, val: number) => setSalud((p: any) => ({ ...p, [field]: val }));
    const handleOtrosChange = (field: string, val: number) => setOtros((p: any) => ({ ...p, [field]: val }));
    const handleAhorrosChange = (field: string, val: number) => setAhorros((p: any) => ({ ...p, [field]: val }));

    const handleSubmit = async () => {
        if (!challengeId) {
            alert("No se encontró el ID del reto.");
            return;
        }

        if (!window.confirm("¿Estás seguro de que deseas guardar tu evaluación financiera?")) {
            return;
        }

        setIsSubmitting(true);
        const data = {
            v: 2, // Schema version
            ingresos,
            ahorros,
            deudas,
            vivienda,
            servicios,
            alimentacion,
            transporte,
            estiloVida,
            salud,
            otros,
            summary: {
                totalIngresoBruto,
                totalIngresos: totalIngresoBruto, // legacy compatibility
                ingresoNetoMensual,
                totalGastos: totalGastosOperativos, // legacy compat (sort of)
                totalGastosOperativos,
                egresosTotales,
                flujoCaja: flujoDeCajaLibre, // Final free cash flow
                ratioAhorro: savingsRatio,
                gastosBasicos: subtotalGastosBasicos,
                totalDeudas,
                totalAhorroInversion
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

            if (!response.ok) throw new Error('Error al guardar');

            canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

            // Clear Storage
            if (userId) {
                const keys = ['ingresos', 'ahorros', 'deudas', 'vivienda', 'servicios', 'alimentacion', 'transporte', 'estiloVida', 'salud', 'otros'];
                keys.forEach(k => localStorage.removeItem(`financial_assessment_v2_${userId}_${k}`));
            }

            alert("Evaluación guardada exitosamente!");
            navigate(`/challenges/detail?id=${challengeId}`);
        } catch (error) {
            console.error(error);
            alert("Error al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
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
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Show me the Money</h1>
                            <p className="text-slate-500">Aquí no importa si son muchos o pocos, lo que importa es que lo que registres sea real.</p>
                            {saveStatus === 'saved' && <span className="text-xs text-emerald-500 flex items-center mt-2"><CheckCircle size={12} className="mr-1" /> Guardado en borrador</span>}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-200 disabled:opacity-50 flex items-center"
                        >
                            {isSubmitting ? 'Guardando...' : <><Save size={18} className="mr-2" /> Guardar Resultados</>}
                        </button>
                    </div>

                    <div className="space-y-8">

                        {/* 1. INGRESOS */}
                        <SectionCard title="INGRESOS" icon={<DollarSign className="mr-2" />} color="text-emerald-600" borderColor="border-emerald-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <InputGroup label="Salario / Ingreso principal" subLabel="(Lo que entra a tu cuenta)" value={ingresos.principal} onChange={(v) => handleIngresoChange('principal', v)} />
                                <InputGroup label="Ingresos adicionales" subLabel="(Freelance, rentas)" value={ingresos.adicionales} onChange={(v) => handleIngresoChange('adicionales', v)} />
                                <InputGroup label="Ingresos ocasionales" subLabel="(Promedio mensual)" value={ingresos.ocasionales} onChange={(v) => handleIngresoChange('ocasionales', v)} />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Descuentos de Nómina / Impuestos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <InputGroup label="Seguridad Social / Salud" value={ingresos.seguridad_social} onChange={(v) => handleIngresoChange('seguridad_social', v)} />
                                    <InputGroup label="Pensión" value={ingresos.pension} onChange={(v) => handleIngresoChange('pension', v)} />
                                    <InputGroup label="Retenciones / Impuestos" value={ingresos.retenciones} onChange={(v) => handleIngresoChange('retenciones', v)} />
                                </div>
                                <DynamicList
                                    title="Otros Descuentos (Libranzas, seguros, etc.)"
                                    items={ingresos.otros_descuentos}
                                    onChange={(items) => setIngresos((p: any) => ({ ...p, otros_descuentos: items }))}
                                />
                            </div>

                            <SimpleSummary label="INGRESO NETO MENSUAL (Disponible)" value={ingresoNetoMensual} note={`Total deducciones: ${formatCurrency(totalDeducciones)} (${formatPercent(pctDeducciones)})`} formatCurrency={formatCurrency} />
                        </SectionCard>

                        {/* 2. AHORRO E INVERSION */}
                        <SectionCard title="AHORRO E INVERSIONES" icon={<TrendingUp className="mr-2" />} color="text-blue-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <InputGroup label="Ahorro Programado" subLabel="(Débito automático/manual)" value={ahorros.programado} onChange={(v) => handleAhorrosChange('programado', v)} />
                                <InputGroup label="Inversión Automática" subLabel="(CDT, Fondos, Acciones)" value={ahorros.inversion_automatica} onChange={(v) => handleAhorrosChange('inversion_automatica', v)} />
                                <InputGroup label="Inversión Inmobiliaria" subLabel="(Rentas, crowdfunding)" value={ahorros.inmobiliaria} onChange={(v) => handleAhorrosChange('inmobiliaria', v)} />
                                <InputGroup label="Pensión Voluntaria" value={ahorros.pension_voluntaria} onChange={(v) => handleAhorrosChange('pension_voluntaria', v)} />
                            </div>
                            <DynamicList
                                title="Otros Ahorros Automáticos/Manuales"
                                items={ahorros.otros_ahorros}
                                onChange={(items) => setAhorros((p: any) => ({ ...p, otros_ahorros: items }))}
                            />
                            <SimpleSummary label="TOTAL DESTINADO A INVERSIÓN/AHORRO" value={totalAhorroInversion} note={`Ratio de ahorro: ${formatPercent(pctAhorro)}`} formatCurrency={formatCurrency} />
                        </SectionCard>

                        {/* 3. DEUDAS */}
                        <SectionCard title="DEUDAS" icon={<CreditCard className="mr-2" />} color="text-red-500">
                            <div className="mb-6">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                        checked={deudas.pagaste_deudas}
                                        onChange={(e) => setDeudas((p: any) => ({ ...p, pagaste_deudas: e.target.checked }))}
                                    />
                                    <span className="text-slate-700 font-medium">¿Pagaste deudas este mes?</span>
                                </label>
                            </div>

                            {deudas.pagaste_deudas && (
                                <DynamicList
                                    title="Registro de Deudas (Tarjeta, Crédito, Préstamo...)"
                                    items={deudas.items}
                                    onChange={(items) => setDeudas((p: any) => ({ ...p, items }))}
                                />
                            )}
                            <SimpleSummary label="TOTAL DESTINADO A DEUDAS" value={totalDeudas} note={`${formatPercent(pctDeudas)} de tu ingreso neto`} formatCurrency={formatCurrency} />
                        </SectionCard>


                        {/* 4. VIVIENDA */}
                        <SectionCard title="VIVIENDA" icon={<Home className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Arriendo" value={vivienda.arriendo} onChange={(v) => handleViviendaChange('arriendo', v)} />
                                <InputGroup label="Hipoteca" value={vivienda.hipoteca} onChange={(v) => handleViviendaChange('hipoteca', v)} />
                                <InputGroup label="Administración" value={vivienda.administracion} onChange={(v) => handleViviendaChange('administracion', v)} />
                            </div>
                            <SummaryRow label="GASTO VIVIENDA" value={totalVivienda} percent={pctVivienda} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </SectionCard>

                        {/* 5. SERVICIOS */}
                        <SectionCard title="SERVICIOS" icon={<Zap className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Luz" value={servicios.luz} onChange={(v) => handleServiciosChange('luz', v)} />
                                <InputGroup label="Agua" value={servicios.agua} onChange={(v) => handleServiciosChange('agua', v)} />
                                <InputGroup label="Gas" value={servicios.gas} onChange={(v) => handleServiciosChange('gas', v)} />
                                <InputGroup label="Internet" value={servicios.internet} onChange={(v) => handleServiciosChange('internet', v)} />
                                <InputGroup label="Celular" value={servicios.celular} onChange={(v) => handleServiciosChange('celular', v)} />
                            </div>
                            <SummaryRow label="GASTO SERVICIOS" value={totalServicios} percent={pctServicios} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </SectionCard>

                        {/* 6. ALIMENTACION (Includes Basic Expenses Subtotal) */}
                        <SectionCard title="ALIMENTACIÓN" icon={<ShoppingCart className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Supermercado" value={alimentacion.supermercado} onChange={(v) => handleAlimentacionChange('supermercado', v)} />
                                <InputGroup label="Otro" value={alimentacion.otro} onChange={(v) => handleAlimentacionChange('otro', v)} />
                            </div>
                            <SummaryRow label="GASTO ALIMENTACIÓN" value={totalAlimentacion} percent={pctAlimentacion} formatCurrency={formatCurrency} formatPercent={formatPercent} />

                            <div className="mt-4 pt-4 border-t border-slate-200 bg-orange-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center text-orange-900">
                                    <span className="font-bold text-sm uppercase">SUBTOTAL GASTOS BÁSICOS (Vivienda + Servicios + Alim)</span>
                                    <span className="font-bold text-lg">{formatCurrency(subtotalGastosBasicos)}</span>
                                </div>
                                <div className="text-right text-xs text-orange-700 mt-1">{formatPercent(pctGastosBasicos)} del ingreso neto</div>
                            </div>
                        </SectionCard>

                        {/* 7. TRANSPORTE */}
                        <SectionCard title="TRANSPORTE" icon={<Car className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Gasolina / transporte público" value={transporte.gasolina_publico} onChange={(v) => handleTransporteChange('gasolina_publico', v)} />
                                <InputGroup label="Uber / Taxi" value={transporte.uber_taxi} onChange={(v) => handleTransporteChange('uber_taxi', v)} />
                                <InputGroup label="Estacionamiento" value={transporte.estacionamiento} onChange={(v) => handleTransporteChange('estacionamiento', v)} />
                                <InputGroup label="Seguro auto" value={transporte.seguro_auto} onChange={(v) => handleTransporteChange('seguro_auto', v)} />
                                <InputGroup label="Lavado auto" value={transporte.lavado_auto} onChange={(v) => handleTransporteChange('lavado_auto', v)} />
                                <InputGroup label="Mantenimiento auto" value={transporte.mantenimiento} onChange={(v) => handleTransporteChange('mantenimiento', v)} />
                            </div>
                            <SummaryRow label="GASTO TRANSPORTE" value={totalTransporte} percent={pctTransporte} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </SectionCard>

                        {/* 8. ESTILO DE VIDA */}
                        <SectionCard title="ESTILO DE VIDA" icon={<Coffee className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Streaming" value={estiloVida.streaming} onChange={(v) => handleEstiloVidaChange('streaming', v)} />
                                <InputGroup label="Gimnasio" value={estiloVida.gimnasio} onChange={(v) => handleEstiloVidaChange('gimnasio', v)} />
                                <InputGroup label="Salidas sociales" value={estiloVida.salidas} onChange={(v) => handleEstiloVidaChange('salidas', v)} />
                                <InputGroup label="Ropa/Estética" value={estiloVida.ropa_estetica} onChange={(v) => handleEstiloVidaChange('ropa_estetica', v)} />
                                <InputGroup label="Hobbies" value={estiloVida.hobbies} onChange={(v) => handleEstiloVidaChange('hobbies', v)} />
                            </div>
                            <SummaryRow label="GASTO ESTILO DE VIDA" value={totalEstiloVida} percent={pctEstiloVida} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </SectionCard>

                        {/* 9. SALUD */}
                        <SectionCard title="SALUD" icon={<HeartPulse className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputGroup label="Seguros" value={salud.seguros} onChange={(v) => handleSaludChange('seguros', v)} />
                                <InputGroup label="Medicina" value={salud.medicina} onChange={(v) => handleSaludChange('medicina', v)} />
                                <InputGroup label="Consultas médicas" value={salud.consultas} onChange={(v) => handleSaludChange('consultas', v)} />
                            </div>
                            <SummaryRow label="GASTO SALUD" value={totalSaludGastos} percent={pctSaludGastos} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </SectionCard>

                        {/* 10. OTROS */}
                        <SectionCard title="OTROS" icon={<HelpCircle className="mr-2" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Valor otros gastos" value={otros.valor_otros} onChange={(v) => handleOtrosChange('valor_otros', v)} />
                                <InputGroup label="Imprevistos" value={otros.imprevistos} onChange={(v) => handleOtrosChange('imprevistos', v)} />
                            </div>
                            <SummaryRow label="OTROS GASTOS" value={totalOtrosGastos} percent={pctOtrosGastos} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                        </SectionCard>

                        {/* RESULTADOS Y BALANCE */}
                        <section className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white mt-8">
                            <h2 className="text-2xl font-bold mb-8 text-center text-emerald-400">Balance y Resultados</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 border-b border-slate-700 pb-8">
                                <StatBox label="Ingreso Neto" value={formatCurrency(ingresoNetoMensual)} sub="Disponible" />
                                <StatBox label="Egresos Totales" value={formatCurrency(egresosTotales)} sub="Gastos + Deuda + Ahorro" color="text-red-400" />
                                <StatBox label="Flujo de Caja Libre" value={formatCurrency(flujoDeCajaLibre)} sub="Final del mes" color={flujoDeCajaLibre >= 0 ? "text-emerald-400" : "text-red-500"} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ResultCard label="Gastos Operativos" value={formatCurrency(totalGastosOperativos)} subtext={`${formatPercent(pctGastosOperativos)} del ingreso`} />
                                <ResultCard label="Deudas" value={formatCurrency(totalDeudas)} subtext={`${formatPercent(pctDeudas)} del ingreso`} />
                                <ResultCard label="Inversión/Ahorro" value={formatCurrency(totalAhorroInversion)} subtext={`${formatPercent(pctAhorro)} del ingreso`} color="text-blue-400" />
                                <ResultCard label="Descuentos e Impuestos" value={formatCurrency(totalDeducciones)} subtext={`${formatPercent(pctDeducciones)} del ingreso`} />
                                <ResultCard label="Gastos Básicos" value={formatCurrency(subtotalGastosBasicos)} subtext={`${formatPercent(pctGastosBasicos)} del ingreso`} />
                                <ResultCard label="valor total otros gastos" value={formatCurrency(totalGastosOperativos - subtotalGastosBasicos)} subtext={`${formatPercent((totalGastosOperativos - subtotalGastosBasicos) / ingresoNetoMensual * 100)} del ingreso`} />
                                <ResultCard label="Flujo de Caja Después de Deudas y/o Inversiones" value={formatCurrency(ingresoNetoMensual - totalDeudas - totalAhorroInversion)} subtext={`${formatPercent(((ingresoNetoMensual - totalDeudas - totalAhorroInversion) / ingresoNetoMensual) * 100)} del ingreso`} />
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function SectionCard({ title, icon, children, color = "text-slate-700", borderColor = "border-slate-200" }: { title: string, icon: React.ReactNode, children: React.ReactNode, color?: string, borderColor?: string }) {
    return (
        <section className={`bg-white rounded-2xl shadow-sm border ${borderColor} p-6`}>
            <h2 className={`flex items-center text-xl font-bold ${color} mb-6 border-b border-slate-100 pb-2`}>
                {icon} {title}
            </h2>
            {children}
        </section>
    );
}

function InputGroup({ label, subLabel, value, onChange, tooltip }: { label: string, subLabel?: string, value: number, onChange: (val: number) => void, tooltip?: string }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">
                {label}
                {subLabel && <span className="text-slate-400 font-normal ml-1">{subLabel}</span>}
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                    type="number"
                    min="0"
                    value={value || ''}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                    placeholder="0"
                />
            </div>
            {tooltip && <p className="text-xs text-slate-400 mt-1">{tooltip}</p>}
        </div>
    );
}

function SummaryRow({ label, value, percent, formatCurrency, formatPercent }: { label: string, value: number, percent: number, formatCurrency: (v: number) => string, formatPercent: (v: number) => string }) {
    return (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl flex justify-between items-center text-slate-700 font-medium">
            <div className="flex flex-col">
                <span className="uppercase text-xs font-bold text-slate-400 tracking-wider">Subtotal</span>
                <span>{label}</span>
            </div>
            <div className="text-right">
                <div className="text-lg font-bold">{formatCurrency(value)}</div>
                <div className="text-xs text-slate-400">{formatPercent(percent)} de ingreso neto</div>
            </div>
        </div>
    );
}

function SimpleSummary({ label, value, note, formatCurrency }: { label: string, value: number, note?: string, formatCurrency: (v: number) => string }) {
    return (
        <div className="mt-6 p-4 bg-emerald-50 rounded-xl flex justify-between items-center text-emerald-900 border border-emerald-100">
            <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide">{label}</span>
                {note && <span className="text-xs text-emerald-600 mt-1">{note}</span>}
            </div>
            <span className="text-xl font-bold">{formatCurrency(value)}</span>
        </div>
    );
}

function StatBox({ label, value, sub, color = "text-white" }: { label: string, value: string, sub?: string, color?: string }) {
    return (
        <div className="text-center">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">{label}</h3>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-sm text-slate-500">{sub}</p>}
        </div>
    );
}

function ResultCard({ label, value, subtext, color = "text-white" }: { label: string, value: string, subtext?: string, color?: string }) {
    return (
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</h4>
            <div className={`text-xl font-bold ${color} mb-1`}>{value}</div>
            {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
    );
}

function DynamicList({ title, items, onChange }: { title: string, items: NamedValue[], onChange: (items: NamedValue[]) => void }) {
    const addItem = () => {
        onChange([...items, { id: crypto.randomUUID(), label: '', value: 0 }]);
    };

    const updateItem = (id: string, field: 'label' | 'value', val: any) => {
        onChange(items.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const removeItem = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    return (
        <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-700">{title}</h4>
                <button onClick={addItem} className="text-emerald-600 text-xs font-bold hover:text-emerald-700 flex items-center">
                    <Plus size={14} className="mr-1" /> Agregar
                </button>
            </div>
            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="flex gap-2 items-center">
                        <input
                            placeholder="Nombre / Concepto"
                            className="flex-1 text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                            value={item.label}
                            onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                        />
                        <div className="relative w-32">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full pl-5 p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                value={item.value || ''}
                                onChange={(e) => updateItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-xs text-slate-400 italic">No hay items agregados.</p>}
            </div>
        </div>
    );
}
