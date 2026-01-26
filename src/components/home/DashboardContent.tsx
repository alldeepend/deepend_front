import React from 'react';
import { HomeHeader } from './HomeHeader';
import { StatsCard } from './StatsCard';
import { SocialProfileCard } from './SocialProfileCard';
import { ActiveChallenges } from './ActiveChallenges';

export const DashboardContent = () => (
    <>
        <HomeHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <StatsCard />
            {/* <SocialProfileCard /> */}
        </div>

        <ActiveChallenges />
    </>
);
