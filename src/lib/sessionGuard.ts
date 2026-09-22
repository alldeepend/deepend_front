import { useAuth } from '../store/useAuth';
import { isViewOnlyActive, exitViewOnlyMode } from './viewAsGuard';

// Códigos de auth.middleware.js que significan "esta sesión ya no sirve" —
// a diferencia de otros 403 de negocio (membresía, cohorte, admin, etc.)
// que NO deben cerrar la sesión del usuario.
const SESSION_INVALID_CODES = new Set(['TOKEN_EXPIRED', 'INVALID_TOKEN', 'SESSION_REVOKED']);

const originalFetch = window.fetch.bind(window);

window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (response.status === 403) {
        try {
            const body = await response.clone().json();
            if (SESSION_INVALID_CODES.has(body?.code)) {
                // El token de "Ver como" (15 min) vence igual que cualquier otro y
                // cae acá — si se cierra con logout() normal, la bandera de vista
                // previa y el respaldo de la sesión real del admin se quedan
                // pegados en localStorage para siempre, sin restaurar nada.
                if (isViewOnlyActive()) {
                    exitViewOnlyMode();
                } else {
                    // logout() ya limpia localStorage/el store en la primera llamada,
                    // así que si varias peticiones fallan a la vez esto es idempotente.
                    useAuth.getState().logout();
                }
            }
        } catch {
            // el cuerpo no era JSON — no es uno de nuestros 403 de sesión
        }
    }

    return response;
};
