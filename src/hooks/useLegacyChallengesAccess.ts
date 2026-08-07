import { useQuery } from '@tanstack/react-query';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

// "Mis Archivados" (el sistema legacy de retos) solo es visible para cuentas que
// ya existían antes del corte — se calcula en el backend a partir de createdAt.
export function useLegacyChallengesAccess() {
    return useQuery({
        queryKey: ['legacy-challenges-access'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenges/legacy-access`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return { hasAccess: false };
            return res.json() as Promise<{ hasAccess: boolean }>;
        },
        staleTime: 10 * 60 * 1000,
    });
}
