import type { JourneyDetailsResponse, Area, Collection } from '../types/journey';

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

    getCollections: async (): Promise<{ collections: Collection[] }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/collections`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error fetching collections');
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
    },

    uploadBlockMedia: async (blockId: string, file: Blob, fileName: string): Promise<{ url: string }> => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file, fileName);
        const response = await fetch(`${API_URL}/v2/journeys/blocks/${blockId}/media`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        if (!response.ok) throw new Error('Error uploading media');
        return response.json();
    }
};
