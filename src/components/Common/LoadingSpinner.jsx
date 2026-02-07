import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Загрузка...' }) => {
    const sizeClass = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large'
    }[size];

    return (
        <div className="loading-spinner">
            <div className={`spinner ${sizeClass}`}></div>
            {message && <p className="spinner-message">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;