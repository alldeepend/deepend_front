import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../store/useAuth';
import { useQuery } from '@tanstack/react-query';
import { X, Trophy, ArrowRight } from 'lucide-react';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

const ORDINALS: Record<number, string> = {
    1: 'Primera', 2: 'Segunda', 3: 'Tercera', 4: 'Cuarta', 5: 'Quinta',
    6: 'Sexta', 7: 'Séptima', 8: 'Octava', 9: 'Novena', 10: 'Décima'
};
const toOrdinal = (n: number) => ORDINALS[n] ?? `${n}ª`;

export default function PasaporteReminder() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const { data: passport, isLoading } = useQuery({
        queryKey: ['passport-current', user?.id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/passport/current`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5
    });

    useEffect(() => {
        if (
            user &&
            passport?.isAvailable &&
            passport?.challenge &&
            passport.challenge.status !== 'completado' &&
            !isLoading &&
            !location.pathname.includes('/challenges/detail')
        ) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [user, passport, isLoading, location.pathname]);

    const handleClose = () => {
        setIsOpen(false);
        // Removed sessionStorage persistence so it shows again on navigation
    };

    const handleGoToChallenge = () => {
        setIsOpen(false);
        if (passport?.challenge?.id) {
            navigate(`/challenges/detail?id=${passport.challenge.id}`);
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
                    <div className="w-16 h-16 bg-gradient-to-br from-[#57ba47] to-[#57ba47] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                        <Trophy className="text-white w-8 h-8" />
                    </div>

                    {passport?.challenge?.passportStep === 1 ? (
                        <>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                ¡Completa tu {passport.challenge.title ?? 'Pasaporte'}!
                            </h3>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                Para desbloquear todo el potencial de DeepEnd y personalizar tu experiencia, necesitas completar el reto <span className="font-semibold text-[#57ba47]">{passport.challenge.title ?? 'Pasaporte Deepend'}</span>.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                Tu {toOrdinal(passport?.challenge?.passportStep ?? 2)} Mirada ya está disponible.
                            </h3>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                Da el siguiente paso y sigue avanzando en tu camino con el reto <span className="font-semibold text-[#57ba47]">{passport?.challenge?.title}</span>.
                            </p>
                        </>
                    )}

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
