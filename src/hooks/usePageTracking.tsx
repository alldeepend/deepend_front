import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Helper to get API URL
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string') {
        return envUrl.replace(/\/$/, '');
    }
    return 'http://localhost:3000'; // Fallback
};

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return; // Sólo rastrear usuarios autenticados

        const trackPageView = async () => {
            try {
                const API_URL = getApiUrl();
                await fetch(`${API_URL}/api/analytics/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action: 'PAGE_VIEW',
                        path: location.pathname
                    })
                });
            } catch (error) {
                console.error("Failed to track page view:", error);
            }
        };

        trackPageView();
    }, [location.pathname]);
};
