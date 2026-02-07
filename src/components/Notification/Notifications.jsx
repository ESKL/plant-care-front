import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]); // Начинаем с пустого массива
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Опрашивать новые уведомления каждые 60 секунд
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getUnreadNotifications();
            // Убедимся, что всегда получаем массив
            setNotifications(response.data || []);
            setError('');
        } catch (err) {
            const errorMessage = err.response?.status === 401
                ? 'Требуется авторизация'
                : err.response?.data?.message || err.message || 'Ошибка загрузки уведомлений';
            setError(errorMessage);

            // Если 401 ошибка, перенаправляем на логин
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            // Здесь должен быть эндпоинт для пометки уведомлений как прочитанных
            // Пока просто удаляем из локального состояния
            setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
            );
        } catch (err) {
            console.error('Ошибка при пометке уведомления как прочитанного:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            // Здесь должен быть эндпоинт для пометки всех уведомлений как прочитанных
            // Пока просто очищаем локальное состояние
            setNotifications([]);
        } catch (err) {
            console.error('Ошибка при пометке всех уведомлений как прочитанных:', err);
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Недавно';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays < 7) return `${diffDays} дн. назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getNotificationIcon = (notification) => {
        if (notification.message?.includes('полив') || notification.message?.includes('полить')) {
            return '💧';
        } else if (notification.message?.includes('добавлен') || notification.message?.includes('добавил')) {
            return '🌿';
        } else if (notification.message?.includes('здоров') || notification.message?.includes('состояние')) {
            return '❤️';
        } else {
            return '🔔';
        }
    };

    if (loading) return <div className="loading">Загрузка уведомлений...</div>;

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <h1>🔔 Уведомления</h1>

                {notifications.length > 0 && (
                    <div className="notifications-actions">
                        <button
                            onClick={markAllAsRead}
                            className="mark-all-read-button"
                        >
                            📭 Отметить все как прочитанные
                        </button>
                        <span className="notifications-count">
              {notifications.length} непрочитанных
            </span>
                    </div>
                )}
            </div>

            {error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button
                        onClick={fetchNotifications}
                        className="retry-button"
                    >
                        Повторить попытку
                    </button>
                </div>
            ) : notifications.length === 0 ? (
                <div className="no-notifications">
                    <div className="no-notifications-icon">📭</div>
                    <h3>Нет непрочитанных уведомлений</h3>
                    <p>Здесь будут появляться уведомления о поливе растений и других событиях</p>
                    <button
                        onClick={fetchNotifications}
                        className="refresh-button"
                    >
                        Обновить
                    </button>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification)}
                            </div>

                            <div className="notification-content">
                                <div className="notification-message">
                                    {notification.message || 'Новое уведомление'}
                                </div>

                                <div className="notification-meta">
                  <span className="notification-time">
                    {getTimeAgo(notification.created_at)}
                  </span>

                                    {notification.user_plant_id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/my-plants`);
                                            }}
                                            className="plant-link-button"
                                        >
                                            Перейти к растению
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                }}
                                className="mark-read-button"
                                title="Отметить как прочитанное"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="notifications-footer">
                <p className="notifications-info">
                    Уведомления обновляются автоматически каждую минуту
                </p>
                <button
                    onClick={fetchNotifications}
                    className="refresh-button"
                >
                    🔄 Обновить вручную
                </button>
            </div>
        </div>
    );
};

export default Notifications;