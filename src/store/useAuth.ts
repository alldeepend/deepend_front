import { create } from "zustand";

// Función para obtener y validar la URL de la API (siempre absoluta)
const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  // Si existe la variable de entorno y es válida (URL absoluta)
  if (envUrl && typeof envUrl === 'string') {
    const cleanedUrl = envUrl.trim().replace(/^['"]|['"]$/g, '');
    // Validar que sea una URL absoluta
    if (cleanedUrl && (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://'))) {
      // Asegurarse de que no termine con /
      return cleanedUrl.replace(/\/$/, '');
    }
  }

  // Fallback: siempre retornar una URL absoluta
  return 'http://localhost:3000'
};

const API_URL = getApiUrl();

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
}

// Función para cargar el usuario desde localStorage
const loadUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  return null;
};

// Función para guardar el usuario en localStorage
const saveUserToStorage = (user: User | null, token: string | null): void => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token || '');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

export const useAuth = create<AuthState>((set) => ({
  user: loadUserFromStorage(),
  setUser: (user: User | null) => set({ user }),
  token: null,
  loading: false,
  error: null,
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en el login');
      }

      const data = await response.json();
      const user = data.user;
      const token = data.token;

      // Guardar el usuario en localStorage
      saveUserToStorage(user, token);

      set({ user, token, loading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ loading: false, error: errorMessage });
      return { success: false };
    }
  },
  logout: () => {
    // Eliminar el usuario del localStorage
    saveUserToStorage(null, null);
    set({ user: null, token: null, error: null });
  },
}))