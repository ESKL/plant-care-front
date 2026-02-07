import React, { useState, useEffect } from 'react';
import { userPlantAPI } from '../../services/api';
import UserPlantCard from './UserPlantCard';

const UserPlants = () => {
    const [plants, setPlants] = useState([]); // Начинаем с пустого массива, а не null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserPlants();
    }, []);

    const fetchUserPlants = async () => {
        try {
            const response = await userPlantAPI.getUserPlants();

            // Валидация данных с бэкенда
            const validatedPlants = (response.data || []).map(plant => {
                // Гарантируем, что days_until_water это число
                let daysUntilWater = plant.days_until_water;
                if (typeof daysUntilWater !== 'number' || isNaN(daysUntilWater)) {
                    // Если нет данных, можно попробовать рассчитать
                    daysUntilWater = calculateDaysUntilWater(plant);
                }

                // Гарантируем, что last_watered_at валидная дата
                let lastWateredAt = plant.last_watered_at;
                if (lastWateredAt) {
                    const date = new Date(lastWateredAt);
                    if (isNaN(date.getTime())) {
                        lastWateredAt = null;
                    }
                }

                return {
                    ...plant,
                    days_until_water: daysUntilWater,
                    last_watered_at: lastWateredAt
                };
            });

            setPlants(validatedPlants);
        } catch (err) {
            setError('Ошибка загрузки ваших растений: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysUntilWater = (plant) => {
        if (!plant || !plant.last_watered_at || !plant.watering_interval) {
            return 0; // по умолчанию требовать полив
        }

        try {
            const lastWatered = new Date(plant.last_watered_at);
            const now = new Date();
            const daysSinceWatered = Math.floor((now - lastWatered) / (1000 * 60 * 60 * 24));
            const daysUntilWater = plant.watering_interval - daysSinceWatered;

            return Math.max(daysUntilWater, -7); // ограничиваем просрочку -7 днями
        } catch (err) {
            return 0;
        }
    };

    const handleWaterPlant = (plantId) => {
        setPlants(prevPlants =>
            prevPlants.map(plant =>
                plant.id === plantId
                    ? { ...plant, last_watered_at: new Date().toISOString() }
                    : plant
            )
        );
    };

    const handleRemovePlant = (plantId) => {
        setPlants(prevPlants => prevPlants.filter(plant => plant.id !== plantId));
    };

    
    const plantsNeedingWater = plants.filter(plant => {
        const daysUntilWater = plant?.days_until_water;
        return daysUntilWater !== undefined && daysUntilWater <= 0;
    });

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-plants">
            <div className="page-header">
                <h1>Мои растения</h1>
                <div className="plants-stats">
                    <div className="stat-item">
                        <span className="stat-number">{plants ? plants.length : 0}</span>
                        <span className="stat-label">Всего растений</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number urgent">{plantsNeedingWater.length}</span>
                        <span className="stat-label">Требуют полива</span>
                    </div>
                </div>
            </div>

            {!plants || plants.length === 0 ? (
                <div className="empty-collection">
                    <div className="empty-icon">🪴</div>
                    <h3>Коллекция пуста</h3>
                    <p>Добавьте растения из библиотеки, чтобы начать за ними ухаживать</p>
                    <a href="/library" className="primary-button">
                        Перейти в библиотеку
                    </a>
                </div>
            ) : (
                <>
                    {plantsNeedingWater.length > 0 && (
                        <div className="needs-watering-section">
                            <h2>⚠️ Требуют срочного полива ({plantsNeedingWater.length})</h2>
                            <div className="plants-grid urgent">
                                {plantsNeedingWater.map(plant => (
                                    <UserPlantCard
                                        key={plant.id}
                                        plant={plant}
                                        onWaterPlant={handleWaterPlant}
                                        onRemovePlant={handleRemovePlant}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="all-plants-section">
                        <h2>Все растения ({plants.length})</h2>
                        <div className="plants-grid">
                            {plants
                                .filter(plant => !plantsNeedingWater.some(p => p && p.id === plant.id))
                                .map(plant => (
                                    <UserPlantCard
                                        key={plant.id}
                                        plant={plant}
                                        onWaterPlant={handleWaterPlant}
                                        onRemovePlant={handleRemovePlant}
                                    />
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserPlants;