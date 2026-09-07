import { useQuery } from '@tanstack/react-query';
import { archetypeApi } from '../services/archetype';

// El cuestionario y el contenido de resultado ahora vienen del admin, no de un
// archivo estático — se cachea agresivo porque no cambia a mitad de sesión.
export function useArchetypeConfig() {
    return useQuery({
        queryKey: ['archetype-config'],
        queryFn: archetypeApi.getConfig,
        staleTime: Infinity,
    });
}
