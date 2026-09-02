import { useQuery } from '@tanstack/react-query';

const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

// "Mis Archivados" (el sistema legacy de retos) solo es visible para cuentas que
// ya existían antes del corte — se calcula en el backend a partir de createdAt.
// Excepción: el Pasaporte (challengeId de un reto con isPassport) sigue activo
// para cualquier cuenta, nueva o vieja — el backend lo resuelve si se le pasa el id.
export function useLegacyChallengesAccess(challengeId?: string | null) {
    return useQuery({
        queryKey: ['legacy-challenges-access', challengeId ?? null],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const params = challengeId ? `?challengeId=${challengeId}` : '';
            const res = await fetch(`${host}/api/challenges/legacy-access${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return { hasAccess: false };
            return res.json() as Promise<{ hasAccess: boolean }>;
        },
        staleTime: 10 * 60 * 1000,
    });
}
