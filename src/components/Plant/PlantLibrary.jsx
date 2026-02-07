import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, userPlantAPI } from '../../services/api';
import PlantCard from './PlantCard';

const PlantLibrary = () => {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingPlantId, setAddingPlantId] = useState(null);
    const [customNames, setCustomNames] = useState({}); // Храним имена для каждого растения
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

    if (loading) return <div className="loading">Загрузка библиотеки растений...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="plant-library">
            <h1>Библиотека растений</h1>
            <p className="library-description">
                Выберите растения для добавления в свою коллекцию.
                Система будет напоминать вам о поливе в нужное время.
            </p>

            {(!plants || plants.length === 0) ? (
                <div className="empty-library">
                    <div className="empty-icon">📚</div>
                    <h3>Библиотека растений пуста</h3>
                    <p>Пока нет доступных растений в библиотеке</p>
                </div>
            ) : (
                <div className="plants-grid">
                    {plants.map(plant => (
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
            )}
        </div>
    );
};

export default PlantLibrary;