import React, { useState } from 'react';
import { HomeHeader } from './HomeHeader';
import { StatsCard } from './StatsCard';
import { SocialProfileCard } from './SocialProfileCard';
import { ActiveChallenges } from './ActiveChallenges';
import ActivityLogModal from '../shared/ActivityLogModal';
import { RecentActivities } from './RecentActivities';

export const DashboardContent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <HomeHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <StatsCard />
                {/* <SocialProfileCard /> */}
            </div>

            <RecentActivities onAddActivity={() => setIsModalOpen(true)} />

            {/* <ActiveChallenges /> */}

            <ActivityLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};
