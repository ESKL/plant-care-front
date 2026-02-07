import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);

            if (response.data.role !== 'admin') {
                navigate('/profile');
            }
        } catch (err) {
            console.error('Ошибка проверки прав доступа:', err);
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Проверка прав доступа...</div>;

    return (
        <div className="admin-panel-page">
            <div className="admin-header">
                <h1>👑 Административная панель</h1>
                <p className="admin-subtitle">Добро пожаловать, администратор {user?.username}</p>
            </div>

            <div className="admin-sections">
                <div className="admin-section">
                    <h3>🌿 Управление растениями</h3>
                    <div className="admin-actions">
                        <Link to="/admin/add-plant" className="admin-action-button">
                            ➕ Добавить новое растение
                        </Link>
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            📝 Редактировать растения
                        </button>
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            🗑️ Удалить растение
                        </button>
                        <Link to="/library" className="admin-action-button">
                            👀 Просмотреть библиотеку
                        </Link>
                    </div>
                </div>

                <div className="admin-section">
                    <h3>👥 Управление пользователями</h3>
                    <div className="admin-actions">
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            📊 Список пользователей
                        </button>
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            🔧 Изменить роль пользователя
                        </button>
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            📧 Отправить уведомление
                        </button>
                    </div>
                </div>

                <div className="admin-section">
                    <h3>⚙️ Системные настройки</h3>
                    <div className="admin-actions">
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            🔔 Настройка уведомлений
                        </button>
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            📱 Настройки приложения
                        </button>
                        <button className="admin-action-button" onClick={() => alert('В разработке')}>
                            📊 Статистика системы
                        </button>
                    </div>
                </div>

                <div className="admin-section">
                    <h3>📋 Быстрая статистика</h3>
                    <div className="admin-stats">
                        <div className="stat-card">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Всего растений</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Активных пользователей</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">0</span>
                            <span className="stat-label">Уведомлений сегодня</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;