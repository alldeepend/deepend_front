export interface Block {
    id: string;
    stationId: string;
    title: string;
    description: string | null;
    type: string;
    content: any;
    orderIndex: number;
}

export interface Station {
    id: string;
    worldId: string;
    title: string;
    description: string | null;
    orderIndex: number;
    xp: number;
    badgeName: string | null;
    blocks: Block[];
}

export interface World {
    id: string;
    journeyId: string;
    title: string;
    description: string | null;
    orderIndex: number;
    imageUrl: string | null;
    completionVideoUrl: string | null;
    stations: Station[];
}

export interface Journey {
    id: string;
    areaId: string;
    title: string;
    description: string | null;
    isActive: boolean;
    allowed_memberships: string[];
    worlds: World[];
    area?: { id: string; name: string };
}

export interface Area {
    id: string;
    name: string;
    description: string | null;
    journeys: Journey[];
}

export interface UserJourneyProgress {
    id: string;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
    totalXpEarned: number;
    earnedBadges: string[];
    currentStreak: number;
    lastActivityDate: string | null;
}

export interface StationProgress {
    id: string;
    stationId: string;
    isCompleted: boolean;
    completedAt: string | null;
    xpEarned: number;
}

export interface BlockInteraction {
    id: string;
    blockId: string;
    isCompleted: boolean;
    responses: any;
    completedAt: string | null;
}

export interface JourneyDetailsResponse {
    journey: Journey;
    progress: {
        userJourney: UserJourneyProgress | null;
        stationProgress: StationProgress[];
        blockInteractions: BlockInteraction[];
    }
}

export interface BlockInteractResult {
    success: boolean;
    interaction: BlockInteraction;
    stationCompleted: boolean;
    xpEarned?: number;
    streakBonus?: number;
    totalXpEarned?: number;
    newStreak?: number;
    badgeEarned?: string | null;
    earnedBadges?: string[];
}
