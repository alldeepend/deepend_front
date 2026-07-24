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
    completionImageUrl: string | null;
    blocks: Block[];
    // Progreso del usuario actual para esta estación — solo viene poblado
    // cuando el endpoint es getAvailableJourneys (para evitar pedir el
    // detalle completo del viaje solo para saber en qué mundo va).
    userProgress?: { isCompleted: boolean }[];
}

export interface JourneyGateSummary {
    title: string;
    isActive: boolean;
    xpPerDay: number;
    xpBonusClose: number;
    userGates: { activatedAt: string | null; completedAt: string | null; totalXpEarned: number }[];
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
    userJourneys?: UserJourneyProgress[];
    // Solo viene poblado cuando el endpoint es getAvailableJourneys.
    gate?: JourneyGateSummary | null;
}

export interface Area {
    id: string;
    name: string;
    description: string | null;
    journeys: Journey[];
}

export interface Collection {
    id: string;
    title: string;
    description: string | null;
    journeys: (Journey & { areaName: string })[];
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

export type GateEvidenceType = 'texto' | 'audio' | 'foto' | 'check';

export type GateDayState = 'completed' | 'today' | 'pending' | 'tomorrow' | 'future';

export interface GateDayResponse {
    evidenceType: GateEvidenceType;
    responseText: string | null;
    mediaUrl: string | null;
    secondResponse: string | null;
}

export interface GateDayStatus {
    id: string;
    dayNumber: number;
    anchorLabel: string | null;
    question: string;
    bodyText: string | null;
    checkOnly: boolean;
    hasSecondQuestion: boolean;
    secondQuestion: string | null;
    state: GateDayState;
    response: GateDayResponse | null;
}

export interface GateInfo {
    id: string;
    title: string;
    subtitle: string | null;
    xpPerDay: number;
    xpBonusClose: number;
}

export interface GateStatus {
    hasGate: boolean;
    gate?: GateInfo;
    activated?: boolean;
    activatedAt?: string | null;
    currentDay?: number;
    totalXpEarned?: number;
    completed?: boolean;
    days?: GateDayStatus[];
}

export interface GateActivateResult {
    success: boolean;
    activatedAt: string;
}

export interface GateRespondResult {
    success: boolean;
    xpEarned: number;
    totalXpEarned: number;
    gateCompleted: boolean;
}
