import { Navigate } from 'react-router';
import { useAuth } from '../../store/useAuth';
import PasaporteReminder from './PasaporteReminder';
import PhysicalChallengeReminder from './PhysicalChallengeReminder';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Si no hay usuario, redirigir inmediatamente sin mostrar el contenido
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Sin correo verificado, el backend rechaza cualquier acción real —
  // se manda a la pantalla de verificación en vez de un dashboard roto.
  if (user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <>
      <PasaporteReminder />
      <PhysicalChallengeReminder />
      {children}
    </>
  );
}

