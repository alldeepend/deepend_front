import React, { useEffect, useState } from 'react';
import { ArrowLeft, Lock, Trophy, Target, Loader2, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../../components/shared/Header';
import { journeyApi } from '../../services/journey';
import type { JourneyDetailsResponse, Area } from '../../types/journey';

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
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
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
                                    <h2 className="text-3xl font-light text-slate-800">Mis Viajes</h2>
                                    <p className="text-slate-500 mt-2">Selecciona un área para comenzar o continuar tu recorrido.</p>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                    </div>
                                ) : areasData.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                        <p className="text-slate-500">Aún no tienes áreas disponibles.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {areasData.map(area => (
                                            <div key={area.id} className="space-y-6">
                                                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <MapIcon size={18} />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-slate-800 capitalize">{area.name}</h3>
                                                </div>
                                                
                                                {area.journeys.length === 0 ? (
                                                    <p className="text-slate-400 italic text-sm">No hay viajes en esta área.</p>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {area.journeys.map(journey => (
                                                            <div 
                                                                key={journey.id}
                                                                onClick={() => handleSelectJourney(journey.id)}
                                                                className="bg-white group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl border border-slate-200 overflow-hidden flex flex-col"
                                                            >
                                                                <div className="h-2 bg-emerald-500 w-full relative overflow-hidden">
                                                                    <div className="absolute inset-0 bg-white/20 w-1/3 group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out"></div>
                                                                </div>
                                                                <div className="p-6 flex-1 flex flex-col">
                                                                    <h4 className="text-xl font-bold text-slate-800 mb-2">{journey.title}</h4>
                                                                    <p className="text-slate-500 text-sm mb-6 flex-1">{journey.description || 'Comienza esta increíble trayectoria.'}</p>
                                                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                                                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                                            {journey.isActive ? 'Disponible' : 'Próximamente'}
                                                                        </span>
                                                                        <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
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
                                        className="flex items-center text-slate-400 text-sm mb-2 hover:text-slate-600 transition-colors group"
                                    >
                                        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                        Volver a Mis Viajes
                                    </button>
                                    
                                    {journeyData && (
                                        <>
                                            <h2 className="text-3xl font-light text-slate-800">{journeyData.journey.title}</h2>
                                            <p className="text-slate-500 mt-2">{journeyData.journey.description}</p>
                                        </>
                                    )}
                                </div>

                                {loadingMap ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                    </div>
                                ) : !journeyData ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                                        <p className="text-slate-500">Error al cargar el mapa.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Left Column - Passport Card */}
                                        <div className="lg:col-span-4">
                                            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-slate-200 lg:sticky lg:top-8">
                                                <div className="mb-8">
                                                    <h3 className="text-xl font-bold mb-1">Pasaporte DeepEnd</h3>
                                                    <p className="text-slate-400 text-sm">Progreso Global</p>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                                                    <div className="bg-emerald-500 h-3 rounded-full w-[10%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 text-right">Mundo 1 en progreso</p>
                                            </div>
                                        </div>

                                        {/* Right Column - Map */}
                                        <div className="lg:col-span-8">
                                            <h3 className="text-lg font-bold text-slate-800 mb-8 px-4">Mapa de Mundos</h3>

                                            <div className="relative pl-4">
                                                {/* Vertical Line */}
                                                <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-slate-100"></div>

                                                {journeyData.journey.worlds.map((world, idx) => {
                                                    const status = getWorldStatus(idx);
                                                    
                                                    if (status === 'locked') {
                                                        return (
                                                            <div key={world.id} className="relative flex gap-8 mb-12">
                                                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-slate-200 mt-1 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                                                </div>
                                                                <div className="flex-1 pt-0.5">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="text-lg font-bold text-slate-400">{world.title}</h4>
                                                                        <Lock size={14} className="text-slate-400" />
                                                                    </div>
                                                                    <p className="text-sm text-slate-400">Desbloquea al completar mundo anterior</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (status === 'completed') {
                                                        return (
                                                            <div key={world.id} className="relative flex gap-8 mb-12 opacity-60 hover:opacity-100 transition-opacity">
                                                                <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm mt-1"></div>
                                                                <div className="flex-1 pt-0.5">
                                                                    <h4 className="text-lg font-bold text-slate-700">{world.title}</h4>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // ACTIVE
                                                    return (
                                                        <div key={world.id} className="relative flex gap-8 mb-12">
                                                            <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-100 shadow-lg shadow-emerald-100 mt-1 animate-pulse"></div>
                                                            <div className="flex-1">
                                                                <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
                                                                    
                                                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                                                        <h4 className="text-xl font-bold text-slate-800">{world.title}</h4>
                                                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Actual</span>
                                                                    </div>

                                                                    <p className="text-slate-500 text-sm mb-6">{world.description || 'Enfocado en avanzar tu viaje personal.'}</p>

                                                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                                            <Target className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                                                            <span className="block text-2xl font-bold text-slate-800">{world.stations.length}</span>
                                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estaciones</span>
                                                                        </div>
                                                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                                            <Trophy className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                                                                            <span className="block text-2xl font-bold text-slate-800">-</span>
                                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Insignias</span>
                                                                        </div>
                                                                    </div>

                                                                    <button 
                                                                        onClick={() => navigate(`/journey/${journeyData.journey.id}/world/${world.id}`)}
                                                                        className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                                                        Continuar Exploración
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {journeyData.journey.worlds.length === 0 && (
                                                    <p className="text-slate-500 pl-8">Este viaje aún no tiene mundos configurados.</p>
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
