import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plantAPI, userPlantAPI } from '../../services/api';
import AddPlantModal from './AddPlantModal';

const PlantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plant, setPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isInCollection, setIsInCollection] = useState(false);

    useEffect(() => {
        fetchPlantDetail();
    }, [id]);

    const fetchPlantDetail = async () => {
        try {
            const response = await plantAPI.getPlantById(id);
            setPlant(response.data);
            checkIfInCollection(response.data.id);
        } catch (err) {
            setError(err.response?.status === 404 ? 'Растение не найдено' : 'Ошибка загрузки растения');
        } finally {
            setLoading(false);
        }
    };

    const checkIfInCollection = async (plantId) => {
        try {
            const response = await userPlantAPI.getUserPlants();
            const hasPlant = response.data.some(userPlant =>
                userPlant.plant_library_id === plantId
            );
            setIsInCollection(hasPlant);
        } catch (err) {
            console.error('Ошибка проверки коллекции:', err);
        }
    };

    const handleAddToCollection = () => {
        setShowAddModal(true);
    };

    const handleAddSuccess = () => {
        setIsInCollection(true);
        alert('Растение добавлено в вашу коллекцию!');
    };

    if (loading) return <div className="loading">Загрузка растения...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!plant) return <div>Растение не найдено</div>;

    return (
        <div className="plant-detail">
            <button onClick={() => navigate(-1)} className="back-button">
                ← Назад
            </button>

            <div className="plant-detail-content">
                <div className="plant-detail-image">
                    {plant.image_url ? (
                        <img src={plant.image_url} alt={plant.name} />
                    ) : (
                        <div className="no-image">🪴</div>
                    )}
                </div>

                <div className="plant-detail-info">
                    <h1>{plant.name}</h1>
                    <p className="plant-description">{plant.description}</p>

                    <div className="plant-specs">
                        <div className="spec-item">
                            <span className="spec-label">💡 Освещение:</span>
                            <span className="spec-value">
                {plant.light_preference === 'sun' ? 'Солнечное место' : 'Тенистое место'}
              </span>
                        </div>

                        <div className="spec-item">
                            <span className="spec-label">💧 Полив:</span>
                            <span className="spec-value">
                Каждые {plant.watering_interval} дней
              </span>
                        </div>

                        <div className="spec-item">
                            <span className="spec-label">⚡ Сложность ухода:</span>
                            <span className="spec-value">
                {plant.care_difficulty === 'easy' && '🟢 Легкая'}
                                {plant.care_difficulty === 'medium' && '🟡 Средняя'}
                                {plant.care_difficulty === 'hard' && '🔴 Сложная'}
              </span>
                        </div>
                    </div>

                    <div className="plant-actions">
                        {isInCollection ? (
                            <div className="in-collection-badge">
                                ✅ Это растение уже в вашей коллекции
                                <button onClick={() => navigate('/my-plants')} className="view-collection-button">
                                    Перейти к моим растениям
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleAddToCollection} className="add-to-collection-button">
                                ➕ Добавить в мою коллекцию
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <AddPlantModal
                    plant={plant}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    );
};

export default PlantDetail;