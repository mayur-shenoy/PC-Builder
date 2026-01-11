/**
 * AIExplanationPanel tests
 * Requirements: 3.1, 4.1
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIExplanationPanel } from './AIExplanationPanel';

describe('AIExplanationPanel', () => {
    it('renders with basic explanation', () => {
        render(
            <AIExplanationPanel
                explanation="Test explanation"
                mode="beginner"
            />
        );

        expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();
        expect(screen.getByText(/Test explanation/i)).toBeInTheDocument();
    });

    it('renders with why not explanation', () => {
        render(
            <AIExplanationPanel
                explanation="Main explanation"
                mode="advanced"
                whyNotExplanation="Why not explanation"
                onCloseWhyNot={() => { }}
            />
        );

        expect(screen.getByText(/Component Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Why not explanation/i)).toBeInTheDocument();
    });

    it('shows hint text in beginner mode', () => {
        render(
            <AIExplanationPanel
                explanation="Test"
                mode="beginner"
            />
        );

        expect(screen.getByText(/AI helps you understand trade-offs/i)).toBeInTheDocument();
    });

    it('does not show hint text in advanced mode', () => {
        render(
            <AIExplanationPanel
                explanation="Test"
                mode="advanced"
            />
        );

        expect(screen.queryByText(/AI helps you understand trade-offs/i)).not.toBeInTheDocument();
    });
});
