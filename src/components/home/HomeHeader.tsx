import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../store/useAuth';

interface HomeHeaderProps {
    action?: React.ReactNode;
}

export const HomeHeader = ({ action }: HomeHeaderProps) => {
    const { user } = useAuth();
    const displayName = user?.preferredName || user?.firstName || 'Usuario';

    return (
        <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <Link to="/profile" className="relative group">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-200/50 ring-2 ring-white overflow-hidden transition-transform group-hover:scale-105">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            displayName[0].toUpperCase()
                        )}
                    </div>
                </Link>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <h2 className="text-2xl font-light text-slate-800 leading-tight">
                        Hola, <span className="font-bold">{displayName}</span>
                    </h2>
                </div>
            </div>
            {action && <div>{action}</div>}
        </header>
    );
};
