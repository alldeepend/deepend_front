
import React, { useState, useEffect } from 'react';
import { C } from '../../styles/colors';
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

    if (isLoading) return <div className="p-4 rounded-2xl shadow-sm border h-64 animate-pulse" style={{ background: '#1E1A1B', borderColor: '#333330' }}></div>;

    if (!activities || activities.length === 0) return (
        <div className="rounded-2xl shadow-sm border p-8 mb-8 text-center" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Comienza tu registro</h3>
            <p className="mb-6" style={{ color: '#A8A29E' }}>Aún no tienes actividades físicas registradas.</p>
            <button
                onClick={onAddActivity}
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-opacity hover:opacity-90"
                style={{ background: C.red }}
            >
                <PlusCircle size={20} />
                Registrar primera actividad
            </button>
        </div>
    );

    const currentActivity = activities[currentIndex];

    return (
        <div className="rounded-2xl shadow-sm border p-6 mb-8 relative overflow-hidden group/widget" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <h3 className="text-lg font-bold" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>Registro Actividad - Retos Físicos</h3>
                    <button
                        onClick={onAddActivity}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                        style={{ background: '#EE2A2822', color: C.red }}
                    >
                        <PlusCircle size={14} />
                        Registrar Actividad
                    </button>
                </div>

            </div>

            <div className="relative rounded-2xl overflow-hidden h-64 md:h-72" style={{ background: '#252020' }}>
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
                    {currentActivity.evidenceUrl ? (
                        <img
                            key={currentActivity.id}
                            src={currentActivity.evidenceUrl}
                            alt={currentActivity.activity}
                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
                        />
                    ) : (
                        <div key={currentActivity.id} className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#252020', color: '#A8A29E' }}>
                            <Clock size={48} className="mb-2" />
                            <span className="text-3xl font-bold" style={{ color: '#A8A29E' }}>{currentActivity.duration} min</span>
                        </div>
                    )}

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
                <Link to="/activities" className="text-sm font-bold flex items-center gap-1 group transition-opacity hover:opacity-80" style={{ color: C.red }}>
                    Ver todas <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};
