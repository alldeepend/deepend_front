import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { C } from '../../styles/colors';

const CHECK_INTERVAL = 5 * 60 * 1000;

// Registra el service worker y revisa si hay versión nueva: al cargar la
// página, al volver a primer plano (foco/visibilidad) y cada 5 minutos como
// respaldo. Con registerType: 'prompt', nunca recarga sola — solo avisa, para
// no perder algo que el usuario esté escribiendo a medias en una estación.
export default function PwaUpdater() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        updateSWRef.current = registerSW({
            immediate: true,
            onNeedRefresh() {
                setNeedRefresh(true);
            },
            onRegisteredSW(_url, registration) {
                if (!registration) return;

                const checkForUpdate = () => registration.update().catch(() => {});

                // Revisa de una vez al registrar — antes solo se revisaba en
                // cambios de visibilidad/foco o cada hora, así que una pestaña
                // recién abierta podía tardar mucho en enterarse de una versión nueva.
                checkForUpdate();

                const onVisible = () => {
                    if (document.visibilityState === 'visible') checkForUpdate();
                };
                document.addEventListener('visibilitychange', onVisible);
                window.addEventListener('focus', checkForUpdate);
                setInterval(checkForUpdate, CHECK_INTERVAL);
            },
        });
    }, []);

    if (!needRefresh) return null;

    return (
        <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-stretch gap-3 rounded-xl px-4 py-3.5 shadow-2xl"
            style={{ background: C.surface1, border: `1px solid ${C.border}`, width: 280, maxWidth: 'calc(100vw - 32px)' }}
        >
            <p className="text-sm leading-snug" style={{ color: C.text }}>
                Hay una versión nueva de DeepEnd disponible.
            </p>
            <button
                onClick={() => updateSWRef.current?.(true)}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: C.red, color: '#fff' }}
            >
                Actualizar
            </button>
        </div>
    );
}
