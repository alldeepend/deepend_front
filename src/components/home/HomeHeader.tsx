import React from 'react';
import { useAuth } from '../../store/useAuth';

interface HomeHeaderProps {
    action?: React.ReactNode;
}

export const HomeHeader = ({ action }: HomeHeaderProps) => {
    const { user } = useAuth();
    const displayName = user?.preferredName || user?.firstName || 'Usuario';

    return (
        <header className="flex justify-between items-end mb-8">
            <div>
                <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1"> {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h2 className="text-3xl font-light text-slate-800">Hola, <span className="font-bold">{displayName}</span></h2>
            </div>
            {action && <div>{action}</div>}
        </header>
    );
};
