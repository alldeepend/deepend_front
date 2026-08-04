export type WeekProgressStatus = 'locked' | 'current' | 'superada' | 'cumplida' | 'semana_ligera';

export interface WeekProgress {
    weekNumber: number;
    goalMinutes: number | null;
    minutesLogged: number;
    percentage: number | null;
    status: WeekProgressStatus;
}

export interface ProgressHistory {
    isParticipant: boolean;
    cycleNumber?: number;
    weeks: WeekProgress[];
    totals: { totalMinutes: number; weeksCompleted: number; weeksLight: number };
}

export interface WeeklyChallengeMe {
    isParticipant: boolean;
    cycleNumber?: number;
    cycleExpired?: boolean;
    weekNumber?: number;
    goalMinutes?: number | null;
    hasCheckedInThisWeek?: boolean;
    checkinResponse?: string | null;
    needsIntro?: boolean;
    showGoalPopup?: boolean;
}

export interface WeeklyChallengeProgress {
    isParticipant: boolean;
    cycleNumber?: number;
    weekNumber?: number;
    goalMinutes?: number | null;
    minutesThisWeek?: number;
    percentage?: number | null;
    activeDays?: number;
}

export interface WeeklyChallengeActivateResult {
    success: boolean;
    startDate: string;
    cycleNumber: number;
}

export interface WeeklyChallengeCycleSummary {
    cycleNumber: number;
    startDate: string;
    compromiso: string | null;
    totals: { totalMinutes: number; weeksCompleted: number; weeksLight: number };
}
