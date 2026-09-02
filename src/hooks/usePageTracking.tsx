import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Helper to get API URL
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string') {
        const cleaned = envUrl.trim().replace(/\/$/, '');
        return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
    }
    return 'http://localhost:3000/api';
};


const SESSION_FLAG = 'deepend_session_started';

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return; // Sólo rastrear usuarios autenticados

        const track = async (action: 'LOGIN' | 'PAGE_VIEW', path: string) => {
            try {
                const API_URL = getApiUrl();
                await fetch(`${API_URL}/analytics/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ action, path })
                });
                console.log(`[TRACKING] Sent ${action} ${path}`);
            } catch (error) {
                console.error(`Failed to track ${action}:`, error);
            }
        };

        // Si esta pestaña todavía no registró su entrada (sesión reanudada con
        // un token ya guardado, sin pasar por el formulario de login), la
        // registramos una sola vez antes del primer PAGE_VIEW.
        if (!sessionStorage.getItem(SESSION_FLAG)) {
            sessionStorage.setItem(SESSION_FLAG, '1');
            track('LOGIN', location.pathname + location.search);
        }

        track('PAGE_VIEW', location.pathname + location.search);
    }, [location.pathname, location.search]);
};
