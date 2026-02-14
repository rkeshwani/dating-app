import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

const ADMIN_EMAILS = ['rohit.keshwani@gmail.com'];

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        // Redirect to home if not logged in or not admin
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
