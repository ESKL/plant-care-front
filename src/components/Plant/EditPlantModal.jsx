import React, { useState } from 'react';
import { userPlantAPI } from '../../services/api';

const EditPlantModal = ({ plant, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        custom_name: plant?.custom_name || '',
        image_url: plant?.image_url || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Подготавливаем данные для отправки
            const dataToSend = {};

            if (formData.custom_name.trim() !== (plant?.custom_name || '')) {
                dataToSend.custom_name = formData.custom_name.trim() || null;
            }

            if (formData.image_url.trim() !== (plant?.image_url || '')) {
                dataToSend.image_url = formData.image_url.trim() || null;
            }

            // Если ничего не изменилось, просто закрываем модалку
            if (Object.keys(dataToSend).length === 0) {
                onClose();
                return;
            }

            const response = await userPlantAPI.updateUserPlant(plant.id, dataToSend);

            setSuccess(true);

            // Обновляем растение в родительском компоненте
            if (onUpdate) {
                const updatedPlant = {
                    ...plant,
                    ...dataToSend,
                };
                onUpdate(updatedPlant);
            }

            // Закрываем модалку через 1.5 секунды
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при обновлении растения');
        } finally {
            setLoading(false);
        }
    };

    if (!plant) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>✏️ Редактировать растение</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="modal-body">
                    <div className="plant-preview">
                        {plant.image_url ? (
                            <img src={plant.image_url} alt={plant.custom_name || plant.name} className="plant-preview-image" />
                        ) : (
                            <div className="plant-preview-placeholder">🌿</div>
                        )}
                        <div className="plant-preview-info">
                            <h3>{plant.custom_name || plant.name}</h3>
                            <p>{plant.original_name && `(Оригинальное название: ${plant.original_name})`}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="custom_name">
                                Ваше название растения
                                <span className="field-hint">(оставьте пустым, чтобы использовать оригинальное название)</span>
                            </label>
                            <input
                                type="text"
                                id="custom_name"
                                name="custom_name"
                                value={formData.custom_name}
                                onChange={handleChange}
                                placeholder={`Например: "Мой ${plant.name}"`}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image_url">
                                URL изображения
                                <span className="field-hint">(оставьте пустым, чтобы использовать изображение по умолчанию)</span>
                            </label>
                            <input
                                type="url"
                                id="image_url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/my-plant-photo.jpg"
                                disabled={loading}
                            />
                            {formData.image_url && (
                                <div className="image-preview">
                                    <small>Предпросмотр:</small>
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

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">✅ Растение успешно обновлено!</div>}

                        <div className="modal-actions">
                            <button type="submit" disabled={loading} className="submit-button">
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
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPlantModal;