const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ArchetypeScoreTarget {
    familyId: string;
    variantId: string | null;
    points: number;
}

export interface ArchetypeLikertTarget {
    familyId: string;
    multiplier: number;
}

export interface ArchetypeQuestionOption {
    id: string;
    label: string;
    text: string;
    scoreTargets: ArchetypeScoreTarget[];
}

export interface ArchetypeQuestion {
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'LIKERT';
    options: ArchetypeQuestionOption[];
    likertTargets: ArchetypeLikertTarget[];
}

export interface ArchetypeResultContent {
    familyId: string;
    letter: 'A' | 'B';
    familyName: string;
    variantLabel: string;
    pattern: string;
    cost: string;
    strengths: string;
    microAction: string;
    traits: string[];
    audioUrl: string | null;
}

export interface ArchetypeConfig {
    block0: ArchetypeQuestion[];
    block1: ArchetypeQuestion[];
    block2: ArchetypeQuestion[];
    results: Record<string, ArchetypeResultContent>; // keyed por variantId
}

export interface ArchetypeResultPayload {
    dominantVariantId: string;
    secondaryFamilyId: string;
    answers?: Record<string, string | number>;
    email?: string;
}

export interface MyArchetypeResult {
    hasResult: boolean;
    result: {
        dominantVariantId: string | null;
        secondaryFamilyId: string | null;
        dominantKeySnapshot: string | null;
        secondaryNameSnapshot: string | null;
        createdAt: string;
    } | null;
}

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export const archetypeApi = {
    getConfig: async (): Promise<ArchetypeConfig> => {
        const response = await fetch(`${API_URL}/v2/archetype/config`);
        if (!response.ok) throw new Error('Error obteniendo el cuestionario del arquetipo');
        return response.json();
    },

    submitResult: async (payload: ArchetypeResultPayload): Promise<{ success: boolean }> => {
        const response = await fetch(`${API_URL}/v2/archetype/submit`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Error guardando el resultado del arquetipo');
        return response.json();
    },

    getMyResult: async (): Promise<MyArchetypeResult> => {
        const response = await fetch(`${API_URL}/v2/archetype/me`, { headers: authHeaders() });
        if (!response.ok) throw new Error('Error obteniendo el resultado del arquetipo');
        return response.json();
    },
};
