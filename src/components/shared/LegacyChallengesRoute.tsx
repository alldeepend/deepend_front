import { Navigate } from 'react-router';
import { useLegacyChallengesAccess } from '../../hooks/useLegacyChallengesAccess';
import { C } from '../../styles/colors';

// Protege /challenges, /challenges/detail y /challenge-logs — el archivo de retos
// legacy solo sigue siendo accesible para cuentas que ya existían antes del corte.
export default function LegacyChallengesRoute({ children }: { children: React.ReactNode }) {
    const { data, isLoading } = useLegacyChallengesAccess();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
                <div
                    className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${C.border} ${C.green} ${C.border} ${C.border}` }}
                />
            </div>
        );
    }

    if (!data?.hasAccess) return <Navigate to="/dashboard" replace />;

    return <>{children}</>;
}
