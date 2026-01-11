/**
 * PCArchitectureVisualContainer Component
 * Requirements: 6.2
 * 
 * Container component that connects PCArchitectureVisual to the build store
 * - Updates visual when components are selected
 * - Highlights current selection step
 */

import React from 'react';
import { PCArchitectureVisual } from './PCArchitectureVisual';
import { useBuildStore } from '../store/buildStore';

export interface PCArchitectureVisualContainerProps {
    highlightCompatibility?: boolean;
}

/**
 * Container component that connects to build store
 * Requirements: 6.2
 */
export const PCArchitectureVisualContainer: React.FC<PCArchitectureVisualContainerProps> = ({
    highlightCompatibility = true
}) => {
    // Connect to build store
    const build = useBuildStore((state) => state.build);
    const currentStep = useBuildStore((state) => state.currentStep);

    return (
        <PCArchitectureVisual
            build={build}
            highlightCompatibility={highlightCompatibility}
            currentStep={currentStep}
        />
    );
};

export default PCArchitectureVisualContainer;
