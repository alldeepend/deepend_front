import React from 'react';

export const PentagonChart = () => (
    <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
        {/* Fondo decorativo del gráfico */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Pentágono externo */}
            <polygon
                points="50,5 95,35 80,90 20,90 5,35"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.5"
                className="opacity-30"
            />
            {/* Pentágono medio */}
            <polygon
                points="50,15 85,40 73,83 27,83 15,40"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.5"
                className="opacity-50"
            />
            {/* Pentágono de datos (relleno) */}
            <polygon
                points="50,25 75,45 65,75 35,75 25,45"
                fill="#ecfdf5"
                stroke="#10b981"
                strokeWidth="2"
            />
        </svg>
        {/* Icono central */}
        <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
            <div className="bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
        </div>
    </div>
);
