import React, { useState } from 'react';
import { adminAPI } from '../../services/api';

const EditLibraryPlantModal = ({ plant, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: plant?.name || '',
        description: plant?.description || '',
        watering_interval: plant?.watering_interval || 7,
        light_preference: plant?.light_preference || 'sun',
        care_difficulty: plant?.care_difficulty || 'easy',
        image_url: plant?.image_url || '',
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

            const response = await adminAPI.updatePlantInLibrary(plant.id, formData);

            setSuccess(true);

            // Обновляем растение в родительском компоненте
            if (onUpdate) {
                const updatedPlant = {
                    ...plant,
                    ...formData,
                };
                onUpdate(updatedPlant);
            }

            // Закрываем модалку через 1.5 секунды
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при обновлении растения');
        } finally {
            setLoading(false);
        }
    };

    if (!plant) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content library-edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>✏️ Редактирование растения</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="modal-body">
                    <div className="plant-info-header">
                        <div className="plant-id-label">ID: {plant.id}</div>
                        {plant.image_url && (
                            <div className="current-image">
                                <small>Текущее изображение:</small>
                                <img
                                    src={plant.image_url}
                                    alt={plant.name}
                                    className="current-image-preview"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<div class="image-error">Изображение недоступно</div>';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
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
                                    rows="5"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="image_url">
                                    URL изображения
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
                                {formData.image_url && (
                                    <div className="image-preview">
                                        <small>Предпросмотр нового изображения:</small>
                                        <img
                                            src={formData.image_url}
                                            alt="Предпросмотр"
                                            className="preview-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div class="preview-error">Не удалось загрузить изображение</div>';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Параметры ухода</h3>

                            <div className="form-row">
                                <div className="form-group half-width">
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
                                </div>

                                <div className="form-group half-width">
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
                                ✅ Растение успешно обновлено!
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="submit"
                                disabled={loading}
                                className="submit-button"
                            >
                                {loading ? 'Сохранение...' : '💾 Сохранить изменения'}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
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
                                Изменения будут видны всем пользователям в библиотеке растений
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditLibraryPlantModal;