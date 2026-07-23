import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { useAuth } from '../../store/useAuth'
import { maintenanceApi } from '../../services/maintenance'
import { C } from '../../styles/colors'
import MaintenancePage from '../views/MaintenancePage'

// Envuelve TODA la app: si el modo mantenimiento esta activo, cualquier ruta
// (landing incluida) muestra el aviso, excepto /login -- para que un admin
// siempre pueda entrar a desactivarlo. Una vez logueado, solo pasa si es admin.
export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    const { user } = useAuth()
    const [maintenanceActive, setMaintenanceActive] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        maintenanceApi.getStatus()
            .then(res => setMaintenanceActive(res.isActive))
            .catch(() => setMaintenanceActive(false))
            .finally(() => setChecked(true))
    }, [])

    if (!checked) {
        return <div style={{ background: C.bg, minHeight: '100vh' }} />
    }

    const isAdmin = user?.role === 'admin'
    const isLoginPath = location.pathname === '/login'

    if (maintenanceActive && !isAdmin && !isLoginPath) {
        return <MaintenancePage />
    }

    return <>{children}</>
}
