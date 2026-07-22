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
                    src="https://media.1000momentos.com/memories/69e82978-65ec-4ca5-9397-468483861205-DeepEnd_FondoBlanco.webp"
                    alt="DeepEnd Logo"
                    className="w-[224px] h-[224px] mx-auto mb-4 rounded-full object-cover animate-pulse-fast"
                    style={{ filter: 'invert(1) brightness(2)' }}
                />
            </div>
        </div>
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
