import React, { useState } from 'react';
import { ArrowLeft, Search, PlayCircle, BookOpen, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { C } from '../../styles/colors';


interface ResourceCardData {
    type: 'LECTURA' | 'VIDEO' | 'HERRAMIENTA';
    title: string;
    description: string;
    imageContent: React.ReactNode;
}

const ResourceCard = ({ data }: { data: ResourceCardData }) => (
    <div className="rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col border" style={{ background: C.surface1, borderColor: C.border }}>
        {/* Image Area */}
        <div className="h-40 rounded-xl mb-4 overflow-hidden flex items-center justify-center relative" style={{ background: C.surface2 }}>
            {data.imageContent}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: C.label }}>
                {data.type}
            </span>
            <h3 className="text-lg font-bold mb-2 leading-tight" style={{ color: C.text }}>
                {data.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                {data.description}
            </p>
        </div>
    </div>
);

import Header from '../../components/shared/Header';

export default function MisRecursos() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const resources: ResourceCardData[] = [
        {
            type: 'LECTURA',
            title: 'Psicología del Dinero',
            description: 'Entiende cómo tus emociones afectan tus gastos.',
            imageContent: (
                <div className="text-center p-6">
                    <div className="mx-auto w-24 h-24 relative opacity-80">
                        {/* Stylized Brain Representation */}
                        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: C.text }}>
                            <path d="M20,50 Q20,20 50,20 Q80,20 80,50 Q80,80 50,80 Q20,80 20,50" className="opacity-20" />
                            <path d="M25,55 Q30,30 50,35 Q70,30 75,55" />
                            <path d="M30,65 Q50,90 70,65" />
                            <text x="50" y="55" textAnchor="middle" className="text-[10px] uppercase tracking-widest fill-current stroke-none" style={{ fontSize: '10px' }}>Mindscapes</text>
                        </svg>
                    </div>
                </div>
            )
        },
        {
            type: 'VIDEO',
            title: 'Meditación Express',
            description: '5 minutos para recentrarte antes de trabajar.',
            imageContent: (
                <div className="w-full h-full bg-slate-800 relative group">
                    <img
                        src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Meditación"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={48} className="text-white opacity-90 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                </div>
            )
        },
        {
            type: 'HERRAMIENTA',
            title: 'Calculadora de Interés',
            description: 'Visualiza el poder del interés compuesto.',
            imageContent: (
                <div className="w-full h-full flex items-center justify-center" style={{ background: C.forest }}>
                    <div className="p-4 rounded-2xl" style={{ background: C.surface3, color: C.green }}>
                        <Calculator size={32} />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Mis Recursos" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-sm mb-2 transition-colors group"
                                    style={{ color: C.label }}
                                >
                                    <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Dashboard
                                </button>
                                <h2 className="text-3xl font-light" style={{ color: C.text }}>Recursos</h2>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-full md:w-80">
                                <input
                                    type="text"
                                    placeholder="Buscar herramientas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none shadow-sm border"
                                    style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                />
                                <Search size={18} className="absolute left-3 top-2.5" style={{ color: C.label }} />
                            </div>
                        </div>

                        {/* Recommendation Section */}
                        <section>
                            <h3 className="text-lg font-bold mb-6" style={{ color: C.text }}>Recomendados para ti</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resources.map((resource, index) => (
                                    <ResourceCard key={index} data={resource} />
                                ))}
                            </div>
                        </section>

                    </div>

                </div>
            </main>



        </div>
    );
}
