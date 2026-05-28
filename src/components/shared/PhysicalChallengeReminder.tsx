import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../store/useAuth';
import { useQuery } from '@tanstack/react-query';
import { X, Dumbbell, ArrowRight } from 'lucide-react';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

const CHALLENGE_ID = 'dcf4574f-8cd3-4925-b88f-c66df26ed8cc';
const TRIGGER_TASK_ID = '37b4c944-261e-4467-b478-7b85ef570502';

export default function PhysicalChallengeReminder() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const { data: challengeData, isLoading } = useQuery({
        queryKey: ['challenge-physical-reminder', user?.id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges/${CHALLENGE_ID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5
    });

    const targetTask = challengeData?.tasks?.find((t: any) => t.id === TRIGGER_TASK_ID);
    const isTaskCompleted = targetTask?.completed === true;

    useEffect(() => {
        if (
            user &&
            challengeData &&
            !isLoading &&
            !isTaskCompleted &&
            !location.pathname.includes('/challenges/detail')
        ) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [user, challengeData, isLoading, isTaskCompleted, location.pathname]);

    const handleClose = () => setIsOpen(false);

    const handleGoToChallenge = () => {
        setIsOpen(false);
        navigate(`/challenges/detail?id=${CHALLENGE_ID}`);
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
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                        <Dumbbell className="text-white w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        ¡Tu reto físico te espera!
                    </h3>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Tienes pendiente completar el reto <span className="font-semibold text-emerald-600">Desde Aquí</span>. Da el primer paso para arrancar las 8 semanas de tu transformación física.
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
