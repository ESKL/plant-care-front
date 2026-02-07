import React, { useState, useEffect } from 'react';
import { userPlantAPI, plantAPI } from '../../services/api';
import UserPlantCard from './UserPlantCard';

const UserPlants = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [plantsLibrary, setPlantsLibrary] = useState({}); // Кэш растений из библиотеки

    useEffect(() => {
        fetchPlantsLibrary();
    }, []);

    // Загружаем библиотеку растений для получения watering_interval
    const fetchPlantsLibrary = async () => {
        try {
            const response = await plantAPI.getAllPlants();
            const libraryMap = {};
            response.data.forEach(plant => {
                libraryMap[plant.id] = plant;
            });
            setPlantsLibrary(libraryMap);
        } catch (err) {
            console.error('Ошибка загрузки библиотеки растений:', err);
        }
    };

    // Загружаем растения пользователя
    const fetchUserPlants = async () => {
        try {
            const response = await userPlantAPI.getUserPlants();

            // Обогащаем данные пользовательских растений данными из библиотеки
            const enrichedPlants = (response.data || []).map(userPlant => {
                const libraryPlant = plantsLibrary[userPlant.plant_library_id];

                return {
                    ...userPlant,
                    // Добавляем поля из библиотеки
                    watering_interval: libraryPlant?.watering_interval || 7,
                    name: libraryPlant?.name || userPlant.name || 'Без названия',
                    light_preference: libraryPlant?.light_preference,
                    care_difficulty: libraryPlant?.care_difficulty,
                    description: libraryPlant?.description,
                };
            });

            setPlants(enrichedPlants);
        } catch (err) {
            setError('Ошибка загрузки ваших растений: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    // Загружаем растения пользователя после загрузки библиотеки
    useEffect(() => {
        if (Object.keys(plantsLibrary).length > 0) {
            fetchUserPlants();
        }
    }, [plantsLibrary]);

    const handleWaterPlant = (plantId, updatedPlant) => {
        // Сначала оптимистично обновляем
        setPlants(prevPlants =>
            prevPlants.map(plant => {
                if (plant.id === plantId) {
                    if (updatedPlant) {
                        // Используем обновленное растение из UserPlantCard
                        return updatedPlant;
                    }

                    const now = new Date();
                    return {
                        ...plant,
                        last_watered_at: now.toISOString(),
                        days_until_water: 0, // Временно показываем 0
                    };
                }
                return plant;
            })
        );

        // Затем перезагружаем свежие данные с сервера
        setTimeout(() => {
            refreshPlantData();
        }, 1000);
    };

    // Функция для обновления данных конкретного растения
    const refreshSinglePlant = async (plantId) => {
        try {
            // Запрашиваем все растения снова
            const response = await userPlantAPI.getUserPlants();
            const updatedPlant = response.data?.find(p => p.id === plantId);

            if (updatedPlant) {
                // Обновляем только это растение
                setPlants(prevPlants =>
                    prevPlants.map(plant => {
                        if (plant.id === plantId) {
                            const libraryPlant = plantsLibrary[plant.plant_library_id];
                            return {
                                ...plant, // Сохраняем доп. поля
                                ...updatedPlant, // Обновляем серверные поля
                                watering_interval: libraryPlant?.watering_interval || plant.watering_interval || 7,
                                name: libraryPlant?.name || plant.name,
                                light_preference: plant.light_preference,
                                care_difficulty: plant.care_difficulty,
                            };
                        }
                        return plant;
                    })
                );
            }
        } catch (err) {
            console.error('Ошибка обновления растения:', err);
        }
    };

    // Функция для полного обновления всех данных
    const refreshPlantData = async () => {
        try {
            const response = await userPlantAPI.getUserPlants();

            // Обогащаем данные пользовательских растений данными из библиотеки
            const enrichedPlants = (response.data || []).map(userPlant => {
                const libraryPlant = plantsLibrary[userPlant.plant_library_id];

                return {
                    ...userPlant,
                    watering_interval: libraryPlant?.watering_interval || 7,
                    name: libraryPlant?.name || userPlant.name || 'Без названия',
                    light_preference: libraryPlant?.light_preference,
                    care_difficulty: libraryPlant?.care_difficulty,
                    description: libraryPlant?.description,
                };
            });

            setPlants(enrichedPlants);
        } catch (err) {
            console.error('Ошибка обновления данных:', err);
        }
    };

    const handleRemovePlant = (plantId) => {
        setPlants(prevPlants => prevPlants.filter(plant => plant.id !== plantId));
    };

    // Растения, требующие полива (days_until_water <= 0)
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
                        <span className="stat-number">{plants.length}</span>
                        <span className="stat-label">Всего растений</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number urgent">{plantsNeedingWater.length}</span>
                        <span className="stat-label">Требуют полива</span>
                    </div>
                </div>
            </div>

            {plants.length === 0 ? (
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
                                        refreshPlant={() => refreshSinglePlant(plant.id)} // Передаем функцию
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
                                        refreshPlant={() => refreshSinglePlant(plant.id)} // Передаем функцию
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