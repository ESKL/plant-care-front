import React, { useState, useEffect } from 'react';
import { userAPI, plantAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const AdminPanel = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [summaryStats, setSummaryStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
        fetchSummaryStats();
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

    const fetchSummaryStats = async () => {
        try {
            // Получаем все растения из библиотеки
            const response = await plantAPI.getAllPlants();
            const plants = response.data || [];

            // Рассчитываем сводную статистику
            const stats = calculateSummaryStats(plants);
            setSummaryStats(stats);

        } catch (err) {
            console.error('Ошибка загрузки статистики растений:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummaryStats = (plants) => {
        if (!plants || plants.length === 0) {
            return {
                total: 0,
                difficulty: { easy: 0, medium: 0, hard: 0 },
                light: { sun: 0, shade: 0 },
                watering: { frequent: 0, regular: 0, occasional: 0, rare: 0 },
                hasImage: 0,
            };
        }

        const stats = {
            total: plants.length,
            difficulty: { easy: 0, medium: 0, hard: 0 },
            light: { sun: 0, shade: 0 },
            watering: { frequent: 0, regular: 0, occasional: 0, rare: 0 },
            hasImage: 0,
        };

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
            if (wateringInterval <= 3) stats.watering.frequent++;
            else if (wateringInterval <= 7) stats.watering.regular++;
            else if (wateringInterval <= 14) stats.watering.occasional++;
            else stats.watering.rare++;

            // Наличие изображения
            if (plant.image_url && plant.image_url.trim() !== '') {
                stats.hasImage++;
            }
        });

        // Рассчитываем проценты
        stats.difficultyPercent = {
            easy: stats.total > 0 ? Math.round((stats.difficulty.easy / stats.total) * 100) : 0,
            medium: stats.total > 0 ? Math.round((stats.difficulty.medium / stats.total) * 100) : 0,
            hard: stats.total > 0 ? Math.round((stats.difficulty.hard / stats.total) * 100) : 0,
        };

        stats.lightPercent = {
            sun: stats.total > 0 ? Math.round((stats.light.sun / stats.total) * 100) : 0,
            shade: stats.total > 0 ? Math.round((stats.light.shade / stats.total) * 100) : 0,
        };

        stats.hasImagePercent = stats.total > 0 ? Math.round((stats.hasImage / stats.total) * 100) : 0;

        // Определяем преобладающие категории
        stats.predominantDifficulty = stats.difficulty.easy >= stats.difficulty.medium &&
        stats.difficulty.easy >= stats.difficulty.hard ? 'easy' :
            stats.difficulty.medium >= stats.difficulty.hard ? 'medium' : 'hard';

        stats.predominantLight = stats.light.sun >= stats.light.shade ? 'sun' : 'shade';

        const wateringValues = Object.values(stats.watering);
        const maxWatering = Math.max(...wateringValues);
        const predominantWateringKey = Object.keys(stats.watering).find(
            key => stats.watering[key] === maxWatering
        );
        stats.predominantWatering = predominantWateringKey;

        return stats;
    };

    const getDifficultyIcon = (difficulty) => {
        switch(difficulty) {
            case 'easy': return '🟢';
            case 'medium': return '🟡';
            case 'hard': return '🔴';
            default: return '⚪';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch(difficulty) {
            case 'easy': return 'Легкая';
            case 'medium': return 'Средняя';
            case 'hard': return 'Сложная';
            default: return 'Не указана';
        }
    };

    const getLightIcon = (light) => {
        switch(light) {
            case 'sun': return '☀️';
            case 'shade': return '🌿';
            default: return '⚪';
        }
    };

    const getLightText = (light) => {
        switch(light) {
            case 'sun': return 'Солнце';
            case 'shade': return 'Тень';
            default: return 'Не указано';
        }
    };

    const getWateringText = (watering) => {
        switch(watering) {
            case 'frequent': return '1-3 дня';
            case 'regular': return '4-7 дней';
            case 'occasional': return '8-14 дней';
            case 'rare': return '15+ дней';
            default: return 'Не указано';
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="admin-panel-page">
            <div className="admin-header">
                <h1>👑 Административная панель</h1>
                <p className="admin-subtitle">
                    Добро пожаловать, администратор <strong>{user?.username}</strong>
                </p>
            </div>

            {/* Сводная статистика */}
            <div className="summary-section">
                <h2>📊 Сводная статистика библиотеки</h2>
                <div className="summary-cards">
                    {/* Карточка общего количества */}
                    <div className="summary-card total-plants-card">
                        <div className="summary-card-icon">📚</div>
                        <div className="summary-card-content">
                            <div className="summary-card-number">{summaryStats?.total || 0}</div>
                            <div className="summary-card-label">Всего растений в библиотеке</div>
                        </div>
                    </div>

                    {/* Карточка сложности ухода */}
                    <div className="summary-card difficulty-card">
                        <div className="summary-card-icon">⚡</div>
                        <div className="summary-card-content">
                            <div className="summary-card-text">
                                {summaryStats?.predominantDifficulty ? (
                                    <>
                    <span className="difficulty-icon">
                      {getDifficultyIcon(summaryStats.predominantDifficulty)}
                    </span>
                                        <span className="difficulty-text">
                      {getDifficultyText(summaryStats.predominantDifficulty)}
                    </span>
                                    </>
                                ) : 'Нет данных'}
                            </div>
                            <div className="summary-card-label">Преобладающая сложность ухода</div>
                            <div className="summary-card-details">
                                {summaryStats && (
                                    <>
                    <span className="stat-detail">
                      {getDifficultyIcon('easy')} {summaryStats.difficulty.easy}
                    </span>
                                        <span className="stat-detail">
                      {getDifficultyIcon('medium')} {summaryStats.difficulty.medium}
                    </span>
                                        <span className="stat-detail">
                      {getDifficultyIcon('hard')} {summaryStats.difficulty.hard}
                    </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Карточка освещения */}
                    <div className="summary-card light-card">
                        <div className="summary-card-icon">💡</div>
                        <div className="summary-card-content">
                            <div className="summary-card-text">
                                {summaryStats?.predominantLight ? (
                                    <>
                    <span className="light-icon">
                      {getLightIcon(summaryStats.predominantLight)}
                    </span>
                                        <span className="light-text">
                      {getLightText(summaryStats.predominantLight)}
                    </span>
                                    </>
                                ) : 'Нет данных'}
                            </div>
                            <div className="summary-card-label">Преобладающее освещение</div>
                            <div className="summary-card-details">
                                {summaryStats && (
                                    <>
                    <span className="stat-detail">
                      {getLightIcon('sun')} {summaryStats.light.sun}
                    </span>
                                        <span className="stat-detail">
                      {getLightIcon('shade')} {summaryStats.light.shade}
                    </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Карточка изображений */}
                    <div className="summary-card image-card">
                        <div className="summary-card-icon">🖼️</div>
                        <div className="summary-card-content">
                            <div className="summary-card-number">{summaryStats?.hasImage || 0}</div>
                            <div className="summary-card-label">Растений с изображением</div>
                            <div className="summary-card-percent">
                                {summaryStats?.hasImagePercent || 0}% от общего числа
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Быстрые действия */}
            <div className="quick-actions-section">
                <h2>🚀 Быстрые действия</h2>
                <div className="quick-actions-grid">
                    <Link to="/admin/full-stats" className="quick-action-button stats-button">
                        <div className="action-icon">📊</div>
                        <div className="action-content">
                            <div className="action-title">Полная статистика</div>
                            <div className="action-description">
                                Подробная статистика по всем растениям в библиотеке
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/add-plant" className="quick-action-button add-button">
                        <div className="action-icon">➕</div>
                        <div className="action-content">
                            <div className="action-title">Добавить растение</div>
                            <div className="action-description">
                                Добавить новое растение в библиотеку
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/manage-plants" className="quick-action-button manage-button">
                        <div className="action-icon">✏️</div>
                        <div className="action-content">
                            <div className="action-title">Управление растениями</div>
                            <div className="action-description">
                                Редактирование и удаление растений
                            </div>
                        </div>
                    </Link>

                    <Link to="/library" className="quick-action-button view-button">
                        <div className="action-icon">👀</div>
                        <div className="action-content">
                            <div className="action-title">Просмотр библиотеки</div>
                            <div className="action-description">
                                Посмотреть библиотеку как пользователь
                            </div>
                        </div>
                    </Link>

                    <button
                        onClick={fetchSummaryStats}
                        className="quick-action-button refresh-button"
                    >
                        <div className="action-icon">🔄</div>
                        <div className="action-content">
                            <div className="action-title">Обновить статистику</div>
                            <div className="action-description">
                                Обновить данные статистики
                            </div>
                        </div>
                    </button>

                    <div className="quick-action-button users-button">
                        <div className="action-icon">👥</div>
                        <div className="action-content">
                            <div className="action-title">Управление пользователями</div>
                            <div className="action-description">
                                <small>Скоро будет доступно</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-footer">
                <div className="last-updated">
                    Статистика обновлена: {new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </div>
                <div className="admin-quick-links">
                    <Link to="/" className="quick-link">🏠 На главную</Link>
                    <Link to="/profile" className="quick-link">👤 Мой профиль</Link>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                        className="quick-link logout-link"
                    >
                        🚪 Выйти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;