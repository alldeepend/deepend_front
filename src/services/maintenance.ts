const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const maintenanceApi = {
    getStatus: async (): Promise<{ isActive: boolean }> => {
        const response = await fetch(`${API_URL}/v2/maintenance/status`);
        if (!response.ok) throw new Error('Error fetching maintenance status');
        return response.json();
    }
};
