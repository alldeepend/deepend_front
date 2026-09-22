const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const BACKUP_TOKEN_KEY = 'token_backup_before_view'
const BACKUP_USER_KEY = 'user_backup_before_view'
const VIEW_ONLY_FLAG = 'view_only_active'

const getApiUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl && typeof envUrl === 'string') {
        const cleaned = envUrl.trim().replace(/^['"]|['"]$/g, '')
        if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned.replace(/\/$/, '')
    }
    return 'http://localhost:3000/api'
}

// Se corre y se espera ANTES de montar la app (ver main.tsx, que importa
// App.tsx de forma dinámica después de este await) — si no, ProtectedRoute
// vería localStorage.user vacío por una fracción de segundo y redirigiría a
// "/" antes de que terminara de cargar el perfil de la persona previsualizada.
export async function initViewAsMode(): Promise<void> {
    const params = new URLSearchParams(window.location.search)
    const viewToken = params.get('viewToken')
    if (!viewToken) return

    // Respalda la sesión real (si había una) solo la primera vez — si el
    // admin abre varios "ver como" seguidos, no pisa el respaldo original.
    if (!localStorage.getItem(BACKUP_TOKEN_KEY)) {
        const existingToken = localStorage.getItem(TOKEN_KEY)
        const existingUser = localStorage.getItem(USER_KEY)
        if (existingToken) localStorage.setItem(BACKUP_TOKEN_KEY, existingToken)
        if (existingUser) localStorage.setItem(BACKUP_USER_KEY, existingUser)
    }

    localStorage.setItem(TOKEN_KEY, viewToken)
    localStorage.setItem(VIEW_ONLY_FLAG, 'true')

    // Limpia el token de la URL para que no quede pegado en el historial del navegador.
    params.delete('viewToken')
    const query = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash)

    try {
        const res = await fetch(`${getApiUrl()}/auth/me`, { headers: { Authorization: `Bearer ${viewToken}` } })
        if (res.ok) {
            const data = await res.json()
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        }
    } catch {
        // si falla, App ya llama a refreshUser() al montar y lo reintenta
    }
}

export function isViewOnlyActive(): boolean {
    return localStorage.getItem(VIEW_ONLY_FLAG) === 'true'
}

// Restaura la sesión real que había antes de "ver como" (o cierra sesión del
// todo si no había ninguna) y recarga desde cero.
export function exitViewOnlyMode(): void {
    const backupToken = localStorage.getItem(BACKUP_TOKEN_KEY)
    const backupUser = localStorage.getItem(BACKUP_USER_KEY)
    localStorage.removeItem(VIEW_ONLY_FLAG)
    localStorage.removeItem(BACKUP_TOKEN_KEY)
    localStorage.removeItem(BACKUP_USER_KEY)

    if (backupToken) localStorage.setItem(TOKEN_KEY, backupToken)
    else localStorage.removeItem(TOKEN_KEY)

    if (backupUser) localStorage.setItem(USER_KEY, backupUser)
    else localStorage.removeItem(USER_KEY)

    window.location.href = '/'
}
