import { useEffect, useState } from 'react';
import { archetypeApi, type ArchetypeResultContent } from '../services/archetype';

export type ArchetypeInfoWithImage = ArchetypeResultContent & { imageUrl: string | null };

// imageFemenino/imageMasculino según el género registrado — "Otro" o sin dato
// cae a la que exista (femenino primero), en vez de no mostrar ninguna.
function pickImage(content: ArchetypeResultContent, genero: string | null): string | null {
    const g = genero?.toLowerCase();
    if (g === 'masculino') return content.imageMasculino ?? content.imageFemenino ?? null;
    return content.imageFemenino ?? content.imageMasculino ?? null;
}

export function useArchetypeInfo() {
    const [archetypeInfo, setArchetypeInfo] = useState<ArchetypeInfoWithImage | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([archetypeApi.getMyResult(), archetypeApi.getConfig()]).then(([resSettled, configSettled]) => {
            if (cancelled) return;
            if (resSettled.status !== 'fulfilled' || !resSettled.value.result?.dominantVariantId) {
                setArchetypeInfo(null);
                return;
            }
            if (configSettled.status !== 'fulfilled') return; // se queda undefined a propósito
            const content = configSettled.value.results[resSettled.value.result.dominantVariantId];
            setArchetypeInfo(content ? { ...content, imageUrl: pickImage(content, resSettled.value.genero) } : null);
        });
        return () => { cancelled = true };
    }, []);

    return archetypeInfo;
}
