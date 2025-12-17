import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../store/useAuth';

export default function PublicRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="relative z-10 max-w-md w-full text-center">
                <img
                    src="https://media.100cosasporhacer.com/memories/9701f6ef-c3ee-4454-b2fb-996f0a5deeab-Mil_Momentos_log.webp"
                    alt="100 Cosas por hacer"
                    className="w-[224px] h-[224px] mx-auto mb-4 rounded-full object-cover animate-pulse-fast"
                />
                <h1 className="font-handwriting text-6xl text-stone-800 mb-2 animate-pulse-fast">Mil Momentos</h1>
                <h2 className="font-handwriting text-4xl text-stone-600 mb-6">Historias que dejan huellas</h2>
                <p className="text-stone-500 font-sans mb-14 px-4"></p>
            </div>
        </div>
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
