import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationAPI, userAPI } from '../../services/api';

const Header = ({ isAuthenticated, onLogout }) => {
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            fetchUserProfile();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getUnreadNotifications();
            setNotificationsCount(response.data?.length || 0);
        } catch (err) {
            console.error('Ошибка загрузки уведомлений:', err);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin': return '👑';
            case 'user': return '👤';
            default: return '';
        }
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/" className="nav-link">
                    🌿 Plant Care
                </Link>
            </div>

            <nav className="nav-links">
                {isAuthenticated ? (
                    <>
                        <Link to="/my-plants" className="nav-link">
                            Мои растения
                        </Link>
                        <Link to="/library" className="nav-link">
                            Библиотека
                        </Link>
                        <Link to="/notifications" className="nav-link">
                            Уведомления
                            {notificationsCount > 0 && (
                                <span className="notification-badge">{notificationsCount}</span>
                            )}
                        </Link>

                        {/* Показываем роль пользователя */}
                        {user && (
                            <div className="user-info">
                                <Link to="/profile" className="nav-link user-profile-link">
                                    {getRoleIcon(user.role)} {user.username}
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="nav-link admin-link">
                                        Админ
                                    </Link>
                                )}
                            </div>
                        )}
                        
                        {user?.role === 'admin' && (
                            <div className="admin-quick-actions">
                                <Link to="/admin/add-plant" className="nav-link admin-quick-link">
                                    ➕ Добавить растение
                                </Link>
                            </div>
                        )}

                        <button onClick={handleLogout} className="nav-link logout-button">
                            Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">
                            Вход
                        </Link>
                        <Link to="/register" className="nav-link">
                            Регистрация
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;