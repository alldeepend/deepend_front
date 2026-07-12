import React, { useEffect, useState } from 'react';
import { ArrowLeft, Lock, Trophy, Target, Loader2, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../../components/shared/Header';
import { journeyApi } from '../../services/journey';
import type { JourneyDetailsResponse, Area } from '../../types/journey';
import { C } from '../../styles/colors';

export default function MyJourney() {
    const navigate = useNavigate();
    
    // State
    const [loading, setLoading] = useState(true);
    const [loadingMap, setLoadingMap] = useState(false);
    
    const [viewMode, setViewMode] = useState<'areas' | 'map'>('areas');
    const [areasData, setAreasData] = useState<Area[]>([]);
    const [journeyData, setJourneyData] = useState<JourneyDetailsResponse | null>(null);

    useEffect(() => {
        const fetchAvailable = async () => {
            try {
                const data = await journeyApi.getAvailableJourneys();
                setAreasData(data.areas);
            } catch (error) {
                console.error("Error cargando áreas", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailable();
    }, []);

    const handleSelectJourney = async (journeyId: string) => {
        setLoadingMap(true);
        setViewMode('map');
        try {
            const details = await journeyApi.getJourneyDetails(journeyId);
            setJourneyData(details);
        } catch (error) {
            console.error("Error cargando mapa del viaje", error);
        } finally {
            setLoadingMap(false);
        }
    };

    const handleBackToAreas = () => {
        setViewMode('areas');
        setJourneyData(null);
    };

    const getWorldStatus = (worldIndex: number): 'completed' | 'active' | 'locked' => {
        if (!journeyData) return 'locked';
        if (worldIndex === 0) return 'active';
        return 'locked'; // Simulated for now
    };

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mi Viaje" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* VIEW MODE: AREAS (Categorized Journeys) */}
                        {viewMode === 'areas' && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-light" style={{ color: C.text }}>Mis Viajes</h2>
                                    <p className="mt-2" style={{ color: C.textMuted }}>Selecciona un área para comenzar o continuar tu recorrido.</p>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.green }} />
                                    </div>
                                ) : areasData.length === 0 ? (
                                    <div className="text-center py-12 rounded-2xl border" style={{ background: C.surface1, borderColor: C.border }}>
                                        <p style={{ color: C.textMuted }}>Aún no tienes áreas disponibles.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {areasData.map(area => (
                                            <div key={area.id} className="space-y-6">
                                                <div className="flex items-center gap-3 border-b pb-2" style={{ borderColor: C.border }}>
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.forest, color: C.green }}>
                                                        <MapIcon size={18} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold capitalize" style={{ color: C.text }}>{area.name}</h3>
                                                </div>
                                                
                                                {area.journeys.length === 0 ? (
                                                    <p className="italic text-sm" style={{ color: C.label }}>No hay viajes en esta área.</p>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {area.journeys.map(journey => (
                                                            <div
                                                                key={journey.id}
                                                                onClick={() => handleSelectJourney(journey.id)}
                                                                className="group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl border overflow-hidden flex flex-col"
                                                                style={{ background: C.surface1, borderColor: C.border }}
                                                            >
                                                                <div className="h-2 w-full relative overflow-hidden" style={{ background: C.green }}>
                                                                    <div className="absolute inset-0 bg-white/20 w-1/3 group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out"></div>
                                                                </div>
                                                                <div className="p-6 flex-1 flex flex-col">
                                                                    <h4 className="text-xl font-bold mb-2" style={{ color: C.text }}>{journey.title}</h4>
                                                                    <p className="text-sm mb-6 flex-1" style={{ color: C.textMuted }}>{journey.description || 'Comienza esta increíble trayectoria.'}</p>
                                                                    <div className="flex justify-between items-center mt-auto pt-4 border-t" style={{ borderColor: C.border }}>
                                                                        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: C.green, background: C.forest }}>
                                                                            {journey.isActive ? 'Disponible' : 'Próximamente'}
                                                                        </span>
                                                                        <div style={{ color: C.border }} className="group-hover:opacity-80 transition-opacity">
                                                                            <ChevronRight size={20} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* VIEW MODE: MAP (Specific Journey) */}
                        {viewMode === 'map' && (
                            <>
                                <div className="mb-8">
                                    <button
                                        onClick={handleBackToAreas}
                                        className="flex items-center text-sm mb-2 transition-colors group" style={{ color: C.label }}
                                    >
                                        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                        Volver a Mis Viajes
                                    </button>
                                    
                                    {journeyData && (
                                        <>
                                            <h2 className="text-3xl font-light" style={{ color: C.text }}>{journeyData.journey.title}</h2>
                                            <p className="mt-2" style={{ color: C.textMuted }}>{journeyData.journey.description}</p>
                                        </>
                                    )}
                                </div>

                                {loadingMap ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.green }} />
                                    </div>
                                ) : !journeyData ? (
                                    <div className="text-center py-12 rounded-2xl border" style={{ background: C.surface1, borderColor: C.border }}>
                                        <p style={{ color: C.textMuted }}>Error al cargar el mapa.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Left Column - Passport Card */}
                                        <div className="lg:col-span-4">
                                            <div className="rounded-2xl p-8 text-white shadow-xl lg:sticky lg:top-8" style={{ background: C.bgDeep }}>
                                                <div className="mb-8">
                                                    <h3 className="text-xl font-bold mb-1" style={{ color: C.text }}>Pasaporte DeepEnd</h3>
                                                    <p className="text-sm" style={{ color: C.label }}>Progreso Global</p>
                                                </div>
                                                <div className="w-full rounded-full h-3 mb-2" style={{ background: C.surface3 }}>
                                                    <div className="h-3 rounded-full w-[10%]" style={{ background: C.green, boxShadow: `0 0 10px ${C.green}80` }}></div>
                                                </div>
                                                <p className="text-[10px] text-right" style={{ color: C.label }}>Mundo 1 en progreso</p>
                                            </div>
                                        </div>

                                        {/* Right Column - Map */}
                                        <div className="lg:col-span-8">
                                            <h3 className="text-lg font-bold mb-8 px-4" style={{ color: C.text }}>Mapa de Mundos</h3>

                                            <div className="relative pl-4">
                                                {/* Vertical Line */}
                                                <div className="absolute left-[27px] top-4 bottom-0 w-0.5" style={{ background: C.border }}></div>

                                                {journeyData.journey.worlds.map((world, idx) => {
                                                    const status = getWorldStatus(idx);
                                                    
                                                    if (status === 'locked') {
                                                        return (
                                                            <div key={world.id} className="relative flex gap-8 mb-12">
                                                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center" style={{ background: C.surface2, borderColor: C.border }}>
                                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.label }}></div>
                                                                </div>
                                                                <div className="flex-1 pt-0.5">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="text-lg font-bold" style={{ color: C.label }}>{world.title}</h4>
                                                                        <Lock size={14} style={{ color: C.label }} />
                                                                    </div>
                                                                    <p className="text-sm" style={{ color: C.label }}>Desbloquea al completar mundo anterior</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (status === 'completed') {
                                                        return (
                                                            <div key={world.id} className="relative flex gap-8 mb-12 opacity-60 hover:opacity-100 transition-opacity">
                                                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-4 shadow-sm mt-1" style={{ background: C.surface3, borderColor: C.surface1 }}></div>
                                                                <div className="flex-1 pt-0.5">
                                                                    <h4 className="text-lg font-bold" style={{ color: C.textSec }}>{world.title}</h4>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // ACTIVE
                                                    return (
                                                        <div key={world.id} className="relative flex gap-8 mb-12">
                                                            <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-4 shadow-lg mt-1 animate-pulse" style={{ background: C.green, borderColor: C.forest }}></div>
                                                            <div className="flex-1">
                                                                <div className="border rounded-2xl p-6 shadow-sm relative overflow-hidden" style={{ background: C.surface1, borderColor: C.topo }}>
                                                                    <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20 -mr-4 -mt-4" style={{ background: C.forest }}></div>

                                                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                                                        <h4 className="text-xl font-bold" style={{ color: C.text }}>{world.title}</h4>
                                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide" style={{ background: C.forest, color: C.green }}>Actual</span>
                                                                    </div>

                                                                    <p className="text-sm mb-6" style={{ color: C.textMuted }}>{world.description || 'Enfocado en avanzar tu viaje personal.'}</p>

                                                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                                                        <div className="rounded-xl p-4 text-center" style={{ background: C.surface2 }}>
                                                                            <Target className="w-5 h-5 mx-auto mb-2" style={{ color: C.label }} />
                                                                            <span className="block text-2xl font-bold" style={{ color: C.text }}>{world.stations.length}</span>
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.label }}>Estaciones</span>
                                                                        </div>
                                                                        <div className="rounded-xl p-4 text-center" style={{ background: C.surface2 }}>
                                                                            <Trophy className="w-5 h-5 mx-auto mb-2" style={{ color: C.label }} />
                                                                            <span className="block text-2xl font-bold" style={{ color: C.text }}>-</span>
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.label }}>Insignias</span>
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => navigate(`/journey/${journeyData.journey.id}/world/${world.id}`)}
                                                                        className="w-full text-white font-medium py-3 rounded-xl transition-colors shadow-lg"
                                                                        style={{ background: C.bgDeep }}>
                                                                        Continuar Exploración
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {journeyData.journey.worlds.length === 0 && (
                                                    <p className="pl-8" style={{ color: C.textMuted }}>Este viaje aún no tiene mundos configurados.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
