import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    user: any;
    requiredRole?: 'admin' | 'user' | 'documentaliste';
    redirectPath?: string;
}

const ProtectedRoute = ({
    user,
    requiredRole,
    redirectPath = '/login'
}: ProtectedRouteProps) => {
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
