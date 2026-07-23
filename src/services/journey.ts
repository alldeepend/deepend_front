import type {
    JourneyDetailsResponse, Area, Collection,
    GateStatus, GateActivateResult, GateRespondResult, GateEvidenceType
} from '../types/journey';

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
    },

    getGateStatus: async (journeyId: string): Promise<GateStatus> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/gates/${journeyId}/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error fetching gate status');
        return response.json();
    },

    activateGate: async (journeyId: string): Promise<GateActivateResult> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/gates/${journeyId}/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error activating gate');
        return response.json();
    },

    submitGateDay: async (
        journeyId: string,
        dayNumber: number,
        payload: { evidenceType: GateEvidenceType; responseText?: string | null; mediaUrl?: string | null; secondResponse?: string | null }
    ): Promise<GateRespondResult> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/gates/${journeyId}/days/${dayNumber}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error submitting gate day');
        return response.json();
    },

    uploadGateMedia: async (gateDayId: string, file: Blob, fileName: string): Promise<{ url: string }> => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file, fileName);
        const response = await fetch(`${API_URL}/v2/gates/${gateDayId}/media`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        if (!response.ok) throw new Error('Error uploading gate media');
        return response.json();
    }
};
