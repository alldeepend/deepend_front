import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

// Registra el service worker y fuerza la revisión de versión nueva cada vez
// que la app vuelve a primer plano (clave para el acceso directo instalado
// en el celular, que casi nunca hace una recarga real por sí solo). Con
// registerType: 'autoUpdate', en cuanto detecta una versión distinta se
// activa y recarga sola, sin preguntar nada.
export default function PwaUpdater() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        registerSW({
            immediate: true,
            onRegisteredSW(_url, registration) {
                if (!registration) return;

                const checkForUpdate = () => registration.update().catch(() => {});

                const onVisible = () => {
                    if (document.visibilityState === 'visible') checkForUpdate();
                };
                document.addEventListener('visibilitychange', onVisible);
                window.addEventListener('focus', checkForUpdate);
                setInterval(checkForUpdate, 60 * 60 * 1000);
            },
        });
    }, []);

    return null;
}
