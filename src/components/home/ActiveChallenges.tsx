import React from 'react';
import { Wallet, BrainCircuit } from 'lucide-react';
import { ChallengeCard } from './ChallengeCard';
import { C } from '../../styles/colors';

import { useNavigate } from 'react-router';

export const ActiveChallenges = () => {
    const navigate = useNavigate();

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: C.text }}>Retos Activos</h3>
                <button
                    onClick={() => navigate('/challenges')}
                    className="text-[10px] font-bold hover:text-emerald-500 tracking-wider cursor-pointer transition-colors"
                    style={{ color: C.label }}
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
                    iconColor={C.green}
                    iconBg={C.forest}
                />
                <ChallengeCard
                    icon={BrainCircuit}
                    category="Mindset"
                    title="Diario de Gratitud"
                    subtitle="Día 5 de 7 completado."
                    iconColor={C.red}
                    iconBg={C.surface3}
                />
            </div>
        </section>
    );
};
