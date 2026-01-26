import React from 'react';

export const PentagonChart = ({ data = [
    { label: "Salud", value: 8 },
    { label: "Dinero", value: 7 },
    { label: "Amor", value: 5 },
    { label: "Carrera", value: 9 },
    { label: "Familia", value: 6 },
    { label: "Ocio", value: 8 },
    { label: "Mente", value: 7 }
] }) => {
    // Configuraciones de geometría
    const size = 100;
    const center = size / 2;
    const radius = 45; // El alcance máximo (valor 10)
    const sides = 7;

    // Función para calcular coordenadas (x, y) según el valor (1-10) y el índice del lado
    const getPoint = (value: any, index: any) => {
        const angle = (Math.PI * 2 / sides) * index - Math.PI / 2;
        // Normalizamos el valor: (valor / 10) * radio máximo
        const r = (value / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    // Calculamos los puntos para el fondo (Heptágono perfecto escala 10)
    const outerPoints = [...Array(sides)].map((_, i) => getPoint(10, i)).join(" ");

    // Calculamos los puntos basados en los datos reales pasados por props
    const dataPoints = data.map((val, i) => getPoint(val.value, i)).join(" ");

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-sm">
                    {/* Heptágono externo de guía */}
                    <polygon
                        points={outerPoints}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="0.5"
                        className="opacity-30"
                    />

                    {/* Líneas de ejes opcionales (del centro a cada esquina) */}
                    {[...Array(sides)].map((_, i) => {
                        const [px, py] = getPoint(10, i).split(',');
                        return (
                            <line
                                key={i}
                                x1={center} y1={center}
                                x2={px} y2={py}
                                stroke="#10b981"
                                strokeWidth="0.2"
                                className="opacity-20"
                            />
                        );
                    })}

                    {/* Polígono de datos dinámico */}
                    <polygon
                        points={dataPoints}
                        fill="#ecfdf5"
                        fillOpacity="0.8"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-500 ease-in-out"
                    />
                </svg>

                {/* Icono central preservado */}
                <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <div className="bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-2 px-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-[12px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="font-medium truncate mr-1">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${(item.value / 10) * 100}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-slate-800">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
