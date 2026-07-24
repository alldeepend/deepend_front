const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ArchetypeResultPayload {
    dominantKey: string;
    secondaryNum: number;
    answers?: Record<number, string | number>;
    email?: string;
}

export interface MyArchetypeResult {
    hasResult: boolean;
    result: { dominantKey: string; secondaryNum: number; createdAt: string } | null;
}

export const archetypeApi = {
    submitResult: async (payload: ArchetypeResultPayload): Promise<{ success: boolean }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/archetype/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error guardando el resultado del arquetipo');
        return response.json();
    },

    getMyResult: async (): Promise<MyArchetypeResult> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/archetype/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error obteniendo el resultado del arquetipo');
        return response.json();
    },
};
