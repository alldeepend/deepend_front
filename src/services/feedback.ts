const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const feedbackApi = {
    send: async (message: string): Promise<void> => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/v2/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ message, pageUrl: window.location.pathname }),
        })
        if (!response.ok) throw new Error('Error enviando el reporte')
    },
}
