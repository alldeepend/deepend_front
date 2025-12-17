import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../store/useAuth';

export default function PublicRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="relative z-10 max-w-md w-full text-center">
                <img
                    src="https://media.1000momentos.com/memories/69e82978-65ec-4ca5-9397-468483861205-DeepEnd_FondoBlanco.webp"
                    alt="DeepEnd Logo"
                    className="w-[224px] h-[224px] mx-auto mb-4 rounded-full object-cover animate-pulse-fast"
                />
                {/* <h1 className="font-handwriting text-6xl text-stone-800 mb-2 animate-pulse-fast">Mil Momentos</h1>
                <h2 className="font-handwriting text-4xl text-stone-600 mb-6">Historias que dejan huellas</h2>
                <p className="text-stone-500 font-sans mb-14 px-4"></p> */}
            </div>
        </div>
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
