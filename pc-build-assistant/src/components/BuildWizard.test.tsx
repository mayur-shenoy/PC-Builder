/**
 * BuildWizard Component Tests
 * Requirements: 2.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BuildWizard } from './BuildWizard';
import { useBuildStore } from '../store/buildStore';

// Mock the child components
jest.mock('./ComponentSelectorContainer', () => ({
    ComponentSelectorContainer: ({ componentType }: any) => (
        <div data-testid="component-selector">
            <p>Selecting: {componentType}</p>
        </div>
    ),
}));

jest.mock('./BuildMetricsDisplayContainer', () => ({
    BuildMetricsDisplayContainer: () => (
        <div data-testid="metrics-display">Metrics</div>
    ),
}));

jest.mock('./PCArchitectureVisualContainer', () => ({
    PCArchitectureVisualContainer: () => (
        <div data-testid="architecture-visual">Visual</div>
    ),
}));

describe('BuildWizard', () => {
    beforeEach(() => {
        // Reset store before each test
        useBuildStore.getState().resetBuild();
    });

    it('renders with initial step (CPU)', () => {
        render(<BuildWizard mode="beginner" />);

        expect(screen.getByText(/Building Your PC/i)).toBeInTheDocument();
        expect(screen.getByText(/Selecting: CPU/i)).toBeInTheDocument();
        expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();
    });

    it('displays all component steps in order', () => {
        render(<BuildWizard mode="beginner" />);

        const steps = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'];
        steps.forEach((step) => {
            expect(screen.getByText(step)).toBeInTheDocument();
        });
    });

    it('disables back button on first step', () => {
        render(<BuildWizard mode="beginner" />);

        const backButton = screen.getByLabelText(/Go to previous step/i);
        expect(backButton).toBeDisabled();
    });

    it('shows correct title for advanced mode', () => {
        render(<BuildWizard mode="advanced" />);

        expect(screen.getByText(/Component Selection/i)).toBeInTheDocument();
    });

    it('renders child components', () => {
        render(<BuildWizard mode="beginner" />);

        expect(screen.getByTestId('component-selector')).toBeInTheDocument();
        expect(screen.getByTestId('metrics-display')).toBeInTheDocument();
        expect(screen.getByTestId('architecture-visual')).toBeInTheDocument();
    });

    it('displays navigation controls', () => {
        render(<BuildWizard mode="beginner" />);

        expect(screen.getByLabelText(/Go to previous step/i)).toBeInTheDocument();
        expect(screen.getByText(/Next →/i)).toBeInTheDocument();
    });
});
