/**
 * LoadingSpinner Component
 * Reusable loading spinner for async operations
 * Requirements: All (UI polish)
 */

import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false,
}) => {
    const spinnerClass = `spinner spinner-${size}`;

    if (fullScreen) {
        return (
            <div className="loading-overlay">
                <div className="loading-container">
                    <div className={spinnerClass} />
                    {message && <p className="loading-message">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="loading-inline">
            <div className={spinnerClass} />
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
};
