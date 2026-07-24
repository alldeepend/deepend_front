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
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ring-2 overflow-hidden transition-transform group-hover:scale-105"
                        style={{ background: '#52B788', ['--tw-ring-color' as any]: '#1E1A1B' }}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            displayName[0].toUpperCase()
                        )}
                    </div>
                </Link>
                <div>
                    <p className="text-[10px] font-bold tracking-wider uppercase mb-0.5" style={{ color: '#A8A29E' }}>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <h2 className="text-2xl font-light leading-tight" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                        Hola, <span className="font-bold">{displayName}</span>
                    </h2>
                </div>
            </div>
            {action && <div>{action}</div>}
        </header>
    );
};
