import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, userPlantAPI } from '../../services/api';
import PlantCard from './PlantCard';

const PlantLibrary = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingPlantId, setAddingPlantId] = useState(null);
    const [customNames, setCustomNames] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlants();
    }, []);

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

    // Фильтрация растений по поисковому запросу (как в ManagePlants)
    const filteredPlants = plants.filter(plant => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            (plant.name && plant.name.toLowerCase().includes(searchLower)) ||
            (plant.description && plant.description.toLowerCase().includes(searchLower)) ||
            (plant.scientific_name && plant.scientific_name.toLowerCase().includes(searchLower)) ||
            (plant.care_difficulty && plant.care_difficulty.toLowerCase().includes(searchLower)) ||
            (plant.light_preference && plant.light_preference.toLowerCase().includes(searchLower))
        );
    });

    const handleCustomNameChange = (plantId, value) => {
        setCustomNames(prev => ({
            ...prev,
            [plantId]: value
        }));
    };

    const handleAddToCollection = async (plantId) => {
        setAddingPlantId(plantId);
        try {
            const customName = customNames[plantId] || '';

            await userPlantAPI.addUserPlant({
                plant_library_id: plantId,
                custom_name: customName.trim() || undefined,
                image_url: undefined,
            });

            alert('Растение добавлено в коллекцию!');

            // Очищаем поле ввода для этого растения
            setCustomNames(prev => ({
                ...prev,
                [plantId]: ''
            }));

            // Перенаправляем на страницу моих растений
            navigate('/my-plants');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Ошибка добавления растения';
            setError(errorMessage);
        } finally {
            setAddingPlantId(null);
        }
    };

    // Очистка поиска
    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading) return <div className="loading">Загрузка библиотеки растений...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="plant-library">
            <h1>Библиотека растений</h1>
            <p className="library-description">
                Выберите растения для добавления в свою коллекцию.
                Система будет напоминать вам о поливе в нужное время.
            </p>

            {/* Панель поиска как в ManagePlants */}
            <div className="search-container library-search">
                <input
                    type="text"
                    placeholder="🔍 Поиск растений по названию, описанию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="clear-search-button"
                        title="Очистить поиск"
                    >
                        ✕
                    </button>
                )}

                {/* Информация о результатах поиска */}
                {searchTerm && (
                    <div className="search-results-info">
                        Найдено растений: <strong>{filteredPlants.length}</strong> из {plants.length}
                    </div>
                )}
            </div>

            {(!plants || plants.length === 0) ? (
                <div className="empty-library">
                    <div className="empty-icon">📚</div>
                    <h3>Библиотека растений пуста</h3>
                    <p>Пока нет доступных растений в библиотеке</p>
                </div>
            ) : filteredPlants.length === 0 ? (
                <div className="empty-library">
                    <div className="empty-icon">🔍</div>
                    <h3>Растения не найдены</h3>
                    <p>По запросу "{searchTerm}" ничего не найдено. Попробуйте другой запрос.</p>
                    <button onClick={clearSearch} className="clear-search-action-button">
                        Очистить поиск
                    </button>
                </div>
            ) : (
                <>
                    {searchTerm && (
                        <div className="search-results-header">
                            <h3>Результаты поиска</h3>
                            <p>
                                Найдено <strong>{filteredPlants.length}</strong> растений по запросу "{searchTerm}"
                            </p>
                        </div>
                    )}

                    <div className="plants-grid">
                        {filteredPlants.map(plant => (
                            <div key={plant.id} className="library-plant-item">
                                <PlantCard plant={plant} />

                                <div className="add-to-collection-form">
                                    <input
                                        type="text"
                                        placeholder="Дайте своё имя растению (необязательно)"
                                        value={customNames[plant.id] || ''}
                                        onChange={(e) => handleCustomNameChange(plant.id, e.target.value)}
                                        className="custom-name-input"
                                        disabled={addingPlantId === plant.id}
                                    />
                                    <button
                                        onClick={() => handleAddToCollection(plant.id)}
                                        disabled={addingPlantId === plant.id}
                                        className="add-to-collection-button"
                                    >
                                        {addingPlantId === plant.id ? 'Добавляем...' : '➕ Добавить в коллекцию'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PlantLibrary;