import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для добавления токена
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API для пользовательских растений
export const userPlantAPI = {
    getUserPlants: () => api.get('/my-plants'),
    addUserPlant: (data) => api.post('/my-plants', data),
    waterPlant: (id) => api.post(`/water-plant/${id}`),
};

// notificationAPI
export const notificationAPI = {
    getUnreadNotifications: () => api.get('/notifications/unread').then(response => {
        // Гарантируем, что возвращаем массив
        return {
            ...response,
            data: response.data || []
        };
    }),
    // Можно добавить позже метод для отметки как прочитанных
    // markAsRead: (id) => api.post(`/notifications/${id}/read`),
};

// API для пользователя
export const userAPI = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    deleteProfile: () => api.delete('/profile'),
};

// plantAPI.getAllPlants
export const plantAPI = {
    getAllPlants: () => api.get('/plants').then(response => {
        // Гарантируем, что возвращаем массив
        return {
            ...response,
            data: response.data || []
        };
    }),
    getPlantById: (id) => api.get(`/plants/${id}`).then(response => {
        return {
            ...response,
            data: response.data || null
        };
    }),
};

export const adminAPI = {
    addPlantToLibrary: (data) => api.post('/admin/add-plant', data),
    // Можно добавить другие админские методы позже
};


export default api;
