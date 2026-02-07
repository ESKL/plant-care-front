import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import authService from '../../services/auth';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
            const response = await userAPI.login(formData);
            authService.login(response.data.token);
            navigate('/my-plants');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
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
                    <label>Пароль:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
            <p>
                Нет аккаунта? <a href="/register">Зарегистрироваться</a>
            </p>
        </div>
    );
};

export default Login;