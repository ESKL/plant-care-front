import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';

const ProfileEdit = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'user', // Добавляем поле role
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setFormData({
                username: response.data.username || '',
                email: response.data.email || '',
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                role: response.data.role || 'user',
            });
        } catch (err) {
            setError('Ошибка загрузки профиля: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess(false);

        try {
            // Удаляем поле role из отправляемых данных если пользователь не админ
            // (обычные пользователи не могут менять свою роль)
            const dataToSend = { ...formData };
            if (formData.role !== 'admin') {
                delete dataToSend.role;
            }

            await userAPI.updateProfile(dataToSend);
            setSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка обновления профиля');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading">Загрузка профиля...</div>;

    return (
        <div className="profile-edit">
            <h1>Редактирование профиля</h1>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Имя пользователя:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Имя:</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Фамилия:</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </div>

                {/* Поле role только для просмотра, редактируется только админом */}
                <div className="form-group">
                    <label>Роль:</label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
                        disabled
                        className="disabled-field"
                    />
                    <small className="field-hint">
                        {formData.role === 'admin'
                            ? 'Вы администратор системы'
                            : 'Роль может быть изменена только администратором'}
                    </small>
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">Профиль успешно обновлен!</div>}

                <div className="form-actions">
                    <button type="submit" disabled={updating}>
                        {updating ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="secondary-button"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEdit;