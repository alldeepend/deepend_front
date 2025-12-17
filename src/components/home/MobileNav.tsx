import React from 'react';
import {
    LayoutDashboard,
    Compass,
    Flag,
    User,
    BookOpen
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check if the current path matches
    const isActive = (path: string) => location.pathname === path;
    const getItemClass = (path: string) => isActive(path) ? "text-emerald-500" : "text-slate-400";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-50">
            <button onClick={() => navigate('/dashboard')} className="p-2">
                <LayoutDashboard className={getItemClass('/dashboard')} />
            </button>
            <button onClick={() => navigate('/journey')} className="p-2">
                <Compass className={getItemClass('/journey')} />
            </button>
            <button onClick={() => navigate('/challenges')} className="p-2">
                <Flag className={getItemClass('/challenges')} />
            </button>
            <button onClick={() => navigate('/resources')} className="p-2">
                <BookOpen className={getItemClass('/resources')} />
            </button>
            <button onClick={() => navigate('/profile')} className="p-2">
                <User className={getItemClass('/profile')} />
            </button>
        </nav>
    );
};
