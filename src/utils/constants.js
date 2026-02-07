// Константы для приложения
export const API_BASE_URL = 'http://localhost:8080/api';

export const LIGHT_PREFERENCES = {
    sun: '☀️ Солнце',
    shade: '🌿 Тень'
};

export const CARE_DIFFICULTIES = {
    easy: '🟢 Легкий',
    medium: '🟡 Средний',
    hard: '🔴 Сложный'
};

export const WATERING_STATUS = {
    NEEDS_WATER: 'Требуется полив',
    OK: 'Полив не требуется',
    SOON: 'Скоро потребуется полив'
};

// Интервал опроса уведомлений (в миллисекундах)
export const NOTIFICATION_POLL_INTERVAL = 60000;

// Интервал обновления статуса растений (в миллисекундах)
export const PLANT_STATUS_UPDATE_INTERVAL = 30000;