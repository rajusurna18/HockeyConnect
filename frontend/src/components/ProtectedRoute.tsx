import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: ('STUDENT' | 'COACH' | 'ADMIN')[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.role)) {
    // Redirect to their own dashboard
    const dash = user.role === 'ADMIN' ? '/admin/dashboard'
      : user.role === 'COACH' ? '/coach/dashboard'
      : '/student/dashboard';
    return <Navigate to={dash} replace />;
  }

  return <>{children}</>;
}
