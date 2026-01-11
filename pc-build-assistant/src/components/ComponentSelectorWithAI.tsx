/**
 * ComponentSelectorWithAI - Enhanced ComponentSelector with AI explanations
 * Requirements: 2.2, 3.1, 3.2, 4.1, 7.1, 2.1 (error handling)
 */

import React, { useState, useMemo } from 'react';
import { Component, ComponentType } from '../types/components';
import { ComponentCard } from './ComponentCard';
import { TradeOffDisplay } from './TradeOffDisplay';
import { ConversationalChat } from './ConversationalChat';
import { useBuildStore } from '../store/buildStore';
import {
    generateWhyNotExplanation,
    answerQuery,
    BuildContext,
} from '../services/aiExplainerWithErrorHandling';
import './ComponentSelector.css';

export interface ComponentSelectorWithAIProps {
    componentType: ComponentType;
    options: Component[];
    onSelect: (component: Component) => void;
    mode: 'beginner' | 'advanced';
    onBacktrack?: () => void;
}

/**
 * ComponentSelectorWithAI displays component options with AI-powered explanations
 * Requirements: 2.2, 3.1, 3.2, 4.1, 7.1, 2.1
 */
export const ComponentSelectorWithAI: React.FC<ComponentSelectorWithAIProps> = ({
    componentType,
    options,
    onSelect,
    mode,
    onBacktrack,
}) => {
    const { build, preferences } = useBuildStore();
    const [selectedForWhyNot, setSelectedForWhyNot] = useState<Component | null>(null);
    const [whyNotExplanation, setWhyNotExplanation] = useState<string>('');

    const [whyNotThinking, setWhyNotThinking] = useState<boolean>(false);

    // Limit to 2-3 options as per Requirements 2.2
    const displayOptions = options.slice(0, 3);

    // Build context for AI explainer
    const context: BuildContext = useMemo(
        () => ({
            currentBuild: build,
            preferences: preferences || {
                budgetMin: 0,
                budgetMax: 10000,
                useCase: 'mixed',
                performanceFocus: 'balanced',
                storageRequirements: 'moderate',
                upgradeHorizon: '3-year',
            },
            mode,
        }),
        [build, preferences, mode]
    );

    // Handle "Why Not This?" click - Requirements 4.1
    const handleWhyNot = async (component: Component) => {
        setSelectedForWhyNot(component);
        setWhyNotThinking(true);

        // Find the first option (typically the recommended one) for comparison
        const selectedComponent = displayOptions[0];

        try {
            const explanation = await generateWhyNotExplanation(
                component,
                selectedComponent,
                context
            );
            setWhyNotExplanation(explanation);
        } finally {
            setWhyNotThinking(false);
        }
    };

    // Handle conversational queries - Requirements 7.1
    const handleQuery = async (query: string): Promise<string> => {
        return await answerQuery(query, build, context.preferences);
    };

    // Close "Why Not" explanation
    const handleCloseWhyNot = () => {
        setSelectedForWhyNot(null);
        setWhyNotExplanation('');
    };

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
        <div className="component-selector-with-ai">
            <h2>Select {componentType}</h2>

            {/* Trade-off comparison display - Requirements 3.2 */}
            <TradeOffDisplay
                components={displayOptions}
                mode={mode}
            />

            {/* Component cards - Requirements 2.2, 4.1 */}
            <div className="component-options">
                {displayOptions.map((component) => (
                    <ComponentCard
                        key={component.id}
                        component={component}
                        onSelect={() => onSelect(component)}
                        mode={mode}
                        onWhyNot={handleWhyNot}
                        whyNotExplanation={
                            selectedForWhyNot?.id === component.id
                                ? whyNotExplanation
                                : undefined
                        }
                        isLoadingWhyNot={selectedForWhyNot?.id === component.id && whyNotThinking}
                    />
                ))}
            </div>

            {/* Conversational Chat - Requirements 7.1 */}
            <div className="chat-section">
                <ConversationalChat
                    onQuery={handleQuery}
                    mode={mode}
                />
            </div>
        </div>
    );
};
