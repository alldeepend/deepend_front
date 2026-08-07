import React, { useEffect, useState } from 'react';
import { HomeSidebar } from '../../components/home/HomeSidebar';
import { DashboardContent } from '../../components/home/DashboardContent';
import WorldsRightSidebar, { earnedBadgesFromAreas, totalXpFromAreas } from './worlds/WorldsRightSidebar';
import { journeyApi } from '../../services/journey';
import type { Area } from '../../types/journey';
import { useAuth } from '../../store/useAuth';
import { C } from '../../styles/colors';

import Header from '../../components/shared/Header';

export default function HomePage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
    const { user } = useAuth();
    const displayName = user?.preferredName || user?.firstName || 'Usuario';

    useEffect(() => {
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(() => {});
    }, []);

    // La portada con imagen + slide-down es solo para desktop — en celular
    // quedaba descuadrada, así que ahí se entra directo al dashboard.
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const onChange = () => setIsMobile(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const goTo = (idx: number) => setCurrentIdx(Math.max(0, Math.min(idx, 1)));

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] font-montserrat overflow-hidden" style={{ background: '#231F20' }}>
            <div className="md:hidden w-full">
                <Header dark />
            </div>

            <HomeSidebar activeTab="Dashboard" dark />

            <main className="flex-1 min-w-0 overflow-hidden">
                {isMobile ? (
                    <div className="h-full overflow-y-auto dark-scrollbar">
                        <div className="p-6">
                            <DashboardContent />
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            transform: `translateY(calc(${-currentIdx} * 100dvh))`,
                            transition: 'transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)',
                            willChange: 'transform',
                        }}
                    >
                        {/* ── Sección 0: Portada ── */}
                        <div className="relative flex flex-col" style={{ height: '100dvh' }}>
                            <img
                                src="/Dashboard_image.webp"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ objectPosition: '70% center' }}
                                alt=""
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to bottom, rgba(35,31,32,0.5) 0%, rgba(35,31,32,0.2) 35%, rgba(35,31,32,0.6) 100%)' }}
                            />

                            <div className="relative z-10 flex items-center justify-between px-6 pt-10">
                                <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.textMuted }}>
                                    DEEP END · {user?.membership?.toUpperCase() ?? 'TEST'}
                                </p>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
                                <img
                                    src="/Logos_Variaciones-02.png"
                                    alt="DeepEnd"
                                    className="w-44 object-contain"
                                />
                                <h1
                                    className="text-3xl font-bold leading-snug"
                                    style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                                >
                                    Hola, {displayName}
                                </h1>
                            </div>

                            <div className="relative z-10 flex flex-col items-center pb-10 gap-2">
                                <p className="text-xs tracking-[0.2em] uppercase" style={{ color: C.textMuted }}>
                                    Baja para ver tu dashboard
                                </p>
                            </div>
                        </div>

                        {/* ── Sección 1: Dashboard ── */}
                        <div style={{ height: '100dvh' }} className="overflow-y-auto dark-scrollbar">
                            <div className="max-w-5xl mx-auto p-6 md:p-12">
                                <DashboardContent />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Botones de navegación entre portada y dashboard — solo desktop */}
            {!isMobile && (
                <div className={`fixed left-1/2 md:left-[calc(50%-2rem)] -translate-x-1/2 z-50 flex flex-row gap-3 ${currentIdx > 0 ? 'bottom-6' : 'bottom-16'}`}>
                    {currentIdx > 0 && (
                        <button
                            onClick={() => goTo(currentIdx - 1)}
                            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                            style={{ background: C.surface1, border: `1px solid ${C.border}`, color: C.text }}
                            aria-label="Volver a la portada"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15" />
                            </svg>
                        </button>
                    )}
                    {currentIdx < 1 && (
                        <button
                            onClick={() => goTo(currentIdx + 1)}
                            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-bounce"
                            style={{ background: C.red, color: '#fff' }}
                            aria-label="Ver mi dashboard"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* Right sidebar (desktop only) */}
            <WorldsRightSidebar mode="home" badges={earnedBadgesFromAreas(areas)} totalXp={totalXpFromAreas(areas)} />

            {/* MobileNav removed */}

        </div>
    );
}
