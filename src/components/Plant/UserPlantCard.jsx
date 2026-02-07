import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userPlantAPI } from '../../services/api';

const UserPlantCard = ({ plant, onWaterPlant, onRemovePlant, refreshPlant }) => { // Добавил refreshPlant в пропсы
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [localPlant, setLocalPlant] = useState(null);
    const [justWatered, setJustWatered] = useState(false); // Флаг что только что полили
    const navigate = useNavigate();

    // Инициализируем localPlant при получении пропса
    useEffect(() => {
        if (plant && !localPlant) {
            setLocalPlant(plant);
        }
    }, [plant]);

    const currentPlant = localPlant || plant;

    const getDaysUntilWater = () => {
        if (!currentPlant || currentPlant.days_until_water === undefined || currentPlant.days_until_water === null) {
            return null;
        }
        return currentPlant.days_until_water;
    };

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

        // Если только что полили, показываем особый статус
        if (justWatered && daysUntilWater === 0) {
            return {
                text: 'Полито только что!',
                color: '#2ed573',
                icon: '✅',
                status: 'watered_now'
            };
        }

        if (daysUntilWater === 0) {
            return {
                text: 'Требуется полив сегодня!',
                color: '#ff4757',
                icon: '⚠️',
                status: 'today'
            };
        }

        if (daysUntilWater < 0) {
            const overdueDays = Math.abs(daysUntilWater);
            return {
                text: `Требуется полив! (просрочено на ${overdueDays} дн.)`,
                color: '#ff4757',
                icon: '⚠️',
                status: 'overdue'
            };
        } else if (daysUntilWater === 1) {
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

    const getLastWateredText = () => {
        if (!currentPlant || !currentPlant.last_watered_at) {
            return 'Никогда не поливалось';
        }

        try {
            const lastWatered = new Date(currentPlant.last_watered_at);
            if (isNaN(lastWatered.getTime())) {
                return 'Дата не определена';
            }

            const now = new Date();
            const diffTime = now - lastWatered;
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Только что (менее 5 минут)
            if (diffMinutes < 5) {
                return 'Только что';
            }

            // Недавно (менее часа)
            if (diffMinutes < 60) {
                return `${diffMinutes} минут назад`;
            }

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

    const getNextWateringText = () => {
        const daysUntilWater = getDaysUntilWater();

        if (daysUntilWater === null) {
            return 'Не определено';
        }

        if (justWatered && daysUntilWater === 0) {
            return 'Обновляется...';
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

    const getWateringInterval = () => {
        if (currentPlant && currentPlant.watering_interval) {
            return currentPlant.watering_interval;
        }

        const daysUntilWater = getDaysUntilWater();
        if (daysUntilWater !== null && currentPlant && currentPlant.last_watered_at) {
            try {
                const lastWatered = new Date(currentPlant.last_watered_at);
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
        setJustWatered(true); // Устанавливаем флаг что только что полили

        try {
            await userPlantAPI.waterPlant(currentPlant.id);

            // Оптимистичное обновление - показываем "Полито только что!"
            const now = new Date();
            const updatedPlant = {
                ...currentPlant,
                last_watered_at: now.toISOString(),
                days_until_water: 0, // Показываем 0 дней до полива
            };

            setLocalPlant(updatedPlant);

            // Уведомляем родительский компонент
            if (onWaterPlant) {
                onWaterPlant(currentPlant.id, updatedPlant);
            }

            // Через секунду запрашиваем свежие данные
            if (refreshPlant) {
                setTimeout(() => {
                    refreshPlant();
                    // Сбрасываем флаг "только что полили" после обновления
                    setTimeout(() => {
                        setJustWatered(false);
                    }, 500);
                }, 1000);
            } else {
                // Если нет функции обновления, просто сбрасываем флаг через 3 секунды
                setTimeout(() => {
                    setJustWatered(false);
                }, 3000);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при поливе');
            setJustWatered(false); // Сбрасываем флаг при ошибке
            setLoading(false);
        }
    };

    const handleRemovePlant = async () => {
        if (!window.confirm(`Удалить "${currentPlant.custom_name || currentPlant.name}" из коллекции?`)) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (onRemovePlant) {
                onRemovePlant(currentPlant.id);
            }
        } catch (err) {
            setError('Ошибка при удалении растения');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const handleViewDetails = () => {
        if (currentPlant && currentPlant.plant_library_id) {
            navigate(`/plants/${currentPlant.plant_library_id}`);
        }
    };

    const wateringInfo = getWateringInfo();
    const daysUntilWater = getDaysUntilWater();
    const isNeedsWatering = daysUntilWater !== null && daysUntilWater <= 0 && !justWatered;

    return (
        <div className={`user-plant-card ${isNeedsWatering ? 'needs-watering' : ''} ${justWatered ? 'just-watered' : ''}`}>
            <div className="plant-card-header">
                <div className="watering-icon">{wateringInfo.icon}</div>
                {isNeedsWatering && !justWatered && (
                    <div className="watering-alert">⚠️ Требуется полив!</div>
                )}
                {justWatered && (
                    <div className="watering-success">✅ Полито!</div>
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
                {currentPlant && currentPlant.image_url ? (
                    <img
                        src={currentPlant.image_url}
                        alt={currentPlant.custom_name || currentPlant.name || 'Растение'}
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
                {isNeedsWatering && !justWatered && (
                    <div className="watering-indicator">💧</div>
                )}
                {justWatered && (
                    <div className="watering-success-indicator">✅</div>
                )}
            </div>

            <div className="plant-card-body">
                <h3
                    className="plant-name"
                    onClick={handleViewDetails}
                    style={{ cursor: 'pointer' }}
                >
                    {currentPlant ? (currentPlant.custom_name || currentPlant.name || 'Без названия') : 'Растение'}
                </h3>

                {currentPlant && currentPlant.custom_name && currentPlant.name && (
                    <p className="plant-original-name">
                        ({currentPlant.name})
                    </p>
                )}

                <div className="watering-info-card">
                    <div className="watering-status" style={{ color: wateringInfo.color }}>
                        {wateringInfo.text}
                    </div>

                    {daysUntilWater !== null && (
                        <div className="days-counter" data-status={wateringInfo.status}>
                            <div className="days-number">{Math.abs(daysUntilWater)}</div>
                            <div className="days-label">
                                {justWatered ? 'обновляется...' :
                                    daysUntilWater >= 0 ? 'дней до полива' : 'дней просрочено'}
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

                {currentPlant && (currentPlant.light_preference || currentPlant.care_difficulty) && (
                    <div className="plant-properties">
                        {currentPlant.light_preference && (
                            <div className="property">
                                <span className="property-icon">💡</span>
                                <span className="property-text">
                  {currentPlant.light_preference === 'sun' ? 'Солнце' : 'Тень'}
                </span>
                            </div>
                        )}
                        {currentPlant.care_difficulty && (
                            <div className="property">
                                <span className="property-icon">⚡</span>
                                <span className="property-text">
                  {currentPlant.care_difficulty === 'easy' ? 'Легко' :
                      currentPlant.care_difficulty === 'medium' ? 'Средне' : 'Сложно'}
                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="plant-card-footer">
                    <button
                        onClick={handleWaterPlant}
                        disabled={loading || justWatered}
                        className={`water-button ${isNeedsWatering ? 'urgent' : ''} ${justWatered ? 'watered' : ''}`}
                    >
                        {loading ? '⏳ Поливаем...' :
                            justWatered ? '✅ Полито!' :
                                '💦 Полить сейчас'}
                        {daysUntilWater !== null && daysUntilWater > 0 && !justWatered && (
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

                {currentPlant && currentPlant.created_at && (
                    <div className="plant-added-date">
                        Добавлено: {new Date(currentPlant.created_at).toLocaleDateString('ru-RU')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPlantCard;