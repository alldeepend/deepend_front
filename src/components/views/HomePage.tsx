import React, { useEffect, useState } from 'react';
import { HomeSidebar } from '../../components/home/HomeSidebar';
import { DashboardContent } from '../../components/home/DashboardContent';
import WorldsRightSidebar, { earnedBadgesFromAreas, totalXpFromAreas } from './worlds/WorldsRightSidebar';
import { journeyApi } from '../../services/journey';
import type { Area } from '../../types/journey';


import Header from '../../components/shared/Header';

export default function HomePage() {
    const [areas, setAreas] = useState<Area[]>([]);

    useEffect(() => {
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(() => {});
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-screen font-montserrat overflow-hidden" style={{ background: '#231F20' }}>
            <div className="md:hidden w-full">
                <Header dark />
            </div>

            <HomeSidebar activeTab="Dashboard" dark />

            <main className="flex-1 min-w-0 overflow-y-auto dark-scrollbar">
                <div className="max-w-5xl mx-auto p-6 md:p-12">
                    <DashboardContent />
                </div>
            </main>

            {/* Right sidebar (desktop only) */}
            <WorldsRightSidebar mode="home" badges={earnedBadgesFromAreas(areas)} totalXp={totalXpFromAreas(areas)} />

            {/* MobileNav removed */}

        </div>
    );
}