/**
 * PreferenceCollector Component
 * Wrapper component that includes mode toggle and PreferenceForm
 * Requirements: 1.2, 1.3
 */

import React, { useState } from 'react';
import { PreferenceForm } from './PreferenceForm';
import { UserPreferences } from '../types/build';
import { useBuildStore } from '../store/buildStore';
import './PreferenceCollector.css';

interface PreferenceCollectorProps {
    onComplete?: () => void;
}

export const PreferenceCollector: React.FC<PreferenceCollectorProps> = ({ onComplete }) => {
    const { mode, setMode, setPreferences } = useBuildStore();

    const handleModeToggle = () => {
        setMode(mode === 'beginner' ? 'advanced' : 'beginner');
    };

    const handleSubmit = (preferences: UserPreferences) => {
        setPreferences(preferences);
        if (onComplete) {
            onComplete();
        }
    };

    return (
        <div className="preference-collector">
            <div className="mode-toggle-container">
                <label className="mode-toggle">
                    <span className={mode === 'beginner' ? 'active' : ''}>Beginner Mode</span>
                    <input
                        type="checkbox"
                        checked={mode === 'advanced'}
                        onChange={handleModeToggle}
                    />
                    <span className="toggle-slider"></span>
                    <span className={mode === 'advanced' ? 'active' : ''}>Advanced Mode</span>
                </label>
                <p className="mode-description">
                    {mode === 'beginner'
                        ? 'Simplified options with guided language for easy PC building'
                        : 'Detailed controls with technical metrics for experienced builders'}
                </p>
            </div>

            <PreferenceForm mode={mode} onSubmit={handleSubmit} />
        </div>
    );
};
