import React, { useState } from 'react';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AddPlantForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        watering_interval: 7,
        light_preference: 'sun',
        care_difficulty: 'easy',
        image_url: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            setFormData({
                ...formData,
                [name]: parseInt(value) || 0,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Валидация
            if (!formData.name.trim()) {
                throw new Error('Название растения обязательно');
            }

            if (!formData.description.trim()) {
                throw new Error('Описание растения обязательно');
            }

            if (formData.watering_interval <= 0) {
                throw new Error('Интервал полива должен быть больше 0 дней');
            }

            await adminAPI.addPlantToLibrary(formData);

            setSuccess(true);
            setFormData({
                name: '',
                description: '',
                watering_interval: 7,
                light_preference: 'sun',
                care_difficulty: 'easy',
                image_url: '',
            });

            setTimeout(() => {
                navigate('/library');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при добавлении растения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-plant-form-container">
            <div className="form-header">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    ← Назад
                </button>
                <h1>➕ Добавить растение в библиотеку</h1>
                <p>Заполните информацию о новом растении</p>
            </div>

            <form onSubmit={handleSubmit} className="plant-form">
                <div className="form-section">
                    <h3>Основная информация</h3>

                    <div className="form-group">
                        <label htmlFor="name">
                            Название растения *
                            <span className="required"> *</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Например: Фикус Бенджамина"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Описание *
                            <span className="required"> *</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Опишите растение, его особенности, происхождение, рекомендации по уходу..."
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image_url">
                            URL изображения (необязательно)
                        </label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/plant-image.jpg"
                            disabled={loading}
                        />
                        <small className="field-hint">
                            Поддерживаются ссылки на изображения в форматах JPG, PNG, WebP
                        </small>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Параметры ухода</h3>

                    <div className="form-group">
                        <label htmlFor="watering_interval">
                            Интервал полива (в днях) *
                            <span className="required"> *</span>
                        </label>
                        <input
                            type="number"
                            id="watering_interval"
                            name="watering_interval"
                            value={formData.watering_interval}
                            onChange={handleChange}
                            required
                            min="1"
                            max="365"
                            disabled={loading}
                        />
                        <small className="field-hint">
                            Сколько дней должно пройти между поливами
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="light_preference">
                            Предпочтение по освещению *
                        </label>
                        <select
                            id="light_preference"
                            name="light_preference"
                            value={formData.light_preference}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="sun">☀️ Солнечное место (прямой свет)</option>
                            <option value="shade">🌿 Тенистое место (рассеянный свет)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="care_difficulty">
                            Сложность ухода *
                        </label>
                        <select
                            id="care_difficulty"
                            name="care_difficulty"
                            value={formData.care_difficulty}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="easy">🟢 Легкая (для начинающих)</option>
                            <option value="medium">🟡 Средняя (требует внимания)</option>
                            <option value="hard">🔴 Сложная (для опытных)</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <strong>Ошибка:</strong> {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        ✅ Растение успешно добавлено в библиотеку! Перенаправляем...
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Добавление...
                            </>
                        ) : (
                            '➕ Добавить растение'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="secondary-button"
                        disabled={loading}
                    >
                        Отмена
                    </button>
                </div>

                <div className="form-footer">
                    <p className="form-note">
                        <span className="required">*</span> Обязательные поля
                    </p>
                    <p className="form-note">
                        После добавления растение сразу появится в публичной библиотеке
                    </p>
                </div>
            </form>
        </div>
    );
};

export default AddPlantForm;