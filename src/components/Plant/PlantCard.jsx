import React, { useState } from 'react';
import { userPlantAPI } from '../../services/api';

const PlantCard = ({ plant, isUserPlant = false, onWaterPlant, lastWateredAt, wateringInterval }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!plant) {
        return <div className="plant-card error">Ошибка: данные растения не загружены</div>;
    }

    const needsWatering = () => {
        if (!isUserPlant || !lastWateredAt || !wateringInterval) return false;

        const lastWatered = new Date(lastWateredAt);
        const nextWatering = new Date(lastWatered.getTime() + wateringInterval * 24 * 60 * 60 * 1000);
        return new Date() > nextWatering;
    };

    const handleWaterPlant = async () => {
        if (!isUserPlant) return;

        setLoading(true);
        setError('');
        try {
            await userPlantAPI.waterPlant(plant.id);
            if (onWaterPlant) onWaterPlant(plant.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при поливе');
        } finally {
            setLoading(false);
        }
    };

    const getWateringStatus = () => {
        if (!isUserPlant) return null;

        if (needsWatering()) {
            return <span className="watering-needed">⚠️ Требуется полив!</span>;
        }

        const lastWatered = new Date(lastWateredAt);
        const nextWatering = new Date(lastWatered.getTime() + wateringInterval * 24 * 60 * 60 * 1000);
        const daysLeft = Math.ceil((nextWatering - new Date()) / (1000 * 60 * 60 * 24));

        return <span className="watering-ok">Полить через: {daysLeft} дн.</span>;
    };

    return (
        <div className={`plant-card ${needsWatering() ? 'needs-watering' : ''}`}>
            {plant.image_url && (
                <img src={plant.image_url} alt={plant.name} className="plant-image" />
            )}
            <div className="plant-info">
                <h3>{plant.custom_name || plant.name}</h3>
                {plant.description && <p>{plant.description}</p>}
                <div className="plant-details">
                    <span className="detail">💡 {plant.light_preference === 'sun' ? 'Солнце' : 'Тень'}</span>
                    <span className="detail">💧 Каждые {plant.watering_interval} дней</span>
                    <span className="detail">⚡ {plant.care_difficulty}</span>
                </div>

                {isUserPlant && (
                    <>
                        {getWateringStatus()}
                        <button
                            onClick={handleWaterPlant}
                            disabled={loading}
                            className="water-button"
                        >
                            {loading ? 'Поливаем...' : '💦 Полить'}
                        </button>
                    </>
                )}

                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
};

export default PlantCard;