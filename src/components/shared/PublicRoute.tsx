import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../store/useAuth';
import { C } from '../../styles/colors';

export default function PublicRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen" style={{ background: C.bg }}>
            <div className="relative z-10 max-w-md w-full text-center">
                <img
                    src="/Logos_Variaciones-02.png"
                    alt="DeepEnd Logo"
                    className="w-[224px] h-[224px] mx-auto mb-4 rounded-full object-cover animate-pulse-fast"
                />
            </div>
        </div>
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
