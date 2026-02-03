import React from 'react';
import { PentagonChart } from './PentagonChart';
import { useAuth } from '../../store/useAuth';
import { useQuery } from '@tanstack/react-query';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

export const StatsCard = () => {
    const { user } = useAuth();

    const { data: chartData, isLoading } = useQuery({
        queryKey: ['balance-chart'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/user/balance-chart`, {
                headers: { Authorization: `Bearer ${token}` }
            });


            if (!res.ok) throw new Error('Failed to fetch chart data');
            return await res.json();
        }
    });
    return (
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

            <div>
                <h3 className="text-xl font-bold text-slate-800">Tu Gráfica de la Vida</h3>
                <div className="flex items-center gap-2 mt-1">

                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                </div>
            ) : (
                <div className="relative z-10">
                    <PentagonChart data={chartData} />
                </div>
            )}
        </div>
    );
};
