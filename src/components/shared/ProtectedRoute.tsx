import { Navigate } from 'react-router';
import { useAuth } from '../../store/useAuth';
import PasaporteReminder from './PasaporteReminder';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Si no hay usuario, redirigir inmediatamente sin mostrar el contenido
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PasaporteReminder />
      {children}
    </>
  );
}

