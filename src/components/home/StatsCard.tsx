import React from 'react';
import { PentagonChart } from './PentagonChart';
import { useAuth } from '../../store/useAuth';

export const StatsCard = () => {
    const { user } = useAuth();

    return (
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

            <div>
                <h3 className="text-xl font-bold text-slate-800">Hola, {user?.preferredName || user?.firstName || 'Usuario'}.</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-sm">Clase:</span>
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Re-Builder</span>
                </div>
            </div>

            <PentagonChart />

            <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                <span className="text-slate-400 text-sm font-medium">Balance General</span>
                <span className="text-emerald-500 font-bold text-lg">78<span className="text-slate-300 text-sm">/100</span></span>
            </div>
        </div>
    );
};
