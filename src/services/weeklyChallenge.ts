import type {
    ProgressHistory, WeeklyChallengeMe, WeeklyChallengeProgress, WeeklyChallengeActivateResult,
    WeeklyChallengeCycleSummary, WeeklyChallengeIntroContent
} from '../types/weeklyChallenge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const weeklyChallengeApi = {
    activate: async (): Promise<WeeklyChallengeActivateResult> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/activate`, {
            method: 'POST',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Error activating weekly challenge');
        return response.json();
    },

    getIntroContent: async (): Promise<WeeklyChallengeIntroContent> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/intro-content`, {
            method: 'GET',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Error fetching weekly challenge intro content');
        return response.json();
    },

    getMe: async (): Promise<WeeklyChallengeMe> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/me`, {
            method: 'GET',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Error fetching weekly challenge status');
        return response.json();
    },

    submitIntro: async (responses: any): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/intro`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ responses })
        });
        if (!response.ok) throw new Error('Error submitting weekly challenge intro');
        return response.json();
    },

    setGoal: async (goalMinutes: number): Promise<{ success: boolean; goalMinutes: number }> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/goal`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ goalMinutes })
        });
        if (!response.ok) throw new Error('Error setting weekly challenge goal');
        return response.json();
    },

    submitCheckin: async (response_: string): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/checkin`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ response: response_ })
        });
        if (!response.ok) throw new Error('Error submitting weekly challenge check-in');
        return response.json();
    },

    getProgress: async (): Promise<WeeklyChallengeProgress> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/progress`, {
            method: 'GET',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Error fetching weekly challenge progress');
        return response.json();
    },

    getProgressHistory: async (): Promise<ProgressHistory> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/progress/history`, {
            method: 'GET',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Error fetching weekly challenge progress history');
        return response.json();
    },

    getCycles: async (): Promise<{ cycles: WeeklyChallengeCycleSummary[] }> => {
        const response = await fetch(`${API_URL}/v2/weekly-challenge/cycles`, {
            method: 'GET',
            headers: authHeaders()
        });
        if (!response.ok) throw new Error('Error fetching weekly challenge cycles');
        return response.json();
    },
};
