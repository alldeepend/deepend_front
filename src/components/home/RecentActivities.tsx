
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, ExternalLink, Calendar, ArrowRight, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

interface ActivityLog {
    id: string;
    activity: string;
    duration: string;
    evidenceUrl: string;
    createdAt: string;
}

interface RecentActivitiesProps {
    onAddActivity: () => void;
}

export const RecentActivities = ({ onAddActivity }: RecentActivitiesProps) => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['recent-activities'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log?limit=3`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            return await res.json() as ActivityLog[];
        }
    });

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-play effect
    useEffect(() => {
        if (!activities || activities.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [activities]);

    const nextSlide = () => {
        if (activities) setCurrentIndex((prev) => (prev + 1) % activities.length);
    };

    const prevSlide = () => {
        if (activities) setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
    };

    if (isLoading) return <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 h-64 animate-pulse"></div>;

    if (!activities || activities.length === 0) return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Comienza tu registro</h3>
            <p className="text-slate-500 mb-6">Aún no tienes actividades físicas registradas.</p>
            <button
                onClick={onAddActivity}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
            >
                <PlusCircle size={20} />
                Registrar primera actividad
            </button>
        </div>
    );

    const currentActivity = activities[currentIndex];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 relative overflow-hidden group/widget">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <h3 className="text-lg font-bold text-slate-800">Registro Actividad - Retos Físicos</h3>
                    <button
                        onClick={onAddActivity}
                        className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors whitespace-nowrap"
                    >
                        <PlusCircle size={14} />
                        Registrar Actividad
                    </button>
                </div>

            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-64 md:h-72">
                {/* Navigation Buttons (visible on hover) */}
                {activities.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/widget:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/widget:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Slides */}
                <div className="absolute inset-0">
                    <img
                        key={currentActivity.id} // Key change triggers animation if we add css animation, or just swap
                        src={currentActivity.evidenceUrl}
                        alt={currentActivity.activity}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
                    />

                    {/* Overlay Content */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                        <div className="transform transition-all duration-500 translate-y-0 text-white">
                            <h4 className="text-2xl font-bold mb-2">{currentActivity.activity}</h4>
                            <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
                                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <Clock size={14} /> {currentActivity.duration} min
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} /> {new Date(currentActivity.createdAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Dots Indicator */}
                {activities.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                        {activities.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-end pt-4">
                <Link to="/activities" className="text-sm text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 group">
                    Ver todas <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};
