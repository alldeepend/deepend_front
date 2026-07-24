import { useState, useRef } from 'react';
import { C } from '../../styles/colors';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CircleQuestionMark, X } from 'lucide-react';
import { PentagonChart } from './PentagonChart';

interface MiradaData {
    step: number;
    title: string;
    completedAt: string;
    data: { label: string; value: number }[];
}

const STEP_NAMES = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima'];

const stepLabel = (step: number) =>
    `${STEP_NAMES[step - 1] ?? `#${step}`} Mirada`;

export const MiradasSlider = ({ miradas }: { miradas: MiradaData[] }) => {
    const [index, setIndex] = useState(0);
    const [mobileIndex, setMobileIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleMobileScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, clientWidth } = scrollRef.current;
        setMobileIndex(Math.round(scrollLeft / clientWidth));
    };

    if (!miradas || miradas.length === 0) return null;

    if (miradas.length === 1) {
        return (
            <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium mb-1" style={{ color: C.red }}>
                    {stepLabel(miradas[0].step)}
                </span>
                <PentagonChart data={miradas[0].data} />
            </div>
        );
    }

    const pairs = miradas.slice(0, -1).map((m, i) => [m, miradas[i + 1]] as const);
    const [prev, curr] = pairs[index];

    return (
        <div className="w-full">
            {/* Mobile: carrusel horizontal, una gráfica a la vez */}
            <div
                ref={scrollRef}
                onScroll={handleMobileScroll}
                className="flex md:hidden overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                {miradas.map((m, i) => (
                    <div key={m.step} className="snap-start flex-none w-full flex flex-col items-center px-2">
                        <span className="text-[11px] font-medium mb-1" style={{ color: i === miradas.length - 1 ? C.red : '#A8A29E' }}>
                            {stepLabel(m.step)}
                        </span>
                        <PentagonChart data={m.data} compact />
                    </div>
                ))}
            </div>
            {miradas.length > 1 && (
                <div className="flex md:hidden justify-center gap-1.5 mt-2">
                    {miradas.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors" style={{ background: i === mobileIndex ? C.red : '#333330' }} />
                    ))}
                </div>
            )}

            <div className="hidden md:flex items-center justify-between gap-2 px-1">
                <div className="flex-1 flex flex-col items-center">
                    <span className="text-[11px] font-medium mb-1" style={{ color: '#A8A29E' }}>
                        {stepLabel(prev.step)}
                    </span>
                    <PentagonChart data={prev.data} compact />
                </div>

                <div className="flex flex-col items-center gap-1 pt-4">
                    <div className="h-14 w-px" style={{ background: '#333330' }} />
                    <span className="text-[10px]" style={{ color: '#666' }}>vs</span>
                </div>

                <div className="flex-1 flex flex-col items-center">
                    <span className="text-[11px] font-medium mb-1" style={{ color: C.red }}>
                        {stepLabel(curr.step)}
                    </span>
                    <PentagonChart data={curr.data} compact />
                </div>
            </div>

            {/* Entiende tu gráfica */}
            <div className="flex justify-center mt-2">
                <button
                    onClick={() => setIsInfoOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    style={{ background: '#EE2A2822', color: C.red }}
                >
                    <CircleQuestionMark size={14} />
                    Entiende tu gráfica
                </button>
            </div>

            {/* Toggle detalles */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className="flex items-center gap-1 text-xs transition-colors mt-2 mx-auto"
                style={{ color: '#A8A29E' }}
            >
                {isOpen ? 'Ocultar detalles' : 'Ver detalles'}
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Tabla comparativa */}
            {isOpen && (
                <div className="w-full mt-2 space-y-1.5 px-1">
                    {/* Header */}
                    <div className="flex items-center text-[10px] px-2 pb-0.5" style={{ color: '#A8A29E' }}>
                        <span className="flex-1" />
                        <span className="w-5 text-center">{stepLabel(prev.step).split(' ')[0]}</span>
                        <span className="w-5 text-center mx-3" />
                        <span className="w-5 text-center" style={{ color: C.red }}>{stepLabel(curr.step).split(' ')[0]}</span>
                    </div>

                    {prev.data.map((item, i) => {
                        const currVal = curr.data[i]?.value ?? 0;
                        const delta = currVal - item.value;
                        return (
                            <div
                                key={i}
                                className="flex items-center text-[11px] rounded border px-2 py-1.5 gap-2"
                                style={{ background: '#252020', borderColor: '#333330' }}
                            >
                                <span className="flex-1 font-medium truncate" style={{ color: '#A8A29E' }}>{item.label}</span>
                                <span className="font-bold w-4 text-center" style={{ color: '#A8A29E' }}>{item.value}</span>
                                <span className="w-5 text-center text-base leading-none">
                                    {delta > 0
                                        ? <span className="text-xs" style={{ color: C.red }}>↑</span>
                                        : delta < 0
                                        ? <span className="text-xs text-red-400">↓</span>
                                        : <span className="text-xs" style={{ color: '#666' }}>─</span>}
                                </span>
                                <span className="font-bold w-4 text-center" style={{ color: C.red }}>{currVal}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Navegación — solo si hay más de un par */}
            {pairs.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-3">
                    <button
                        onClick={() => setIndex(i => Math.max(0, i - 1))}
                        disabled={index === 0}
                        className="p-1 rounded-full disabled:opacity-30 transition-colors"
                        style={{ color: '#A8A29E' }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex gap-1.5">
                        {pairs.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className="w-1.5 h-1.5 rounded-full transition-colors"
                                style={{ background: i === index ? C.red : '#333330' }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setIndex(i => Math.min(pairs.length - 1, i + 1))}
                        disabled={index === pairs.length - 1}
                        className="p-1 rounded-full disabled:opacity-30 transition-colors"
                        style={{ color: '#A8A29E' }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
            {isInfoOpen && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: '#000000d9', backdropFilter: 'blur(8px)' }} onClick={() => setIsInfoOpen(false)}>
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
                </div>,
                document.body
            )}
        </div>
    );
};
