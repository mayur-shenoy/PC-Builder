/**
 * AIExplanationPanel - Displays AI-generated explanations and "Why Not This?" details
 * Requirements: 3.1, 4.1
 */

import React from 'react';
import './AIExplanationPanel.css';

export interface AIExplanationPanelProps {
    explanation: string;
    mode: 'beginner' | 'advanced';
    whyNotExplanation?: string;
    onCloseWhyNot?: () => void;
    isLoading?: boolean;
}

/**
 * AIExplanationPanel displays AI-generated trade-off summaries and "Why Not This?" explanations
 * Requirements: 3.1, 4.1
 */
export const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
    explanation,
    mode,
    whyNotExplanation,
    onCloseWhyNot,
    isLoading = false,
}) => {
    return (
        <div className="ai-explanation-panel">
            <div className="panel-header">
                <span className="ai-icon">🤖</span>
                <h3>{mode === 'beginner' ? 'AI Assistant' : 'AI Analysis'}</h3>
                {isLoading && <span className="loading-indicator">⏳</span>}
            </div>

            <div className="panel-body">
                {/* Loading state */}
                {isLoading ? (
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Analyzing components...</p>
                    </div>
                ) : (
                    <>
                        {/* Main trade-off explanation */}
                        <div className="explanation-content">
                            {formatExplanation(explanation)}
                        </div>

                        {/* "Why Not This?" modal/panel */}
                        {whyNotExplanation && (
                            <div className="why-not-panel">
                                <div className="why-not-header">
                                    <h4>Component Analysis</h4>
                                    {onCloseWhyNot && (
                                        <button
                                            className="close-button"
                                            onClick={onCloseWhyNot}
                                            aria-label="Close explanation"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <div className="why-not-content">
                                    {formatExplanation(whyNotExplanation)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {mode === 'beginner' && !isLoading && (
                <div className="panel-footer">
                    <p className="hint-text">
                        💡 The AI helps you understand trade-offs between options
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * Format explanation text with markdown-like formatting
 */
function formatExplanation(text: string): React.ReactNode {
    // Split by newlines and process each line
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
        if (line.trim() === '') {
            // Empty line - add spacing
            elements.push(<br key={`br-${index}`} />);
        } else if (line.startsWith('**') && line.endsWith('**')) {
            // Bold heading
            const content = line.slice(2, -2);
            elements.push(
                <h4 key={`heading-${index}`} className="explanation-heading">
                    {content}
                </h4>
            );
        } else if (line.startsWith('- ')) {
            // Bullet point
            const content = line.slice(2);
            elements.push(
                <li key={`li-${index}`} className="explanation-list-item">
                    {content}
                </li>
            );
        } else if (line.includes('**')) {
            // Inline bold text
            const parts = line.split('**');
            const formatted = parts.map((part, i) =>
                i % 2 === 1 ? <strong key={`bold-${i}`}>{part}</strong> : part
            );
            elements.push(
                <p key={`p-${index}`} className="explanation-text">
                    {formatted}
                </p>
            );
        } else {
            // Regular text
            elements.push(
                <p key={`p-${index}`} className="explanation-text">
                    {line}
                </p>
            );
        }
    });

    return <div className="formatted-explanation">{elements}</div>;
}
