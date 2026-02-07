import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, plantAPI } from '../../services/api';

const FullStats = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [plants, setPlants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
        fetchFullStats();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);

            if (response.data.role !== 'admin') {
                navigate('/profile');
            }
        } catch (err) {
            console.error('Ошибка проверки прав доступа:', err);
            navigate('/profile');
        }
    };

    const fetchFullStats = async () => {
        try {
            const response = await plantAPI.getAllPlants();
            const plantsData = response.data || [];
            setPlants(plantsData);

            const calculatedStats = calculateFullStats(plantsData);
            setStats(calculatedStats);

        } catch (err) {
            console.error('Ошибка загрузки статистики:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateFullStats = (plants) => {
        if (!plants || plants.length === 0) {
            return {
                total: 0,
                difficulty: { easy: 0, medium: 0, hard: 0 },
                difficultyPercent: { easy: 0, medium: 0, hard: 0 },
                light: { sun: 0, shade: 0 },
                lightPercent: { sun: 0, shade: 0 },
                watering: {
                    frequent: 0,
                    regular: 0,
                    occasional: 0,
                    rare: 0
                },
                wateringPercent: {
                    frequent: 0,
                    regular: 0,
                    occasional: 0,
                    rare: 0
                },
                images: { with: 0, without: 0 },
                imagesPercent: { with: 0, without: 0 },
                averageWatering: 0,
                newestPlant: null,
                oldestPlant: null,
            };
        }

        const stats = {
            total: plants.length,
            difficulty: { easy: 0, medium: 0, hard: 0 },
            light: { sun: 0, shade: 0 },
            watering: { frequent: 0, regular: 0, occasional: 0, rare: 0 },
            images: { with: 0, without: 0 },
            wateringIntervals: [],
        };

        let newestPlant = plants[0];
        let oldestPlant = plants[0];
        let totalWateringInterval = 0;

        plants.forEach(plant => {
            // Сложность ухода
            if (plant.care_difficulty === 'easy') stats.difficulty.easy++;
            else if (plant.care_difficulty === 'medium') stats.difficulty.medium++;
            else if (plant.care_difficulty === 'hard') stats.difficulty.hard++;

            // Освещение
            if (plant.light_preference === 'sun') stats.light.sun++;
            else if (plant.light_preference === 'shade') stats.light.shade++;

            // Частота полива
            const wateringInterval = plant.watering_interval || 0;
            totalWateringInterval += wateringInterval;
            stats.wateringIntervals.push(wateringInterval);

            if (wateringInterval <= 3) stats.watering.frequent++;
            else if (wateringInterval <= 7) stats.watering.regular++;
            else if (wateringInterval <= 14) stats.watering.occasional++;
            else stats.watering.rare++;

            // Изображения
            if (plant.image_url && plant.image_url.trim() !== '') {
                stats.images.with++;
            } else {
                stats.images.without++;
            }

            // Дата добавления (если есть поле created_at)
            if (plant.created_at) {
                const plantDate = new Date(plant.created_at);
                const newestDate = new Date(newestPlant.created_at || 0);
                const oldestDate = new Date(oldestPlant.created_at || Date.now());

                if (plantDate > newestDate) newestPlant = plant;
                if (plantDate < oldestDate) oldestPlant = plant;
            }
        });

        // Рассчитываем проценты
        stats.difficultyPercent = {
            easy: Math.round((stats.difficulty.easy / stats.total) * 100),
            medium: Math.round((stats.difficulty.medium / stats.total) * 100),
            hard: Math.round((stats.difficulty.hard / stats.total) * 100),
        };

        stats.lightPercent = {
            sun: Math.round((stats.light.sun / stats.total) * 100),
            shade: Math.round((stats.light.shade / stats.total) * 100),
        };

        stats.wateringPercent = {
            frequent: Math.round((stats.watering.frequent / stats.total) * 100),
            regular: Math.round((stats.watering.regular / stats.total) * 100),
            occasional: Math.round((stats.watering.occasional / stats.total) * 100),
            rare: Math.round((stats.watering.rare / stats.total) * 100),
        };

        stats.imagesPercent = {
            with: Math.round((stats.images.with / stats.total) * 100),
            without: Math.round((stats.images.without / stats.total) * 100),
        };

        // Средний интервал полива
        stats.averageWatering = Math.round(totalWateringInterval / stats.total);

        // Новейшее и старейшее растение
        stats.newestPlant = newestPlant;
        stats.oldestPlant = oldestPlant;

        // Медианный интервал полива
        const sortedIntervals = [...stats.wateringIntervals].sort((a, b) => a - b);
        const mid = Math.floor(sortedIntervals.length / 2);
        stats.medianWatering = sortedIntervals.length % 2 !== 0
            ? sortedIntervals[mid]
            : Math.round((sortedIntervals[mid - 1] + sortedIntervals[mid]) / 2);

        return stats;
    };

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'easy': return '#2ed573';
            case 'medium': return '#ffa502';
            case 'hard': return '#ff4757';
            default: return '#6c757d';
        }
    };

    const getLightColor = (light) => {
        switch(light) {
            case 'sun': return '#ffd700';
            case 'shade': return '#2d5a27';
            default: return '#6c757d';
        }
    };

    const getWateringColor = (watering) => {
        switch(watering) {
            case 'frequent': return '#4cc9f0';
            case 'regular': return '#4361ee';
            case 'occasional': return '#3a0ca3';
            case 'rare': return '#7209b7';
            default: return '#6c757d';
        }
    };

    const getWateringLabel = (watering) => {
        switch(watering) {
            case 'frequent': return 'Частый (1-3 дня)';
            case 'regular': return 'Регулярный (4-7 дней)';
            case 'occasional': return 'Умеренный (8-14 дней)';
            case 'rare': return 'Редкий (15+ дней)';
            default: return 'Не указано';
        }
    };

    if (loading) return <div className="loading">Загрузка полной статистики...</div>;

    return (
        <div className="full-stats-page">
            <div className="stats-header">
                <button onClick={() => navigate('/admin')} className="back-button">
                    ← Назад к панели
                </button>
                <h1>📊 Полная статистика библиотеки</h1>
                <p className="stats-subtitle">
                    Подробная статистика по всем растениям | Администратор: {user?.username}
                </p>
            </div>

            <div className="refresh-section">
                <button onClick={fetchFullStats} className="refresh-stats-btn">
                    🔄 Обновить статистику
                </button>
                <div className="last-updated">
                    Обновлено: {new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </div>
            </div>

            {/* Общая информация */}
            <div className="stats-section overview-section">
                <h2>📈 Общая информация</h2>
                <div className="overview-cards">
                    <div className="overview-card total-card">
                        <div className="overview-icon">📚</div>
                        <div className="overview-content">
                            <div className="overview-number">{stats?.total || 0}</div>
                            <div className="overview-label">Всего растений</div>
                        </div>
                    </div>

                    <div className="overview-card avg-watering-card">
                        <div className="overview-icon">💧</div>
                        <div className="overview-content">
                            <div className="overview-number">{stats?.averageWatering || 0}</div>
                            <div className="overview-label">Средний интервал полива (дней)</div>
                            <div className="overview-subtext">
                                Медиана: {stats?.medianWatering || 0} дней
                            </div>
                        </div>
                    </div>

                    <div className="overview-card images-card">
                        <div className="overview-icon">🖼️</div>
                        <div className="overview-content">
                            <div className="overview-number">{stats?.images.with || 0}</div>
                            <div className="overview-label">С изображением</div>
                            <div className="overview-subtext">
                                {stats?.imagesPercent.with || 0}% от общего числа
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Сложность ухода */}
            <div className="stats-section difficulty-section">
                <h2>⚡ Сложность ухода</h2>
                <div className="difficulty-stats">
                    {['easy', 'medium', 'hard'].map(difficulty => (
                        <div key={difficulty} className="difficulty-stat-card"
                             style={{ borderLeftColor: getDifficultyColor(difficulty) }}>
                            <div className="difficulty-header">
                                <div className="difficulty-icon">
                                    {difficulty === 'easy' ? '🟢' :
                                        difficulty === 'medium' ? '🟡' : '🔴'}
                                </div>
                                <div className="difficulty-title">
                                    {difficulty === 'easy' ? 'Легкая' :
                                        difficulty === 'medium' ? 'Средняя' : 'Сложная'}
                                </div>
                            </div>
                            <div className="difficulty-numbers">
                                <div className="difficulty-count">
                                    {stats?.difficulty[difficulty] || 0}
                                </div>
                                <div className="difficulty-percent">
                                    {stats?.difficultyPercent[difficulty] || 0}%
                                </div>
                            </div>
                            <div className="difficulty-progress">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${stats?.difficultyPercent[difficulty] || 0}%`,
                                        backgroundColor: getDifficultyColor(difficulty)
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Освещение */}
            <div className="stats-section light-section">
                <h2>💡 Предпочтения по освещению</h2>
                <div className="light-stats">
                    {['sun', 'shade'].map(light => (
                        <div key={light} className="light-stat-card"
                             style={{ borderLeftColor: getLightColor(light) }}>
                            <div className="light-header">
                                <div className="light-icon">
                                    {light === 'sun' ? '☀️' : '🌿'}
                                </div>
                                <div className="light-title">
                                    {light === 'sun' ? 'Солнцелюбивые' : 'Тенелюбивые'}
                                </div>
                            </div>
                            <div className="light-numbers">
                                <div className="light-count">
                                    {stats?.light[light] || 0}
                                </div>
                                <div className="light-percent">
                                    {stats?.lightPercent[light] || 0}%
                                </div>
                            </div>
                            <div className="light-progress">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${stats?.lightPercent[light] || 0}%`,
                                        backgroundColor: getLightColor(light)
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Частота полива */}
            <div className="stats-section watering-section">
                <h2>💧 Частота полива</h2>
                <div className="watering-stats-grid">
                    {['frequent', 'regular', 'occasional', 'rare'].map(watering => (
                        <div key={watering} className="watering-stat-card"
                             style={{ borderColor: getWateringColor(watering) }}>
                            <div className="watering-header">
                                <div className="watering-icon">💧</div>
                                <div className="watering-title">{getWateringLabel(watering)}</div>
                            </div>
                            <div className="watering-numbers">
                                <div className="watering-count">
                                    {stats?.watering[watering] || 0}
                                </div>
                                <div className="watering-percent">
                                    {stats?.wateringPercent[watering] || 0}%
                                </div>
                            </div>
                            <div className="watering-progress">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${stats?.wateringPercent[watering] || 0}%`,
                                        backgroundColor: getWateringColor(watering)
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Изображения */}
            <div className="stats-section images-section">
                <h2>🖼️ Изображения растений</h2>
                <div className="images-stats">
                    <div className="image-stat-card with-image">
                        <div className="image-stat-content">
                            <div className="image-stat-icon">✅</div>
                            <div className="image-stat-info">
                                <div className="image-stat-count">{stats?.images.with || 0}</div>
                                <div className="image-stat-label">С изображением</div>
                                <div className="image-stat-percent">{stats?.imagesPercent.with || 0}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="image-stat-card without-image">
                        <div className="image-stat-content">
                            <div className="image-stat-icon">❌</div>
                            <div className="image-stat-info">
                                <div className="image-stat-count">{stats?.images.without || 0}</div>
                                <div className="image-stat-label">Без изображения</div>
                                <div className="image-stat-percent">{stats?.imagesPercent.without || 0}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Дополнительная информация */}
            <div className="stats-section additional-section">
                <h2>📋 Дополнительная информация</h2>
                <div className="additional-info">
                    <div className="info-card">
                        <h3>Распределение по интервалам полива:</h3>
                        <ul className="info-list">
                            <li>1-3 дня: {stats?.watering.frequent || 0} растений</li>
                            <li>4-7 дней: {stats?.watering.regular || 0} растений</li>
                            <li>8-14 дней: {stats?.watering.occasional || 0} растений</li>
                            <li>15+ дней: {stats?.watering.rare || 0} растений</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3>Самые популярные категории:</h3>
                        <ul className="info-list">
                            <li>Чаще всего: растения со средней сложностью ухода</li>
                            <li>Преобладающее освещение: {stats?.light.sun >= stats?.light.shade ? 'Солнце' : 'Тень'}</li>
                            <li>Частый интервал полива: {stats?.wateringPercent.frequent || 0}% растений</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="stats-footer">
                <p className="stats-note">
                    <strong>Примечание:</strong> Статистика обновляется при каждом посещении страницы.
                    Для актуальных данных нажмите "Обновить статистику".
                </p>
            </div>
        </div>
    );
};

export default FullStats;