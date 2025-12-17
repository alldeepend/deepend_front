import React from 'react';

export const SocialProfileCard = () => (
    <div className="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-center">
        {/* Topographic Background Pattern (SVG) */}
        <svg className="absolute top-0 right-0 h-full w-2/3 opacity-10 text-emerald-600 pointer-events-none" viewBox="0 0 400 300">
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M350,150 Q300,100 250,150 T150,150 T50,150" />
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M380,100 Q320,50 220,100 T120,100" />
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M360,200 Q310,250 210,200 T110,200" />
            <circle cx="300" cy="80" r="10" stroke="currentColor" fill="none" />
            <circle cx="100" cy="220" r="15" stroke="currentColor" fill="none" />
            <path fill="none" stroke="currentColor" strokeWidth="1" d="M0,0 C100,50 200,0 400,100" className="opacity-50" />
        </svg>

        <div className="relative z-10 max-w-lg">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wide">
                Mundo Actual
            </span>
            <h2 className="text-2xl text-slate-800 mt-4 mb-2 font-light">Perfil Social del Explorador</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
                Estás reconstruyendo tu red de apoyo y mejorando habilidades de comunicación estratégica.
            </p>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-900 tracking-wider">PROGRESO</span>
                    <span className="text-xs font-bold text-emerald-500">65%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 w-[65%] shadow-lg shadow-emerald-200"></div>
                </div>
            </div>
        </div>
    </div>
);
