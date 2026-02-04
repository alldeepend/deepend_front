import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CircleQuestionMark, X } from 'lucide-react';

export const PentagonChart = ({ data = [
    { label: "Salud", value: 8 },
    { label: "Dinero", value: 7 },
    { label: "Amor", value: 5 },
    { label: "Carrera", value: 9 },
    { label: "Familia", value: 6 },
    { label: "Ocio", value: 8 },
    { label: "Mente", value: 7 }
] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Configuraciones de geometría
    const size = 100;
    const center = size / 2;
    const radius = 45; // El alcance máximo (valor 10)
    const sides = 7;

    // Función para calcular coordenadas (x, y) según el valor (1-10) y el índice del lado
    const getPoint = (value: any, index: any) => {
        const angle = (Math.PI * 2 / sides) * index - Math.PI / 2;
        // Normalizamos el valor: (valor / 10) * radio máximo
        const r = (value / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    // Calculamos los puntos para el fondo (Heptágono perfecto escala 10)
    const outerPoints = [...Array(sides)].map((_, i) => getPoint(10, i)).join(" ");

    // Calculamos los puntos basados en los datos reales pasados por props
    const dataPoints = data.map((val, i) => getPoint(val.value, i)).join(" ");

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mx-auto my-4 flex flex-col items-center justify-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-sm">
                    {/* Heptágono externo de guía */}
                    <polygon
                        points={outerPoints}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="0.5"
                        className="opacity-30"
                    />

                    {/* Líneas de ejes opcionales (del centro a cada esquina) */}
                    {[...Array(sides)].map((_, i) => {
                        const [px, py] = getPoint(10, i).split(',');
                        return (
                            <line
                                key={i}
                                x1={center} y1={center}
                                x2={px} y2={py}
                                stroke="#10b981"
                                strokeWidth="0.2"
                                className="opacity-20"
                            />
                        );
                    })}

                    {/* Polígono de datos dinámico */}
                    <polygon
                        points={dataPoints}
                        fill="#ecfdf5"
                        fillOpacity="0.8"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-500 ease-in-out"
                    />
                </svg>

                {/* Icono central preservado */}
                <div className="absolute inset-0 flex items-center justify-center text-emerald-500 pointer-events-none">
                    <div className="bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                </div>
                {/* Link to open info modal */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsInfoOpen(true);
                    }}

                    className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors whitespace-nowrap"
                >
                    <CircleQuestionMark size={14} />
                    Entiende tu gráfica
                </button>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-500 transition-colors mt-2"
            >
                {isOpen ? 'Ocultar detalles' : 'Ver detalles'}
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>



            {isOpen && (
                <div className="w-full grid grid-cols-1 gap-2 mt-2 px-2 animate-fade-in-down">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-[12px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                            <span className="font-medium truncate mr-1">{item.label}</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${(item.value / 10) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="font-bold text-slate-800">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Modal */}
            {isInfoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInfoOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsInfoOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-bold text-slate-800 mb-4">Entiende tu Gráfica</h3>

                        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                            <p>
                                Esta gráfica es una fotografía de cómo te sientes <strong className="text-slate-800">HOY</strong> en las áreas clave de tu vida. No mide quién eres ni tu valor; muestra dónde estás en este momento.
                            </p>
                            <p>
                                Las calificaciones van del 1 al 10, según tu percepción actual, y no tienen juicios:
                            </p>

                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0"></span>
                                    <span><strong className="text-slate-800">1–6</strong> – Áreas que hoy piden atención y decisiones conscientes.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-yellow-400 mt-1 shrink-0"></span>
                                    <span><strong className="text-slate-800">7–8</strong> – Áreas estables que funcionan, pero aún pueden crecer.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                                    <span><strong className="text-slate-800">9–10</strong> – Áreas alineadas que reflejan hábitos y coherencia.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
