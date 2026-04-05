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
    blocks: Block[];
}

export interface World {
    id: string;
    journeyId: string;
    title: string;
    description: string | null;
    orderIndex: number;
    stations: Station[];
}

export interface Journey {
    id: string;
    areaId: string;
    title: string;
    description: string | null;
    isActive: boolean;
    worlds: World[];
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
}

export interface StationProgress {
    id: string;
    stationId: string;
    isCompleted: boolean;
    completedAt: string | null;
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
