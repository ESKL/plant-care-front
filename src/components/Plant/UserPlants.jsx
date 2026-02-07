import React, { useState, useEffect } from 'react';
import { userPlantAPI, plantAPI } from '../../services/api';
import UserPlantCard from './UserPlantCard';
import { useNavigate } from 'react-router-dom';

const UserPlants = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [plantsLibrary, setPlantsLibrary] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlantsLibrary();
    }, []);

    const fetchPlantsLibrary = async () => {
        try {
            const response = await plantAPI.getAllPlants();
            const libraryMap = {};
            response.data.forEach(plant => {
                libraryMap[plant.id] = {
                    ...plant,
                    original_name: plant.name, // Сохраняем оригинальное название
                };
            });
            setPlantsLibrary(libraryMap);
        } catch (err) {
            console.error('Ошибка загрузки библиотеки растений:', err);
        }
    };

    const fetchUserPlants = async () => {
        try {
            const response = await userPlantAPI.getUserPlants();

            const enrichedPlants = (response.data || []).map(userPlant => {
                const libraryPlant = plantsLibrary[userPlant.plant_library_id];

                return {
                    ...userPlant,
                    watering_interval: libraryPlant?.watering_interval || 7,
                    name: libraryPlant?.name || userPlant.name || 'Без названия',
                    original_name: libraryPlant?.name, // Оригинальное название из библиотеки
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

    useEffect(() => {
        if (Object.keys(plantsLibrary).length > 0) {
            fetchUserPlants();
        }
    }, [plantsLibrary]);

    const handleWaterPlant = (plantId, updatedPlant) => {
        setPlants(prevPlants =>
            prevPlants.map(plant => {
                if (plant.id === plantId) {
                    if (updatedPlant) {
                        return updatedPlant;
                    }

                    const now = new Date();
                    return {
                        ...plant,
                        last_watered_at: now.toISOString(),
                        days_until_water: 0,
                    };
                }
                return plant;
            })
        );

        setTimeout(() => {
            refreshPlantData();
        }, 1000);
    };

    // Новая функция для обновления растения
    const handleUpdatePlant = (plantId, updatedPlant) => {
        setPlants(prevPlants =>
            prevPlants.map(plant => {
                if (plant.id === plantId) {
                    return {
                        ...plant,
                        ...updatedPlant,
                    };
                }
                return plant;
            })
        );
    };

    // Функция для удаления растения
    const handleRemovePlant = (plantId) => {
        // Оптимистичное обновление - удаляем сразу из состояния
        setPlants(prevPlants => prevPlants.filter(plant => plant.id !== plantId));

        // Показываем уведомление об успешном удалении (опционально)
        setTimeout(() => {
            // Можно добавить toast-уведомление
            console.log('Растение удалено');
        }, 500);
    };

    const refreshSinglePlant = async (plantId) => {
        try {
            const response = await userPlantAPI.getUserPlants();
            const updatedPlant = response.data?.find(p => p.id === plantId);

            if (updatedPlant) {
                setPlants(prevPlants =>
                    prevPlants.map(plant => {
                        if (plant.id === plantId) {
                            const libraryPlant = plantsLibrary[plant.plant_library_id];
                            return {
                                ...plant,
                                ...updatedPlant,
                                watering_interval: libraryPlant?.watering_interval || plant.watering_interval || 7,
                                name: libraryPlant?.name || plant.name,
                                original_name: libraryPlant?.name,
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

    const refreshPlantData = async () => {
        try {
            const response = await userPlantAPI.getUserPlants();

            const enrichedPlants = (response.data || []).map(userPlant => {
                const libraryPlant = plantsLibrary[userPlant.plant_library_id];

                return {
                    ...userPlant,
                    watering_interval: libraryPlant?.watering_interval || 7,
                    name: libraryPlant?.name || userPlant.name || 'Без названия',
                    original_name: libraryPlant?.name,
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
                    <div className="empty-collection-illustration">
                        <div className="illustration-container">
                            {/* Красивая SVG иллюстрация вместо эмодзи */}
                            <svg className="plant-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="plantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor: '#2d5a27', stopOpacity: 1}} />
                                        <stop offset="100%" style={{stopColor: '#3d8232', stopOpacity: 1}} />
                                    </linearGradient>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(45, 90, 39, 0.2)"/>
                                    </filter>
                                </defs>

                                {/* Горшок */}
                                <rect x="70" y="140" width="60" height="30" rx="5" fill="#8B4513" filter="url(#shadow)"/>
                                <rect x="60" y="130" width="80" height="10" rx="3" fill="#A0522D"/>

                                {/* Почва */}
                                <ellipse cx="100" cy="130" rx="40" ry="10" fill="#8B7355"/>

                                {/* Стебель */}
                                <rect x="97" y="80" width="6" height="50" fill="#2d5a27"/>

                                {/* Листья */}
                                <ellipse cx="70" cy="90" rx="20" ry="15" fill="url(#plantGradient)" transform="rotate(-30 70 90)"/>
                                <ellipse cx="130" cy="90" rx="20" ry="15" fill="url(#plantGradient)" transform="rotate(30 130 90)"/>
                                <ellipse cx="100" cy="70" rx="25" ry="20" fill="url(#plantGradient)"/>

                                {/* Цветок */}
                                <circle cx="100" cy="60" r="8" fill="#FFD700"/>
                                <ellipse cx="100" cy="60" rx="15" ry="8" fill="#FF6B6B" transform="rotate(0 100 60)"/>
                                <ellipse cx="100" cy="60" rx="15" ry="8" fill="#FF6B6B" transform="rotate(45 100 60)"/>
                                <ellipse cx="100" cy="60" rx="15" ry="8" fill="#FF6B6B" transform="rotate(90 100 60)"/>
                                <ellipse cx="100" cy="60" rx="15" ry="8" fill="#FF6B6B" transform="rotate(135 100 60)"/>

                                {/* Капельки воды (анимация) */}
                                <circle cx="85" cy="120" r="3" fill="#4cc9f0">
                                    <animate attributeName="cy" from="120" to="115" dur="1.5s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" from="1" to="0.3" dur="1.5s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="115" cy="125" r="2.5" fill="#4cc9f0">
                                    <animate attributeName="cy" from="125" to="120" dur="1.8s" repeatCount="indefinite" begin="0.3s"/>
                                    <animate attributeName="opacity" from="1" to="0.3" dur="1.8s" repeatCount="indefinite" begin="0.3s"/>
                                </circle>
                            </svg>
                        </div>
                        <div className="illustration-text">
                            <h3>Коллекция пуста</h3>
                            <p>Добавьте растения из библиотеки, чтобы начать за ними ухаживать</p>
                            <div className="illustration-actions">
                                <button
                                    onClick={() => navigate('/library')}
                                    className="primary-button illustration-button"
                                >
                                    🌿 Перейти в библиотеку
                                </button>
                                <button
                                    onClick={() => navigate('/plants')}
                                    className="secondary-button illustration-button"
                                >
                                    📚 Просмотреть все растения
                                </button>
                            </div>
                            <div className="illustration-tips">
                                <p className="tip-title">Советы для начала:</p>
                                <ul className="tips-list">
                                    <li>🌱 Выберите растения, которые подходят вашему уровню опыта</li>
                                    <li>💡 Обратите внимание на требования к освещению</li>
                                    <li>💧 Учитывайте график полива при выборе растений</li>
                                    <li>🎯 Начните с 2-3 растений и постепенно расширяйте коллекцию</li>
                                </ul>
                            </div>
                        </div>
                    </div>
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
                                        onUpdatePlant={handleUpdatePlant}
                                        onRemovePlant={handleRemovePlant}
                                        refreshPlant={() => refreshSinglePlant(plant.id)}
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
                                        onUpdatePlant={handleUpdatePlant}
                                        onRemovePlant={handleRemovePlant}
                                        refreshPlant={() => refreshSinglePlant(plant.id)}
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