import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userPlantAPI } from '../../services/api';

const UserPlantCard = ({ plant, onWaterPlant, onRemovePlant }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    // Функция для получения количества дней до полива
    const getDaysUntilWater = () => {
        if (!plant || plant.days_until_water === undefined || plant.days_until_water === null) {
            return null;
        }
        return plant.days_until_water;
    };

    // Функция для определения, нужно ли поливать растение
    const needsWatering = () => {
        const daysUntilWater = getDaysUntilWater();
        return daysUntilWater !== null && daysUntilWater <= 0;
    };

    // Функция для получения информации о поливе на основе days_until_water
    const getWateringInfo = () => {
        const daysUntilWater = getDaysUntilWater();

        if (daysUntilWater === null) {
            return {
                text: 'Информация о поливе недоступна',
                color: '#666',
                icon: '❓',
                status: 'unknown'
            };
        }

        if (daysUntilWater <= 0) {
            const overdueDays = Math.abs(daysUntilWater);
            return {
                text: overdueDays === 0
                    ? 'Требуется полив сегодня!'
                    : `Требуется полив! (просрочено на ${overdueDays} дн.)`,
                color: '#ff4757',
                icon: '⚠️',
                status: 'overdue'
            };
        } else if (daysUntilWater <= 1) {
            return {
                text: 'Полить завтра',
                color: '#ffa502',
                icon: '⏳',
                status: 'tomorrow'
            };
        } else if (daysUntilWater <= 3) {
            return {
                text: `Полить через ${daysUntilWater} дн.`,
                color: '#ffa502',
                icon: '⏳',
                status: 'soon'
            };
        } else {
            return {
                text: `Полить через ${daysUntilWater} дн.`,
                color: '#2ed573',
                icon: '✅',
                status: 'ok'
            };
        }
    };

    // Функция для форматирования даты последнего полива
    const getLastWateredText = () => {
        if (!plant || !plant.last_watered_at) {
            return 'Никогда не поливалось';
        }

        try {
            const lastWatered = new Date(plant.last_watered_at);
            if (isNaN(lastWatered.getTime())) {
                return 'Дата не определена';
            }

            const now = new Date();
            const diffTime = now - lastWatered;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Сегодня
            if (lastWatered.toDateString() === now.toDateString()) {
                return `Сегодня в ${lastWatered.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            }

            // Вчера
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastWatered.toDateString() === yesterday.toDateString()) {
                return `Вчера в ${lastWatered.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;
            }

            // Менее недели назад
            if (diffDays < 7) {
                return `${diffDays} дней назад`;
            }

            // Форматируем полную дату
            const options = {
                day: 'numeric',
                month: 'long',
            };

            if (lastWatered.getFullYear() !== now.getFullYear()) {
                options.year = 'numeric';
            }

            return lastWatered.toLocaleDateString('ru-RU', options);
        } catch (err) {
            console.error('Ошибка форматирования даты:', err);
            return 'Ошибка даты';
        }
    };

    // Функция для получения даты следующего полива
    const getNextWateringText = () => {
        const daysUntilWater = getDaysUntilWater();

        if (daysUntilWater === null) {
            return 'Не определено';
        }

        if (daysUntilWater <= 0) {
            return 'Сегодня';
        }

        const nextWateringDate = new Date();
        nextWateringDate.setDate(nextWateringDate.getDate() + daysUntilWater);
        const now = new Date();

        // Завтра
        if (daysUntilWater === 1) {
            return 'Завтра';
        }

        // На этой неделе
        if (daysUntilWater <= 7) {
            const daysOfWeek = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
            return daysOfWeek[nextWateringDate.getDay()];
        }

        // Форматируем дату
        return nextWateringDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    };

    // Функция для получения интервала полива из plant_library (если есть)
    const getWateringInterval = () => {
        if (plant && plant.watering_interval) {
            return plant.watering_interval;
        }

        // Если нет данных, можно рассчитать на основе days_until_water и last_watered_at
        const daysUntilWater = getDaysUntilWater();
        if (daysUntilWater !== null && plant && plant.last_watered_at) {
            try {
                const lastWatered = new Date(plant.last_watered_at);
                const now = new Date();
                const daysSinceWatered = Math.floor((now - lastWatered) / (1000 * 60 * 60 * 24));
                return daysSinceWatered + daysUntilWater;
            } catch (err) {
                return '?';
            }
        }

        return '?';
    };

    const handleWaterPlant = async () => {
        setLoading(true);
        setError('');
        try {
            await userPlantAPI.waterPlant(plant.id);
            if (onWaterPlant) {
                onWaterPlant(plant.id);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при поливе');
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePlant = async () => {
        if (!window.confirm(`Удалить "${plant.custom_name || plant.name}" из коллекции?`)) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Эмуляция удаления, пока нет эндпоинта
            await new Promise(resolve => setTimeout(resolve, 500));
            if (onRemovePlant) {
                onRemovePlant(plant.id);
            }
        } catch (err) {
            setError('Ошибка при удалении растения');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const handleViewDetails = () => {
        if (plant && plant.plant_library_id) {
            navigate(`/plants/${plant.plant_library_id}`);
        }
    };

    const wateringInfo = getWateringInfo();
    const isNeedsWatering = needsWatering();
    const daysUntilWater = getDaysUntilWater();

    return (
        <div className={`user-plant-card ${isNeedsWatering ? 'needs-watering' : ''}`}>
            <div className="plant-card-header">
                {wateringInfo.icon && (
                    <div className="watering-icon">{wateringInfo.icon}</div>
                )}
                {isNeedsWatering && (
                    <div className="watering-alert">⚠️ Требуется полив!</div>
                )}
                <div className="plant-card-actions">
                    <button
                        onClick={handleViewDetails}
                        className="icon-button"
                        title="Подробнее"
                    >
                        🔍
                    </button>
                    <button
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="icon-button"
                        title="Удалить"
                    >
                        ❌
                    </button>
                </div>
            </div>

            <div className="plant-image-container">
                {plant && plant.image_url ? (
                    <img
                        src={plant.image_url}
                        alt={plant.custom_name || plant.name || 'Растение'}
                        className="plant-image"
                        onClick={handleViewDetails}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="plant-image-placeholder">🌿</div>';
                        }}
                    />
                ) : (
                    <div
                        className="plant-image-placeholder"
                        onClick={handleViewDetails}
                    >
                        🌿
                    </div>
                )}
                {isNeedsWatering && (
                    <div className="watering-indicator">💧</div>
                )}
            </div>

            <div className="plant-card-body">
                <h3
                    className="plant-name"
                    onClick={handleViewDetails}
                    style={{ cursor: 'pointer' }}
                >
                    {plant ? (plant.custom_name || plant.name || 'Без названия') : 'Растение'}
                </h3>

                {plant && plant.custom_name && plant.name && (
                    <p className="plant-original-name">
                        ({plant.name})
                    </p>
                )}

                <div className="watering-info-card">
                    <div className="watering-status" style={{ color: wateringInfo.color }}>
                        {wateringInfo.text}
                    </div>

                    {daysUntilWater !== null && (
                        <div className="days-counter">
                            <div className="days-number">{Math.abs(daysUntilWater)}</div>
                            <div className="days-label">
                                {daysUntilWater >= 0 ? 'дней до полива' : 'дней просрочено'}
                            </div>
                        </div>
                    )}

                    <div className="watering-details">
                        <div className="watering-detail">
                            <span className="detail-label">Последний полив:</span>
                            <span className="detail-value">{getLastWateredText()}</span>
                        </div>
                        <div className="watering-detail">
                            <span className="detail-label">Следующий полив:</span>
                            <span className="detail-value">{getNextWateringText()}</span>
                        </div>
                        <div className="watering-detail">
                            <span className="detail-label">Интервал:</span>
                            <span className="detail-value">{getWateringInterval()} дн.</span>
                        </div>
                    </div>
                </div>

                {plant && (plant.light_preference || plant.care_difficulty) && (
                    <div className="plant-properties">
                        {plant.light_preference && (
                            <div className="property">
                                <span className="property-icon">💡</span>
                                <span className="property-text">
                  {plant.light_preference === 'sun' ? 'Солнце' : 'Тень'}
                </span>
                            </div>
                        )}
                        {plant.care_difficulty && (
                            <div className="property">
                                <span className="property-icon">⚡</span>
                                <span className="property-text">
                  {plant.care_difficulty === 'easy' ? 'Легко' :
                      plant.care_difficulty === 'medium' ? 'Средне' : 'Сложно'}
                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="plant-card-footer">
                    <button
                        onClick={handleWaterPlant}
                        disabled={loading}
                        className={`water-button ${isNeedsWatering ? 'urgent' : ''}`}
                    >
                        {loading ? '⏳ Поливаем...' : '💦 Полить сейчас'}
                        {daysUntilWater !== null && daysUntilWater > 0 && (
                            <span className="button-days">({daysUntilWater} дн.)</span>
                        )}
                    </button>
                </div>

                {showConfirm && (
                    <div className="confirm-delete">
                        <p>Удалить растение из коллекции?</p>
                        <div className="confirm-buttons">
                            <button
                                onClick={handleRemovePlant}
                                className="delete-confirm-button"
                                disabled={loading}
                            >
                                {loading ? 'Удаление...' : 'Да, удалить'}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="cancel-button"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                {plant && plant.created_at && (
                    <div className="plant-added-date">
                        Добавлено: {new Date(plant.created_at).toLocaleDateString('ru-RU')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPlantCard;