/**
 * ComponentSelector - Displays 2-3 component options with trade-off indicators
 * Requirements: 2.2, 3.2, 2.1 (error handling)
 */

import React from 'react';
import { Component, ComponentType } from '../types/components';
import { ComponentCard } from './ComponentCard';
import { TradeOffDisplay } from './TradeOffDisplay';
import './ComponentSelector.css';

export interface ComponentSelectorProps {
    componentType: ComponentType;
    options: Component[];
    onSelect: (component: Component) => void;
    mode: 'beginner' | 'advanced';
    onBacktrack?: () => void;
}

/**
 * ComponentSelector displays 2-3 compatible component options with trade-off indicators
 * Requirements: 2.2, 3.2, 2.1
 */
export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
    componentType,
    options,
    onSelect,
    mode,
    onBacktrack,
}) => {
    // Limit to 2-3 options as per Requirements 2.2
    const displayOptions = options.slice(0, 3);

    // Handle no compatible components error
    // Requirements: 2.1 - Display message when no compatible components exist
    if (displayOptions.length === 0) {
        return (
            <div className="component-selector">
                <h2>Select {componentType}</h2>
                <div className="no-options-error">
                    <div className="error-icon">⚠️</div>
                    <h3>No Compatible Components Available</h3>
                    <p className="error-description">
                        {mode === 'beginner'
                            ? `We couldn't find any ${componentType} options that work with your current selections. This might be due to compatibility constraints like socket types, power requirements, or form factors.`
                            : `No ${componentType} components are compatible with the current build configuration. Compatibility constraints (socket, RAM type, PSU wattage, form factor) have filtered out all available options.`}
                    </p>

                    <div className="error-suggestions">
                        <h4>What you can do:</h4>
                        <ul>
                            <li>Go back and change your previous component selections</li>
                            <li>Review the compatibility constraints in your build</li>
                            {mode === 'beginner' && (
                                <li>Try selecting different components that offer more flexibility</li>
                            )}
                        </ul>
                    </div>

                    {onBacktrack && (
                        <button
                            className="backtrack-button"
                            onClick={onBacktrack}
                        >
                            ← Go Back and Change Selections
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="component-selector">
            <h2>Select {componentType}</h2>

            {/* Trade-off comparison display - Requirements 3.2 */}
            <TradeOffDisplay
                components={displayOptions}
                mode={mode}
            />

            {/* Component cards - Requirements 2.2 */}
            <div className="component-options">
                {displayOptions.map((component) => (
                    <ComponentCard
                        key={component.id}
                        component={component}
                        onSelect={() => onSelect(component)}
                        mode={mode}
                    />
                ))}
            </div>
        </div>
    );
};
