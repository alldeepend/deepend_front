import React from 'react';
import { C } from '../../styles/colors';

export const SocialProfileCard = () => (
    <div className="lg:col-span-8 p-8 rounded-2xl shadow-sm border relative overflow-hidden flex flex-col justify-center" style={{ background: C.surface1, borderColor: C.border }}>
        {/* Topographic Background Pattern (SVG) */}
        <svg className="absolute top-0 right-0 h-full w-2/3 opacity-10 pointer-events-none" viewBox="0 0 400 300" style={{ color: C.green }}>
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M350,150 Q300,100 250,150 T150,150 T50,150" />
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M380,100 Q320,50 220,100 T120,100" />
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M360,200 Q310,250 210,200 T110,200" />
            <circle cx="300" cy="80" r="10" stroke="currentColor" fill="none" />
            <circle cx="100" cy="220" r="15" stroke="currentColor" fill="none" />
            <path fill="none" stroke="currentColor" strokeWidth="1" d="M0,0 C100,50 200,0 400,100" className="opacity-50" />
        </svg>

        <div className="relative z-10 max-w-lg">
            <span className="text-[10px] font-bold border px-3 py-1 rounded-full uppercase tracking-wide" style={{ color: C.green, background: C.forest, borderColor: C.border }}>
                Mundo Actual
            </span>
            <h2 className="text-2xl mt-4 mb-2 font-light" style={{ color: C.text }}>Perfil Social del Explorador</h2>
            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: C.textMuted }}>
                Estás reconstruyendo tu red de apoyo y mejorando habilidades de comunicación estratégica.
            </p>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold tracking-wider" style={{ color: C.text }}>PROGRESO</span>
                    <span className="text-xs font-bold" style={{ color: C.green }}>65%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: C.surface2 }}>
                    <div className="h-2 rounded-full transition-all duration-1000 w-[65%]" style={{ background: C.green }}></div>
                </div>
            </div>
        </div>
    </div>
);
