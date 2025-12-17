import React from 'react';
import { HomeSidebar } from '../../components/home/HomeSidebar';
import { DashboardContent } from '../../components/home/DashboardContent';
import { MobileNav } from '../../components/home/MobileNav';

export default function HomePage() {
    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            <HomeSidebar activeTab="Dashboard" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    <DashboardContent />
                </div>
            </main>

            <MobileNav />

        </div>
    );
}