const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const changelogApi = {
    getStatus: async (): Promise<{ version: string; shouldShow: boolean }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/changelog/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error obteniendo estado de novedades');
        return response.json();
    },

    markSeen: async (): Promise<{ success: boolean }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/changelog/seen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error marcando novedades como vistas');
        return response.json();
    },
};
