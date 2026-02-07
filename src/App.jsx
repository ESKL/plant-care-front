import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from './services/auth';

// Компоненты
import Header from './components/Layout/Header';
import PrivateRoute from './components/Layout/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PlantLibrary from './components/Plant/PlantLibrary';
import PlantDetail from './components/Plant/PlantDetail';
import UserPlants from './components/Plant/UserPlants';
import Profile from './components/Profile/Profile';
import Notifications from './components/Notification/Notifications';
import ProfileEdit from './components/Profile/ProfileEdit';
import LoadingSpinner from './components/Common/LoadingSpinner';
import AdminPanel from './components/Admin/AdminPanel';
import AddPlantForm from './components/Admin/AddPlantForm';
import './App.css';
import AdminRoute from "./components/Layout/AdminRoute";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Имитация загрузки приложения
        const timer = setTimeout(() => {
            setIsAuthenticated(authService.isAuthenticated());
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    if (loading) {
        return <LoadingSpinner size="large" message="Загрузка приложения..." />;
    }

    return (
        <Router>
            <div className="App">
                <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
                <main className="main-content">
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route path="/login" element={
                            !isAuthenticated ? <Login /> : <Navigate to="/my-plants" />
                        } />
                        <Route path="/register" element={
                            !isAuthenticated ? <Register /> : <Navigate to="/my-plants" />
                        } />

                        {/* Перенаправление с корня */}
                        <Route path="/" element={
                            <Navigate to={isAuthenticated ? "/my-plants" : "/login"} />
                        } />

                        {/* Приватные маршруты */}
                        <Route path="/my-plants" element={
                            <PrivateRoute>
                                <UserPlants />
                            </PrivateRoute>
                        } />

                        <Route path="/library" element={
                            <PrivateRoute>
                                <PlantLibrary />
                            </PrivateRoute>
                        } />

                        <Route path="/plants/:id" element={
                            <PrivateRoute>
                                <PlantDetail />
                            </PrivateRoute>
                        } />

                        <Route path="/profile" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />

                        <Route path="/profile/edit" element={
                            <PrivateRoute>
                                <ProfileEdit />
                            </PrivateRoute>
                        } />

                        <Route path="/notifications" element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        } />

                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminPanel />
                            </AdminRoute>
                        } />

                        <Route path="/admin/add-plant" element={
                            <AdminRoute>
                                <AddPlantForm />
                            </AdminRoute>
                        } />

                        {/* 404 страница */}
                        <Route path="*" element={
                            <div className="not-found">
                                <h2>404 - Страница не найдена</h2>
                                <p>Извините, запрашиваемая страница не существует.</p>
                                <a href="/">Вернуться на главную</a>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;