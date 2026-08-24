import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Quote } from 'lucide-react';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../shared/Header';
import { TestimonialCarousel } from '../shared/TestimonialCarousel';
import WorldsRightSidebar, { earnedBadgesFromAreas, totalXpFromAreas } from './worlds/WorldsRightSidebar';
import { journeyApi } from '../../services/journey';
import type { Area } from '../../types/journey';
import { C } from '../../styles/colors';

const heading = { fontFamily: "'American Typewriter', Georgia, serif", color: C.text };

export default function Testimonials() {
    const navigate = useNavigate();
    const [areas, setAreas] = useState<Area[]>([]);

    useEffect(() => {
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(() => setAreas([]));
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Testimonios" />

            <main className="flex-1 overflow-y-auto">
                <div className="relative overflow-hidden py-10 md:py-16 px-6">
                    {/* Textura decorativa — comillas gigantes muy tenues en cada esquina.
                        Ancladas hacia ADENTRO del contenedor (offset positivo, no negativo) para
                        que el ícono completo quede visible y overflow-hidden no le corte ningún borde. */}
                    <div
                        className="absolute pointer-events-none select-none"
                        style={{ left: 10, top: 10, transform: 'rotate(-15deg)', color: C.green, opacity: 0.07 }}
                    >
                        <Quote size={180} strokeWidth={0.7} />
                    </div>
                    <div
                        className="absolute pointer-events-none select-none"
                        style={{ right: 10, bottom: 10, transform: 'rotate(15deg) scaleX(-1)', color: C.green, opacity: 0.07 }}
                    >
                        <Quote size={180} strokeWidth={0.7} />
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-sm mb-6 transition-colors group"
                            style={{ color: C.label }}
                        >
                            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                            Dashboard
                        </button>

                        <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: C.red }}>
                            Comunidad
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold" style={heading}>
                            Lo que dice nuestra comunidad
                        </h1>
                        <p className="mt-3 max-w-lg text-sm" style={{ color: C.textMuted, fontFamily: 'Montserrat, sans-serif' }}>
                            Testimonios en audio de personas que ya recorrieron su viaje en DeepEnd.
                        </p>

                        <TestimonialCarousel />
                    </div>
                </div>
            </main>

            <WorldsRightSidebar mode="home" badges={earnedBadgesFromAreas(areas)} totalXp={totalXpFromAreas(areas)} />
        </div>
    );
}
