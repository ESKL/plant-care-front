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

    // Функция для обновления растения
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
            {/* Показываем заголовок и статистику ТОЛЬКО если есть растения */}
            {plants.length > 0 && (
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
            )}

            {plants.length === 0 ? (
                <div className="empty-collection">
                    <div className="empty-collection-illustration">
                        <div className="illustration-container">
                            <div className="empty-collection-image">
                                <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        {/* Градиенты для цветка */}
                                        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#FF6BCB', stopOpacity: 1}} />
                                            <stop offset="100%" style={{stopColor: '#FF3366', stopOpacity: 1}} />
                                        </linearGradient>

                                        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#FFD93D', stopOpacity: 1}} />
                                            <stop offset="100%" style={{stopColor: '#FF6B6B', stopOpacity: 1}} />
                                        </linearGradient>

                                        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#51CF66', stopOpacity: 1}} />
                                            <stop offset="100%" style={{stopColor: '#2B8A3E', stopOpacity: 1}} />
                                        </linearGradient>

                                        <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#795548', stopOpacity: 1}} />
                                            <stop offset="100%" style={{stopColor: '#5D4037', stopOpacity: 1}} />
                                        </linearGradient>

                                        <linearGradient id="soilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#8B6B4B', stopOpacity: 1}} />
                                            <stop offset="100%" style={{stopColor: '#6B4F35', stopOpacity: 1}} />
                                        </linearGradient>

                                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="rgba(0,0,0,0.2)"/>
                                        </filter>

                                        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
                                            <feFlood floodColor="#FFD700" floodOpacity="0.3" result="glow"/>
                                            <feComposite in="glow" in2="blur" operator="in" result="softGlow"/>
                                            <feMerge>
                                                <feMergeNode in="softGlow"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Горшок с тенью */}
                                    <g filter="url(#shadow)">
                                        {/* Основная часть горшка */}
                                        <path d="M80,200 L100,180 L200,180 L220,200 Z" fill="url(#potGradient)" />

                                        {/* Верхняя часть горшка */}
                                        <rect x="90" y="170" width="120" height="10" rx="5" fill="#6D4C41" />

                                        {/* Дно горшка */}
                                        <rect x="100" y="200" width="100" height="10" rx="3" fill="#4E342E" />

                                        {/* Декоративные линии на горшке */}
                                        <line x1="100" y1="185" x2="200" y2="185" stroke="#8D6E63" strokeWidth="2" />
                                        <line x1="105" y1="190" x2="195" y2="190" stroke="#A1887F" strokeWidth="1.5" />
                                    </g>


                                    {/* Стебель */}
                                    <rect x="147" y="100" width="6" height="70" fill="#388E3C" />

                                    {/* Листья */}
                                    <g filter="url(#shadow)">
                                        {/* Левый лист */}
                                        <ellipse cx="120" cy="130" rx="20" ry="12" fill="url(#leafGradient)" transform="rotate(-25 120 130)" />
                                        <path d="M120,130 Q110,135 115,140 Q120,145 125,140 Q130,135 120,130" fill="#1B5E20" opacity="0.3" />

                                        {/* Правый лист */}
                                        <ellipse cx="180" cy="130" rx="20" ry="12" fill="url(#leafGradient)" transform="rotate(25 180 130)" />
                                        <path d="M180,130 Q190,135 185,140 Q180,145 175,140 Q170,135 180,130" fill="#1B5E20" opacity="0.3" />

                                        {/* Верхний лист */}
                                        <ellipse cx="150" cy="120" rx="15" ry="8" fill="url(#leafGradient)" transform="rotate(10 150 120)" />
                                    </g>

                                    {/* Цветок с анимацией свечения */}
                                    <g filter="url(#softGlow)">
                                        {/* Лепестки цветка */}
                                        <circle cx="150" cy="90" r="25" fill="url(#petalGradient)" />

                                        {/* Контур лепестков */}
                                        <circle cx="150" cy="90" r="25" fill="none" stroke="#FF4081" strokeWidth="1" />

                                        {/* Сердцевина цветка */}
                                        <circle cx="150" cy="90" r="12" fill="url(#centerGradient)" />

                                        {/* Тычинки */}
                                        <g>
                                            {Array.from({ length: 8 }).map((_, i) => {
                                                const angle = (i * 45) * Math.PI / 180;
                                                const x1 = 150 + Math.cos(angle) * 12;
                                                const y1 = 90 + Math.sin(angle) * 12;
                                                const x2 = 150 + Math.cos(angle) * 20;
                                                const y2 = 90 + Math.sin(angle) * 20;

                                                return (
                                                    <g key={i}>
                                                        <line
                                                            x1={x1}
                                                            y1={y1}
                                                            x2={x2}
                                                            y2={y2}
                                                            stroke="#FFD700"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                        <circle
                                                            cx={x2}
                                                            cy={y2}
                                                            r="3"
                                                            fill="#FF9800"
                                                        >
                                                            <animate
                                                                attributeName="r"
                                                                values="3;4;3"
                                                                dur="1.5s"
                                                                begin={`${i * 0.1}s`}
                                                                repeatCount="indefinite"
                                                            />
                                                        </circle>
                                                    </g>
                                                );
                                            })}
                                        </g>

                                        {/* Блестки на лепестках */}
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const angle = (i * 72) * Math.PI / 180;
                                            const distance = 15 + (i % 2) * 5;
                                            const x = 150 + Math.cos(angle) * distance;
                                            const y = 90 + Math.sin(angle) * distance;

                                            return (
                                                <circle
                                                    key={i}
                                                    cx={x}
                                                    cy={y}
                                                    r="2"
                                                    fill="#FFFFFF"
                                                    opacity="0.8"
                                                >
                                                    <animate
                                                        attributeName="opacity"
                                                        values="0.3;0.8;0.3"
                                                        dur="2s"
                                                        begin={`${i * 0.3}s`}
                                                        repeatCount="indefinite"
                                                    />
                                                </circle>
                                            );
                                        })}
                                    </g>

                                    {/* Капельки росы с анимацией */}
                                    <g>
                                        <circle cx="130" cy="150" r="2.5" fill="#4FC3F7">
                                            <animate
                                                attributeName="cy"
                                                values="150;148;150"
                                                dur="2s"
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="opacity"
                                                values="0.5;1;0.5"
                                                dur="2s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>

                                        <circle cx="170" cy="155" r="2" fill="#4FC3F7">
                                            <animate
                                                attributeName="cy"
                                                values="155;153;155"
                                                dur="2.5s"
                                                begin="0.5s"
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="opacity"
                                                values="0.5;1;0.5"
                                                dur="2.5s"
                                                begin="0.5s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>

                                        <circle cx="145" cy="160" r="1.5" fill="#4FC3F7">
                                            <animate
                                                attributeName="cy"
                                                values="160;158;160"
                                                dur="3s"
                                                begin="1s"
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="opacity"
                                                values="0.5;1;0.5"
                                                dur="3s"
                                                begin="1s"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </g>

                                    {/* Декоративные элементы вокруг */}
                                    <circle cx="80" cy="100" r="8" fill="#FFB74D" opacity="0.3">
                                        <animate
                                            attributeName="r"
                                            values="8;10;8"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>

                                    <circle cx="220" cy="120" r="6" fill="#BA68C8" opacity="0.3">
                                        <animate
                                            attributeName="r"
                                            values="6;8;6"
                                            dur="4s"
                                            begin="1s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                </svg>
                            </div>
                        </div>
                        <div className="illustration-text">
                            <h3>Коллекция растений пуста</h3>
                            <p>Начните с добавления растений из библиотеки, и мы поможем вам за ними ухаживать</p>
                            <div className="illustration-actions">
                                <button
                                    onClick={() => navigate('/library')}
                                    className="primary-button illustration-button"
                                >
                                    🌿 Перейти в библиотеку растений
                                </button>
                            </div>
                            <div className="illustration-tips">
                                <p className="tip-title">Как начать:</p>
                                <ul className="tips-list">
                                    <li>📚 Перейдите в библиотеку растений</li>
                                    <li>🌱 Выберите понравившиеся растения</li>
                                    <li>➕ Нажмите "Добавить в коллекцию"</li>
                                    <li>💧 Система будет напоминать о поливе</li>
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