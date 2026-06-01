import { Navigate } from 'react-router'
import { useAuth } from '../../store/useAuth'

export default function WorldsRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    if (!user) return <Navigate to="/" replace />
    const allowed = ['test', 'worldtest1', 'worldtest2']
    if (!allowed.includes(user.membership)) return <Navigate to="/dashboard" replace />

    return <>{children}</>
}
