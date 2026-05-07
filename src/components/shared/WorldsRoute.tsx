import { Navigate } from 'react-router'
import { useAuth } from '../../store/useAuth'

export default function WorldsRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    if (!user) return <Navigate to="/" replace />
    if (user.membership !== 'test') return <Navigate to="/dashboard" replace />

    return <>{children}</>
}
