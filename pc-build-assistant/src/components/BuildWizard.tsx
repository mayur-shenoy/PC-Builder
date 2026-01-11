/**
 * BuildWizard Component
 * Requirements: 2.3, 2.1, 3.1, 5.1, 6.1
 * 
 * Main orchestrator component that manages the step-by-step build process
 * - Manages step-by-step flow: CPU → GPU → Motherboard → RAM → Storage → PSU
 * - Displays current step indicator
 * - Shows back/next navigation
 * - Integrates ComponentSelector, AIExplanationPanel, BuildMetricsDisplay, PCArchitectureVisual
 */

import React from 'react';
import { ComponentType } from '../types/components';
import { useBuildStore } from '../store/buildStore';
import { ComponentSelectorContainer } from './ComponentSelectorContainer';
import { BuildMetricsDisplayContainer } from './BuildMetricsDisplayContainer';
import { PCArchitectureVisualContainer } from './PCArchitectureVisualContainer';
import './BuildWizard.css';

export interface BuildWizardProps {
    mode: 'beginner' | 'advanced';
    onComplete?: () => void;
}

// Component selection order as per Requirements 2.3
const COMPONENT_ORDER: ComponentType[] = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'];

/**
 * BuildWizard orchestrates the step-by-step component selection process
 * Requirements: 2.3
 */
export const BuildWizard: React.FC<BuildWizardProps> = ({ mode, onComplete }) => {
    const { currentStep, nextStep, previousStep, build } = useBuildStore();

    // Get current step index
    const currentStepIndex = COMPONENT_ORDER.indexOf(currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === COMPONENT_ORDER.length - 1;

    // Check if all components are selected
    const isComplete =
        build.cpu !== undefined &&
        build.gpu !== undefined &&
        build.motherboard !== undefined &&
        build.ram !== undefined &&
        build.storage !== undefined &&
        build.storage.length > 0 &&
        build.psu !== undefined;

    // Handle navigation
    // Requirements: 2.3 - Advance to next component type after selection
    const handleNext = () => {
        if (isLastStep && isComplete && onComplete) {
            // Trigger final summary when all components selected
            // Requirements: 2.3, 8.1
            onComplete();
        } else if (!isLastStep && isCurrentComponentSelected()) {
            // Advance to next step only if current component is selected
            nextStep();
        }
    };

    // Requirements: 2.3 - Allow going back to previous steps
    const handleBack = () => {
        if (!isFirstStep) {
            previousStep();
        }
    };

    // Handle component selection
    // Requirements: 2.3 - Advance to next component type after selection
    const handleComponentSelected = () => {
        // Automatically advance to next step after selection
        if (!isLastStep) {
            nextStep();
        }
    };

    // Check if current component is selected
    const isCurrentComponentSelected = () => {
        const key = currentStep.toLowerCase();
        if (key === 'cpu') return build.cpu !== undefined;
        if (key === 'gpu') return build.gpu !== undefined;
        if (key === 'motherboard') return build.motherboard !== undefined;
        if (key === 'ram') return build.ram !== undefined;
        if (key === 'storage') return build.storage !== undefined && build.storage.length > 0;
        if (key === 'psu') return build.psu !== undefined;
        return false;
    };

    return (
        <div className="build-wizard" role="main" aria-label="PC Build Wizard">
            {/* Step Indicator */}
            <div className="step-indicator" role="navigation" aria-label="Build progress">
                <h2 className="step-title" id="wizard-title">
                    {mode === 'beginner' ? 'Building Your PC' : 'Component Selection'}
                </h2>
                <div className="step-progress" role="progressbar" aria-valuenow={currentStepIndex + 1} aria-valuemin={1} aria-valuemax={COMPONENT_ORDER.length} aria-labelledby="wizard-title">
                    {COMPONENT_ORDER.map((step, index) => {
                        const isActive = step === currentStep;
                        const isCompleted = index < currentStepIndex || (index === currentStepIndex && isCurrentComponentSelected());

                        return (
                            <div
                                key={step}
                                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                aria-current={isActive ? 'step' : undefined}
                                aria-label={`Step ${index + 1}: ${step}${isCompleted ? ' - completed' : ''}${isActive ? ' - current' : ''}`}
                            >
                                <div className="step-number" aria-hidden="true">
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="step-label">{step}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="step-counter" aria-live="polite" aria-atomic="true">
                    Step {currentStepIndex + 1} of {COMPONENT_ORDER.length}
                </div>
            </div>

            {/* Top Panel - Build Strategy & Metrics */}
            <div className="wizard-top-panel">
                <section className="metrics-section" aria-label="Build metrics">
                    <BuildMetricsDisplayContainer />
                </section>
            </div>

            {/* Main Content Area */}
            <div className="wizard-content" role="region" aria-label="Component selection area">
                {/* Main Panel - Component Selection with AI */}
                <div className="wizard-main-panel">
                    <ComponentSelectorContainer
                        componentType={currentStep}
                        onComponentSelected={handleComponentSelected}
                    />
                </div>
            </div>

            {/* Bottom Panel - PC Architecture Visual */}
            <div className="wizard-bottom-panel">
                <section className="visual-section" aria-label="PC architecture visualization">
                    <h3 className="section-heading">🖥️ Your Build Architecture</h3>
                    <PCArchitectureVisualContainer highlightCompatibility={true} />
                </section>
            </div>

            {/* Navigation Controls */}
            <nav className="wizard-navigation" aria-label="Wizard navigation">
                <button
                    className="nav-button back-button"
                    onClick={handleBack}
                    disabled={isFirstStep}
                    aria-label="Go to previous step"
                    aria-disabled={isFirstStep}
                >
                    <span aria-hidden="true">←</span> Back
                </button>

                <div className="nav-info" role="status" aria-live="polite">
                    {isCurrentComponentSelected() ? (
                        <span className="selection-status">✓ {currentStep} selected</span>
                    ) : (
                        <span className="selection-status">Select a {currentStep}</span>
                    )}
                </div>

                <button
                    className="nav-button next-button"
                    onClick={handleNext}
                    disabled={!isCurrentComponentSelected()}
                    aria-label={isLastStep && isComplete ? 'View final summary' : 'Go to next step'}
                    aria-disabled={!isCurrentComponentSelected()}
                >
                    {isLastStep && isComplete ? 'Complete Build' : 'Next'} <span aria-hidden="true">→</span>
                </button>
            </nav>
        </div>
    );
};
