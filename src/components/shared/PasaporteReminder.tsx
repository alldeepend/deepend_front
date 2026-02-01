import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../store/useAuth';
import { useQuery } from '@tanstack/react-query';
import { X, Trophy, ArrowRight } from 'lucide-react';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

export default function PasaporteReminder() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Fetch challenges to check Pasaporte status
    const { data: pasaporteStatus, isLoading } = useQuery({
        queryKey: ['pasaporte-status', user?.id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            const challenges = await res.json();
            const pasaporte = challenges.find((c: any) => c.title.toLowerCase().includes('pasaporte'));
            return pasaporte ? { status: pasaporte.status, id: pasaporte.id } : null;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    useEffect(() => {
        // Log for debugging
        /* console.log("--- PasaporteReminder Debug ---");
        console.log("User:", user);
        console.log("Membership:", user?.membership);
        console.log("Pasaporte Status:", pasaporteStatus);
        console.log("Is Loading:", isLoading);
        console.log("Location:", location.pathname); */

        // Logic:
        // 1. User logged in
        // 2. Membership is 'free_trial'
        // 3. Pasaporte NOT completed

        if (
            user &&
            user.membership === 'free_trial' &&
            pasaporteStatus?.status &&
            pasaporteStatus.status !== 'completed' &&
            !isLoading &&
            !location.pathname.includes('/challenges/detail')
        ) {
            /* console.log(">>> OPENING REMINDER <<<"); */
            setIsOpen(true);
        } else {
            console.log("Conditions not met for reminder (or already on challenge page)");
        }
    }, [user, pasaporteStatus, isLoading, location.pathname]);

    const handleClose = () => {
        setIsOpen(false);
        // Removed sessionStorage persistence so it shows again on navigation
    };

    const handleGoToChallenge = () => {
        setIsOpen(false);
        if (pasaporteStatus?.id) {
            navigate(`/challenges/detail?id=${pasaporteStatus.id}`);
        } else {
            navigate('/challenges');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-300 border border-slate-100">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                        <Trophy className="text-white w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        ¡Completa tu Pasaporte!
                    </h3>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Para desbloquear todo el potencial de DeepEnd y personalizar tu experiencia, necesitas completar el reto <span className="font-semibold text-indigo-600">Pasaporte Deepend</span>.
                    </p>

                    <button
                        onClick={handleGoToChallenge}
                        className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                    >
                        <span>Ir al Reto Ahora</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={handleClose}
                        className="mt-4 text-slate-400 text-sm hover:text-slate-600"
                    >
                        Lo haré más tarde
                    </button>
                </div>
            </div>
        </div>
    );
}
