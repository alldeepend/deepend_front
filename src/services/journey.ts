import type { JourneyDetailsResponse, Area } from '../types/journey';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const journeyApi = {
    getAvailableJourneys: async (): Promise<{areas: Area[]}> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/journeys`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error fetching journeys');
        return response.json();
    },

    getJourneyDetails: async (journeyId: string): Promise<JourneyDetailsResponse> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/journeys/${journeyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error fetching journey details');
        return response.json();
    },

    interactWithBlock: async (blockId: string, responses?: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/journeys/blocks/${blockId}/interact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ responses })
        });
        if (!response.ok) throw new Error('Error interacting with block');
        return response.json();
    }
};
