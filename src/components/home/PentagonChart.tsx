import { useState } from 'react';
import { C } from '../../styles/colors';
import { ChevronDown, ChevronUp, CircleQuestionMark, X } from 'lucide-react';


export const PentagonChart = ({ data = [
    { label: "Salud", value: 8 },
    { label: "Dinero", value: 7 },
    { label: "Amor", value: 5 },
    { label: "Carrera", value: 9 },
    { label: "Familia", value: 6 },
    { label: "Ocio", value: 8 },
    { label: "Mente", value: 7 }
], compact = false }: { data?: { label: string; value: number }[]; compact?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const size = 100;
    const center = size / 2;
    const radius = 45;
    const sides = 7;

    const getPoint = (value: number, index: number) => {
        const angle = (Math.PI * 2 / sides) * index - Math.PI / 2;
        const r = (value / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    const outerPoints = [...Array(sides)].map((_, i) => getPoint(10, i)).join(" ");
    const dataPoints  = data.map((val, i) => getPoint(val.value, i)).join(" ");

    if (compact) {
        return (
            <div className="flex flex-col items-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-28 h-28 drop-shadow-sm">
                    <polygon points={outerPoints} fill="none" stroke={C.green} strokeWidth="0.5" className="opacity-30" />
                    {[...Array(sides)].map((_, i) => {
                        const [px, py] = getPoint(10, i).split(',');
                        return <line key={i} x1={center} y1={center} x2={px} y2={py} stroke={C.green} strokeWidth="0.2" className="opacity-20" />;
                    })}
                    <polygon points={dataPoints} fill={C.green} fillOpacity="0.25" stroke={C.green} strokeWidth="2" strokeLinejoin="round" className="transition-all duration-500 ease-in-out" />
                </svg>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mx-auto my-4 flex flex-col items-center justify-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-sm">
                    <polygon
                        points={outerPoints}
                        fill="none"
                        stroke={C.green}
                        strokeWidth="0.5"
                        className="opacity-30"
                    />

                    {[...Array(sides)].map((_, i) => {
                        const [px, py] = getPoint(10, i).split(',');
                        return (
                            <line
                                key={i}
                                x1={center} y1={center}
                                x2={px} y2={py}
                                stroke={C.green}
                                strokeWidth="0.2"
                                className="opacity-20"
                            />
                        );
                    })}

                    <polygon
                        points={dataPoints}
                        fill={C.green}
                        fillOpacity="0.25"
                        stroke={C.green}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-500 ease-in-out"
                    />


                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: C.green }}>
                    <div className="p-2 rounded-full shadow-sm backdrop-blur-sm" style={{ background: '#1E1A1Bcc' }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }}></div>
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setIsInfoOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                    style={{ background: `${C.green}22`, color: C.green }}
                >
                    <CircleQuestionMark size={14} />
                    Entiende tu gráfica
                </button>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-xs transition-colors mt-2"
                style={{ color: '#A8A29E' }}
            >
                {isOpen ? 'Ocultar detalles' : 'Ver detalles'}
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && (
                <div className="w-full grid grid-cols-1 gap-2 mt-2 px-2 animate-fade-in-down">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-[12px] p-1.5 rounded border" style={{ color: '#A8A29E', background: '#252020', borderColor: '#333330' }}>
                            <span className="font-medium truncate mr-1">{item.label}</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-1 rounded-full overflow-hidden" style={{ background: '#333330' }}>
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${(item.value / 10) * 100}%`, background: C.green }}
                                    ></div>
                                </div>
                                <span className="font-bold" style={{ color: '#F5F0E8' }}>{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isInfoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#00000099', backdropFilter: 'blur(4px)' }} onClick={() => setIsInfoOpen(false)}>
                    <div className="rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in-up border" style={{ background: '#1E1A1B', borderColor: '#333330' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsInfoOpen(false)} className="absolute top-4 right-4 transition-colors" style={{ color: '#A8A29E' }}>
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold mb-4" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Entiende tu Gráfica</h3>
                        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                            <p>Esta gráfica es una fotografía de cómo te sientes <strong style={{ color: '#F5F0E8' }}>HOY</strong> en las áreas clave de tu vida. No mide quién eres ni tu valor; muestra dónde estás en este momento.</p>
                            <p>Las calificaciones van del 1 al 10, según tu percepción actual, y no tienen juicios:</p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0"></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>1–6</strong> – Áreas que hoy piden atención y decisiones conscientes.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-yellow-400 mt-1 shrink-0"></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>7–8</strong> – Áreas estables que funcionan, pero aún pueden crecer.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: C.red }}></span>
                                    <span><strong style={{ color: '#F5F0E8' }}>9–10</strong> – Áreas alineadas que reflejan hábitos y coherencia.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
