import React from 'react';
import { Wallet, BrainCircuit } from 'lucide-react';
import { ChallengeCard } from './ChallengeCard';

import { useNavigate } from 'react-router';

export const ActiveChallenges = () => {
    const navigate = useNavigate();

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Retos Activos</h3>
                <button
                    onClick={() => navigate('/challenges')}
                    className="text-[10px] font-bold text-slate-400 hover:text-emerald-500 tracking-wider cursor-pointer transition-colors"
                >
                    VER TODOS
                </button>
            </div>

            <div className="space-y-4">
                <ChallengeCard
                    icon={Wallet}
                    category="Finanzas"
                    title="Auditoría de Gastos Hormiga"
                    subtitle="Identifica 3 fugas de capital esta semana."
                    colorClass="text-emerald-500 bg-emerald-50"
                />
                <ChallengeCard
                    icon={BrainCircuit}
                    category="Mindset"
                    title="Diario de Gratitud"
                    subtitle="Día 5 de 7 completado."
                    colorClass="text-blue-500 bg-blue-50"
                />
            </div>
        </section>
    );
};
