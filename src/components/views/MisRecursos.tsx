import React, { useState } from 'react';
import { ArrowLeft, Search, PlayCircle, BookOpen, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { MobileNav } from '../home/MobileNav';

interface ResourceCardData {
    type: 'LECTURA' | 'VIDEO' | 'HERRAMIENTA';
    title: string;
    description: string;
    imageContent: React.ReactNode;
}

const ResourceCard = ({ data }: { data: ResourceCardData }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* Image Area */}
        <div className="h-40 rounded-xl mb-4 overflow-hidden flex items-center justify-center bg-slate-50 relative">
            {data.imageContent}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                {data.type}
            </span>
            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                {data.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
                {data.description}
            </p>
        </div>
    </div>
);

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
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800" fill="none" stroke="currentColor" strokeWidth="1">
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
                <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                    <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-500">
                        <Calculator size={32} />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            <HomeSidebar activeTab="Mis Recursos" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-slate-400 text-sm mb-2 hover:text-slate-600 transition-colors group"
                                >
                                    <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Dashboard
                                </button>
                                <h2 className="text-3xl font-light text-slate-800">Recursos</h2>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-full md:w-80">
                                <input
                                    type="text"
                                    placeholder="Buscar herramientas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-sm"
                                />
                                <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
                            </div>
                        </div>

                        {/* Recommendation Section */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Recomendados para ti</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resources.map((resource, index) => (
                                    <ResourceCard key={index} data={resource} />
                                ))}
                            </div>
                        </section>

                    </div>

                </div>
            </main>

            <MobileNav />

        </div>
    );
}
