import { useNavigate } from 'react-router';
import { Brain, Fingerprint } from 'lucide-react';
import { C } from '../../styles/colors';
import { useArchetypeInfo } from '../../hooks/useArchetypeInfo';

export const ArchetypeCard = () => {
    const navigate = useNavigate();
    const archetypeInfo = useArchetypeInfo();
    const goToTest = () => navigate('/test');

    // undefined = todavía cargando (Promise.allSettled en el hook) — no
    // mostrar nada para evitar el parpadeo del estado "sin resultado".
    if (archetypeInfo === undefined) return null;

    if (!archetypeInfo) {
        return (
            <div
                className="lg:col-span-4 p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden"
                style={{ background: '#1E1A1B', borderColor: '#333330' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: C.amber }} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10" style={{ background: `${C.amber}22` }}>
                    <Fingerprint size={22} style={{ color: C.amber }} />
                </div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide relative z-10" style={{ color: C.amber }}>
                    El Espejo
                </p>
                <h3 className="text-lg font-bold relative z-10" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                    Descubre tu arquetipo
                </h3>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: '#A8A29E' }}>
                    Un diagnóstico de 5 minutos que revela el patrón detrás de tus decisiones.
                </p>
                <button
                    onClick={goToTest}
                    className="relative z-10 mt-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{ background: C.amber, color: '#201400' }}
                >
                    Hacer el test
                </button>
            </div>
        );
    }

    return (
        <div
            className="lg:col-span-4 rounded-2xl shadow-sm border overflow-hidden flex flex-col"
            style={{ background: '#1E1A1B', borderColor: '#333330' }}
        >
            {archetypeInfo.imageUrl && (
                <img
                    src={archetypeInfo.imageUrl}
                    alt={archetypeInfo.familyName}
                    className="w-full h-36 object-cover object-top"
                />
            )}

            <div className="p-6 flex flex-col justify-between gap-4 flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 opacity-20" style={{ background: C.amber }} />

                <div className="relative z-10">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: C.amber }}>
                        <Brain size={14} /> El Espejo · Mi Arquetipo
                    </p>
                    <h3 className="text-xl font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                        {archetypeInfo.familyName}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: C.amber }}>{archetypeInfo.variantLabel}</p>
                </div>

                {archetypeInfo.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 relative z-10">
                        {archetypeInfo.traits.slice(0, 3).map(trait => (
                            <span
                                key={trait}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: '#252020', color: '#A8A29E' }}
                            >
                                {trait}
                            </span>
                        ))}
                    </div>
                )}

                <button
                    onClick={goToTest}
                    className="relative z-10 text-left text-xs font-bold"
                    style={{ color: C.amber }}
                >
                    Ver resultado completo →
                </button>
            </div>
        </div>
    );
};
