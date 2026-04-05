import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, PlayCircle, Loader2, FileText, Video, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import Header from '../../components/shared/Header';
import { journeyApi } from '../../services/journey';
import type { JourneyDetailsResponse } from '../../types/journey';

export default function WorldPlayer() {
    const { journeyId, worldId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [journeyData, setJourneyData] = useState<JourneyDetailsResponse | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [activeStationId, setActiveStationId] = useState<string | null>(null);
    const [activeBlockIndex, setActiveBlockIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (journeyId) {
                    const data = await journeyApi.getJourneyDetails(journeyId);
                    setJourneyData(data);
                    setViewMode('list');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [journeyId, worldId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    if (!journeyData) {
        return <div className="p-12 text-center text-slate-500">No se pudo cargar la información.</div>;
    }

    const world = journeyData.journey.worlds.find(w => w.id === worldId);
    if (!world) {
        return <div className="p-12 text-center text-slate-500">Mundo no encontrado.</div>;
    }

    const activeStation = world.stations.find(s => s.id === activeStationId);
    const activeBlock = activeStation?.blocks[activeBlockIndex];

    const handleCompleteBlock = async (blockId: string) => {
        setCompletedBlocks(prev => new Set(prev).add(blockId));
    };

    const isBlockCompleted = (block: any) => {
        if (!block) return false;
        if (['activacion', 'evidencia'].includes(block.type)) {
            return completedBlocks.has(block.id);
        }
        return true;
    };

    const currentIndex = world.stations.findIndex(s => s.id === activeStationId);
    const hasNextStation = currentIndex < world.stations.length - 1;
    const hasPrevStation = currentIndex > 0;

    const isStationUnlocked = (stationId: string, index: number) => {
        if (index === 0) return true;
        
        const prevStation = world.stations[index - 1];
        const prevProgress = journeyData.progress.stationProgress.find(p => p.stationId === prevStation.id);
        
        return prevProgress?.isCompleted || false;
    };

    const stationBlocksCount = activeStation?.blocks.length || 0;
    const isAtLastBlock = activeBlockIndex === stationBlocksCount - 1;

    const goToNextBlock = () => {
        if (!activeBlock) return;
        if (!isBlockCompleted(activeBlock)) {
            alert("Completa la actividad actual para poder avanzar.");
            return;
        }
        if (activeBlockIndex < stationBlocksCount - 1) {
            setActiveBlockIndex(prev => prev + 1);
            const scrollContainer = document.querySelector('.player-main-content');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPrevBlock = () => {
        if (activeBlockIndex > 0) {
            setActiveBlockIndex(prev => prev - 1);
            const scrollContainer = document.querySelector('.player-main-content');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToNextStation = () => {
        if (hasNextStation && isAtLastBlock && isBlockCompleted(activeBlock)) {
            const nextStationId = world.stations[currentIndex + 1].id;
            setActiveStationId(nextStationId);
            setActiveBlockIndex(0);
            const scrollContainer = document.querySelector('.player-main-content');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPrevStation = () => {
        if (hasPrevStation) {
            const prevStation = world.stations[currentIndex - 1];
            setActiveStationId(prevStation.id);
            setActiveBlockIndex(prevStation.blocks.length > 0 ? prevStation.blocks.length - 1 : 0);
            const scrollContainer = document.querySelector('.player-main-content');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSelectStation = (stationId: string) => {
        setActiveStationId(stationId);
        setActiveBlockIndex(0);
        setViewMode('detail');
    };

    const handleBack = () => {
        if (viewMode === 'detail') {
            setViewMode('list');
        } else {
            navigate('/journey');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
            <Header />

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full">
                {/* SIDEBAR */}
                <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 shrink-0 z-20 shadow-sm md:shadow-none sticky top-0 md:relative">
                    <div className="p-4 md:p-6 flex md:flex-col justify-between md:justify-start items-center md:items-stretch gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-emerald-600"
                                title={viewMode === 'detail' ? "Volver a Estaciones" : "Volver al Mapa"}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="hidden md:block">
                                <h2 className="text-sm font-bold text-slate-800 line-clamp-1">{world.title}</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{viewMode === 'detail' ? 'Modo Reproductor' : 'Lobby de Estaciones'}</p>
                            </div>
                        </div>

                        {viewMode === 'detail' && activeStation && (
                            <div className="flex-1 md:mt-6">
                                {(() => {
                                    const nextStation = currentIndex < world.stations.length - 1 ? world.stations[currentIndex + 1] : null;
                                    return (
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-emerald-200">
                                                    {currentIndex + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="hidden md:block text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Ahora</span>
                                                    <h4 className="text-sm md:text-base font-bold text-slate-800 ">{activeStation.title}</h4>
                                                    {nextStation && (
                                                        <p className="md:hidden text-[10px] text-slate-400 font-medium mt-0.5">
                                                            <span className="font-bold">{nextStation.title}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {nextStation && (
                                                <div
                                                    onClick={() => handleSelectStation(nextStation.id)}
                                                    className="hidden md:flex items-center gap-3 opacity-40 hover:opacity-100 cursor-pointer transition-opacity pt-4 border-t border-slate-50"
                                                >
                                                    <div className="shrink-0 w-6 h-6 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                                                        {currentIndex + 2}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 block">Próxima</span>
                                                        <h4 className="text-xs font-bold text-slate-500 ">{nextStation.title}</h4>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 relative player-main-content">
                    {viewMode === 'list' ? (
                        <div className="max-w-4xl mx-auto py-8">
                            <div className="mb-12 text-center">
                                <span className="bg-emerald-100 text-emerald-700 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full mb-4 inline-block">Estaciones Disponibles</span>
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{world.title}</h1>
                                <p className="text-slate-500 max-w-xl mx-auto">Selecciona una estación para comenzar tu exploración.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {world.stations.map((station, index) => {
                                    const unlocked = isStationUnlocked(station.id, index);
                                    
                                    return (
                                        <div 
                                            key={station.id}
                                            onClick={() => unlocked && handleSelectStation(station.id)}
                                            className={`bg-white rounded-3xl p-6 border transition-all relative overflow-hidden ${
                                                unlocked 
                                                ? 'border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 cursor-pointer group hover:-translate-y-1' 
                                                : 'border-slate-100 opacity-60 grayscale cursor-not-allowed'
                                            }`}
                                        >
                                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full translate-x-16 -translate-y-16 transition-colors ${unlocked ? 'bg-emerald-50 group-hover:bg-emerald-100' : 'bg-slate-50'}`} />
                                            <div className="relative z-10">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mb-6 transition-colors shadow-lg ${unlocked ? 'bg-slate-900 text-white group-hover:bg-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    {unlocked ? index + 1 : <Lock size={20} className="opacity-40" />}
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-2 ">{station.title}</h3>
                                                <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">{station.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{station.blocks.length} BLOQUES</span>
                                                    {unlocked ? (
                                                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all">
                                                            Explorar <ChevronRight size={16} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                                                            Bloqueado
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-12 pb-24">
                            {activeStation && (
                                <>
                                    <div className="flex gap-1 h-1 w-full mb-12">
                                        {activeStation.blocks.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex-1 rounded-full transition-all duration-500 ${idx <= activeBlockIndex ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-8">
                                        {activeBlock && (
                                            <div className="animate-in slide-in-from-right-4 duration-500">
                                                <div className="mb-6">
                                                    <h3 className="text-2xl font-bold text-slate-800">{activeBlock.title}</h3>
                                                    {activeBlock.description && <p className="text-slate-500 mt-2">{activeBlock.description}</p>}
                                                </div>

                                                {(() => {
                                                    switch (activeBlock.type) {
                                                        case 'punto_partida':
                                                            return <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-600 text-lg leading-relaxed">{activeBlock.content?.text}</div>;
                                                        case 'capsula':
                                                            const vidUrl = activeBlock.content?.videoUrl;
                                                            return (
                                                                <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video border border-slate-800">
                                                                    {vidUrl ? (
                                                                        <iframe className="w-full h-full" src={vidUrl.includes('youtube') ? vidUrl.replace('watch?v=', 'embed/') : vidUrl} allowFullScreen />
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-full text-slate-500">Sin video</div>
                                                                    )}
                                                                </div>
                                                            );
                                                        case 'activacion':
                                                            const isDone = completedBlocks.has(activeBlock.id);
                                                            return (
                                                                <div className={`p-8 rounded-3xl border transition-all ${isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
                                                                    <textarea
                                                                        className="w-full bg-slate-50 rounded-xl border p-4 min-h-[140px] outline-none"
                                                                        placeholder="Tu respuesta..."
                                                                        value={answers[activeBlock.id] || ''}
                                                                        disabled={isDone}
                                                                        onChange={e => setAnswers({ ...answers, [activeBlock.id]: e.target.value })}
                                                                    />
                                                                    {!isDone && (
                                                                        <button onClick={() => handleCompleteBlock(activeBlock.id)} className="mt-6 w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl">Guardar y Continuar</button>
                                                                    )}
                                                                </div>
                                                            );
                                                        default:
                                                            return <p className="text-slate-400 italic">Contenido en construcción.</p>;
                                                    }
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                                        {activeBlockIndex > 0 ? (
                                            <button onClick={goToPrevBlock} className="text-slate-500 font-medium px-4 py-2">Anterior</button>
                                        ) : (
                                            <button onClick={goToPrevStation} disabled={!hasPrevStation} className="text-slate-500 disabled:opacity-30">Estación Anterior</button>
                                        )}

                                        {!isAtLastBlock ? (
                                            <button onClick={goToNextBlock} className="bg-slate-900 text-white px-8 py-3 rounded-xl">Siguiente</button>
                                        ) : (
                                            <button onClick={goToNextStation} disabled={!hasNextStation || !isBlockCompleted(activeBlock)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl disabled:opacity-30">Próxima Estación</button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
