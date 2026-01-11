/**
 * PersistenceWarning Component
 * Displays warning when localStorage is unavailable
 * Requirements: 10.1, 10.2
 */

import React from 'react';
import './PersistenceWarning.css';

export interface PersistenceWarningProps {
    message: string;
    onDismiss: () => void;
}

/**
 * PersistenceWarning displays a dismissible warning about persistence issues
 * Requirements: 10.1, 10.2
 */
export const PersistenceWarning: React.FC<PersistenceWarningProps> = ({
    message,
    onDismiss,
}) => {
    return (
        <div className="persistence-warning">
            <div className="warning-content">
                <span className="warning-icon">⚠️</span>
                <div className="warning-message">
                    <strong>Storage Warning:</strong> {message}
                </div>
                <button
                    className="dismiss-button"
                    onClick={onDismiss}
                    aria-label="Dismiss warning"
                >
                    ×
                </button>
            </div>
        </div>
    );
};
