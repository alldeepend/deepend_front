import { useEffect, useState } from 'react';
import { archetypeApi, type ArchetypeResultContent } from '../services/archetype';


export function useArchetypeInfo() {
    const [archetypeInfo, setArchetypeInfo] = useState<ArchetypeResultContent | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([archetypeApi.getMyResult(), archetypeApi.getConfig()]).then(([resSettled, configSettled]) => {
            if (cancelled) return;
            if (resSettled.status !== 'fulfilled' || !resSettled.value.result?.dominantVariantId) {
                setArchetypeInfo(null);
                return;
            }
            if (configSettled.status !== 'fulfilled') return; // se queda undefined a propósito
            setArchetypeInfo(configSettled.value.results[resSettled.value.result.dominantVariantId] ?? null);
        });
        return () => { cancelled = true };
    }, []);

    return archetypeInfo;
}
