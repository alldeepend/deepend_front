import React from 'react';
import { HomeSidebar } from '../../components/home/HomeSidebar';
import { DashboardContent } from '../../components/home/DashboardContent';


import Header from '../../components/shared/Header';

export default function HomePage() {
    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans overflow-hidden">
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Dashboard" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    <DashboardContent />
                </div>
            </main>

            {/* MobileNav removed */}

        </div>
    );
}