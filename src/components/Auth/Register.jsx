import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import authService from '../../services/auth';

// Добавляем пропс onRegisterSuccess
const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Регистрируем пользователя
            await userAPI.register(formData);

            // Теперь автоматически логиним пользователя
            const loginResponse = await userAPI.login({
                email: formData.email,
                password: formData.password,
            });

            // Сохраняем токен
            authService.login(loginResponse.data.token);

            setSuccess(true);

            // Вызываем callback для обновления состояния в App.jsx
            if (onRegisterSuccess) {
                onRegisterSuccess();
            }

            // Убираем задержку и сразу перенаправляем
            navigate('/library');

        } catch (err) {
            // Пробуем понять причину ошибки
            if (err.response?.status === 400) {
                if (err.response.data?.message?.includes('уже существует')) {
                    setError('Пользователь с таким email или именем уже существует');
                } else if (err.response.data?.message?.includes('пароль')) {
                    setError('Пароль должен содержать минимум 6 символов');
                } else {
                    setError('Ошибка при регистрации. Проверьте введенные данные.');
                }
            } else if (err.response?.status === 409) {
                setError('Пользователь с таким email или именем уже существует');
            } else {
                setError(err.response?.data?.message || 'Ошибка при регистрации');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-form success-screen">
                <div className="success-icon">🎉</div>
                <h2>Регистрация успешна!</h2>
                <p>Добро пожаловать в Plant Care, {formData.username}!</p>
                <p>Автоматически перенаправляем в библиотеку растений...</p>
                <div className="loading-spinner-small"></div>
            </div>
        );
    }

    return (
        <div className="auth-form">
            <div className="form-header">
                <h2>Регистрация</h2>
                <p className="form-subtitle">Создайте аккаунт для доступа к библиотеке растений</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        Имя пользователя *
                        <span className="required"> *</span>
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Придумайте имя пользователя"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>
                        Email *
                        <span className="required"> *</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Ваш email"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>
                        Пароль *
                        <span className="required"> *</span>
                        <span className="password-hint">(минимум 6 символов)</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="Придумайте пароль"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>Имя</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Ваше имя"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>Фамилия</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Ваша фамилия"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="error-message">
                        <strong>Ошибка:</strong> {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Регистрация...
                        </>
                    ) : (
                        'Создать аккаунт'
                    )}
                </button>
            </form>

            <div className="form-footer">
                <p>
                    Уже есть аккаунт? <a href="/login" className="auth-link">Войти</a>
                </p>
                <p className="form-note">
                    После регистрации вы автоматически войдете в систему и будете перенаправлены в библиотеку растений.
                </p>
            </div>
        </div>
    );
};

export default Register;