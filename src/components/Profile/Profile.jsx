import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);
        } catch (err) {
            setError('Ошибка загрузки профиля: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
            return;
        }

        setDeleting(true);
        try {
            await userAPI.deleteProfile();
            localStorage.removeItem('token');
            navigate('/login');
        } catch (err) {
            setError('Ошибка удаления аккаунта: ' + (err.message || ''));
            setDeleting(false);
        }
    };

    const getRoleDisplayName = (role) => {
        switch(role) {
            case 'admin':
                return '👑 Администратор';
            case 'user':
                return '👤 Пользователь';
            default:
                return role || 'Не указана';
        }
    };

    if (loading) return <div className="loading">Загрузка профиля...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!user) return <div className="error">Профиль не найден</div>;

    return (
        <div className="profile">
            <h1>Мой профиль</h1>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="profile-title">
                        <h2>{user.username || 'Пользователь'}</h2>
                        <div className={`role-badge ${user.role}`}>
                            {getRoleDisplayName(user.role)}
                        </div>
                    </div>
                </div>

                <div className="profile-info">
                    <div className="profile-field">
                        <strong>Email:</strong> {user.email || 'Не указан'}
                    </div>
                    <div className="profile-field">
                        <strong>Имя:</strong> {user.first_name || 'Не указано'}
                    </div>
                    <div className="profile-field">
                        <strong>Фамилия:</strong> {user.last_name || 'Не указано'}
                    </div>
                    <div className="profile-field">
                        <strong>Роль:</strong> {getRoleDisplayName(user.role)}
                    </div>
                    <div className="profile-field">
                        <strong>ID пользователя:</strong> {user.id || 'Не указан'}
                    </div>
                    <div className="profile-field">
                        <strong>Дата регистрации:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Не указана'}
                    </div>
                </div>
            </div>

            <div className="profile-actions">
                <button onClick={() => navigate('/profile/edit')} className="edit-button">
                    Редактировать профиль
                </button>
                <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="delete-button"
                >
                    {deleting ? 'Удаление...' : 'Удалить аккаунт'}
                </button>
            </div>

            {/* Административные функции (если нужно) */}
            {user.role === 'admin' && (
                <div className="admin-panel">
                    <h3>👑 Административная панель</h3>
                    <div className="admin-actions">
                        <button onClick={() => navigate('/admin/users')} className="admin-button">
                            Управление пользователями
                        </button>
                        <button onClick={() => navigate('/admin/plants')} className="admin-button">
                            Управление растениями
                        </button>
                        <button onClick={() => navigate('/admin/notifications')} className="admin-button">
                            Управление уведомлениями
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;