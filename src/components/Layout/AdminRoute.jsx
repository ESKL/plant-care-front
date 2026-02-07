import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const AdminRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const response = await userAPI.getProfile();
            setIsAdmin(response.data.role === 'admin');
        } catch (err) {
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Проверка прав доступа..." />;
    }

    return isAdmin ? children : <Navigate to="/profile" />;
};

export default AdminRoute;