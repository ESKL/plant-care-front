import React, { useState } from 'react';
import { userPlantAPI } from '../../services/api';

const AddPlantModal = ({ plant, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        custom_name: '',
        image_url: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            const requestData = {
                plant_library_id: plant.id,
                ...(formData.custom_name && { custom_name: formData.custom_name }),
                ...(formData.image_url && { image_url: formData.image_url }),
            };

            await userPlantAPI.addUserPlant(requestData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка добавления растения');
        } finally {
            setLoading(false);
        }
    };

    if (!plant) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Добавить растение в коллекцию</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="modal-body">
                    <div className="plant-preview">
                        {plant.image_url && (
                            <img src={plant.image_url} alt={plant.name} className="plant-preview-image" />
                        )}
                        <div className="plant-preview-info">
                            <h3>{plant.name}</h3>
                            <p>{plant.description}</p>
                            <div className="plant-details">
                                <span className="detail">💡 {plant.light_preference === 'sun' ? 'Солнце' : 'Тень'}</span>
                                <span className="detail">💧 Каждые {plant.watering_interval} дней</span>
                                <span className="detail">⚡ {plant.care_difficulty}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="custom_name">Дайте своё имя растению (необязательно):</label>
                            <input
                                type="text"
                                id="custom_name"
                                name="custom_name"
                                value={formData.custom_name}
                                onChange={handleChange}
                                placeholder={`Например: "Мой ${plant.name}"`}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image_url">URL изображения (необязательно):</label>
                            <input
                                type="url"
                                id="image_url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {error && <div className="error">{error}</div>}

                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? 'Добавление...' : 'Добавить в коллекцию'}
                            </button>
                            <button type="button" onClick={onClose} className="secondary-button">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPlantModal;