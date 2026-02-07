import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, adminAPI, userAPI } from '../../services/api';
import EditLibraryPlantModal from './EditLibraryPlantModal';

const ManagePlants = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
        fetchPlants();
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

    const fetchPlants = async () => {
        try {
            const response = await plantAPI.getAllPlants();
            setPlants(response.data || []);
        } catch (err) {
            setError('Ошибка загрузки растений: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleEditPlant = (plant) => {
        setSelectedPlant(plant);
        setShowEditModal(true);
    };

    const handleDeletePlant = (plantId) => {
        setShowDeleteConfirm(plantId);
    };

    const confirmDeletePlant = async () => {
        if (!showDeleteConfirm) return;

        try {
            await adminAPI.deletePlantFromLibrary(showDeleteConfirm);

            // Удаляем растение из локального состояния
            setPlants(prevPlants => prevPlants.filter(plant => plant.id !== showDeleteConfirm));

            // Закрываем модалку подтверждения
            setShowDeleteConfirm(null);

            // Можно показать toast-уведомление об успешном удалении
            alert('Растение успешно удалено из библиотеки');

        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при удалении растения');
            setShowDeleteConfirm(null);
        }
    };

    const handleUpdatePlant = (updatedPlant) => {
        // Обновляем растение в локальном состоянии
        setPlants(prevPlants =>
            prevPlants.map(plant =>
                plant.id === updatedPlant.id ? updatedPlant : plant
            )
        );
        setShowEditModal(false);
    };

    const handleAddNewPlant = () => {
        navigate('/admin/add-plant');
    };

    // Фильтрация растений по поисковому запросу
    const filteredPlants = plants.filter(plant => {
        const searchLower = searchTerm.toLowerCase();
        return (
            plant.name.toLowerCase().includes(searchLower) ||
            (plant.description && plant.description.toLowerCase().includes(searchLower)) ||
            plant.care_difficulty.toLowerCase().includes(searchLower) ||
            plant.light_preference.toLowerCase().includes(searchLower)
        );
    });

    if (loading) return <div className="loading">Загрузка библиотеки растений...</div>;

    return (
        <div className="manage-plants-page">
            <div className="admin-header">
                <h1>🌿 Управление библиотекой растений</h1>
                <p className="admin-subtitle">
                    Всего растений в библиотеке: <strong>{plants.length}</strong>
                    {user && <span> | Администратор: {user.username}</span>}
                </p>
            </div>

            <div className="manage-plants-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Поиск растений по названию, описанию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="search-button">🔍</button>
                </div>

                <div className="action-buttons">
                    <button onClick={handleAddNewPlant} className="add-button">
                        ➕ Добавить новое растение
                    </button>
                    <button onClick={fetchPlants} className="refresh-button">
                        🔄 Обновить список
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {filteredPlants.length === 0 ? (
                <div className="no-plants">
                    <div className="no-plants-icon">📚</div>
                    <h3>Растения не найдены</h3>
                    <p>
                        {searchTerm
                            ? 'По вашему запросу ничего не найдено. Попробуйте другой запрос.'
                            : 'В библиотеке пока нет растений.'}
                    </p>
                    <button onClick={handleAddNewPlant} className="primary-button">
                        ➕ Добавить первое растение
                    </button>
                </div>
            ) : (
                <div className="plants-management-table">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Изображение</th>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Освещение</th>
                            <th>Полив (дней)</th>
                            <th>Сложность</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPlants.map(plant => (
                            <tr key={plant.id}>
                                <td className="plant-id">{plant.id}</td>
                                <td className="plant-image-cell">
                                    {plant.image_url ? (
                                        <img
                                            src={plant.image_url}
                                            alt={plant.name}
                                            className="plant-thumbnail"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div class="thumbnail-placeholder">🌿</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="thumbnail-placeholder">🌿</div>
                                    )}
                                </td>
                                <td className="plant-name-cell">
                                    <strong>{plant.name}</strong>
                                </td>
                                <td className="plant-description-cell">
                                    {plant.description
                                        ? (plant.description.length > 100
                                            ? `${plant.description.substring(0, 100)}...`
                                            : plant.description)
                                        : <span className="no-description">Нет описания</span>}
                                </td>
                                <td className="plant-light-cell">
                    <span className={`light-badge ${plant.light_preference}`}>
                      {plant.light_preference === 'sun' ? '☀️ Солнце' : '🌿 Тень'}
                    </span>
                                </td>
                                <td className="plant-watering-cell">
                    <span className="watering-badge">
                      💧 {plant.watering_interval} дн.
                    </span>
                                </td>
                                <td className="plant-difficulty-cell">
                    <span className={`difficulty-badge ${plant.care_difficulty}`}>
                      {plant.care_difficulty === 'easy' ? '🟢 Легко' :
                          plant.care_difficulty === 'medium' ? '🟡 Средне' : '🔴 Сложно'}
                    </span>
                                </td>
                                <td className="plant-actions-cell">
                                    <button
                                        onClick={() => handleEditPlant(plant)}
                                        className="action-button edit-button"
                                        title="Редактировать"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlant(plant.id)}
                                        className="action-button delete-button"
                                        title="Удалить"
                                    >
                                        ❌
                                    </button>
                                    <button
                                        onClick={() => navigate(`/plants/${plant.id}`)}
                                        className="action-button view-button"
                                        title="Просмотреть"
                                    >
                                        👁️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модальное окно редактирования */}
            {showEditModal && selectedPlant && (
                <EditLibraryPlantModal
                    plant={selectedPlant}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdatePlant}
                />
            )}

            {/* Модальное окно подтверждения удаления */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>⚠️ Удаление растения</h2>
                            <button onClick={() => setShowDeleteConfirm(null)} className="close-button">&times;</button>
                        </div>

                        <div className="modal-body">
                            <p>Вы уверены, что хотите удалить это растение из библиотеки?</p>
                            <p className="warning-text">
                                Это действие нельзя отменить. Все пользователи, у которых это растение есть в коллекции,
                                потеряют доступ к информации о нем.
                            </p>

                            <div className="modal-actions">
                                <button
                                    onClick={confirmDeletePlant}
                                    className="delete-confirm-button"
                                >
                                    Да, удалить
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="secondary-button"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="management-stats">
                <div className="stat-card">
                    <span className="stat-number">{plants.length}</span>
                    <span className="stat-label">Всего растений</span>
                </div>
                <div className="stat-card">
          <span className="stat-number">
            {plants.filter(p => p.care_difficulty === 'easy').length}
          </span>
                    <span className="stat-label">Легких в уходе</span>
                </div>
                <div className="stat-card">
          <span className="stat-number">
            {plants.filter(p => p.light_preference === 'sun').length}
          </span>
                    <span className="stat-label">Солнцелюбивых</span>
                </div>
                <div className="stat-card">
          <span className="stat-number">
            {plants.filter(p => !p.image_url).length}
          </span>
                    <span className="stat-label">Без изображения</span>
                </div>
            </div>
        </div>
    );
};

export default ManagePlants;