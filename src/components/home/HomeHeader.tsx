import React from 'react';

export const HomeHeader = () => (
    <header className="flex justify-between items-end mb-8">
        <div>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1"> {new Date().toLocaleDateString()}</p>
            <h2 className="text-3xl font-light text-slate-800">Panel de Control</h2>
        </div>

        {/* Avatar Placeholder */}
        {/* <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
        </div> */}
    </header>
);
