const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface NewsItem {
    id: string;
    title: string;
    text: string;
    imageUrl: string | null;
    authorName: string | null;
    createdAt: string;
}

export const newsApi = {
    getNews: async (): Promise<{ news: NewsItem[] }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/news`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        if (!response.ok) throw new Error('Error obteniendo noticias');
        return response.json();
    },

    createNews: async (payload: { title: string; text: string; imageUrl: string | null }): Promise<{ success: boolean; news: NewsItem }> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/v2/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error creando la noticia');
        return response.json();
    },

    uploadImage: async (file: File | Blob, fileName: string): Promise<{ url: string }> => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file, fileName);
        const response = await fetch(`${API_URL}/v2/news/upload-image`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        if (!response.ok) throw new Error('Error subiendo la imagen');
        const data = await response.json();
        return { url: data.imageUrl };
    },
};
