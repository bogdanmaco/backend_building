import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface Props {
  children: JSX.Element;
}

const RequireAuth = ({ children }: Props) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
