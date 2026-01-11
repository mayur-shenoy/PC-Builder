/**
 * ComponentSelectorContainer - Integrates ComponentSelector with store and compatibility engine
 * Requirements: 2.1, 3.1, 4.1, 7.1
 */

import React, { useMemo } from 'react';
import { ComponentType } from '../types/components';
import { ComponentSelectorWithAI } from './ComponentSelectorWithAI';
import { useBuildStore } from '../store/buildStore';
import { getComponentsByType } from '../data/componentStore';

export interface ComponentSelectorContainerProps {
    componentType: ComponentType;
    onComponentSelected?: () => void;
}

/**
 * Container component that fetches compatible components and passes them to ComponentSelector with AI
 * Requirements: 2.1, 3.1, 4.1, 7.1
 */
export const ComponentSelectorContainer: React.FC<ComponentSelectorContainerProps> = ({
    componentType,
    onComponentSelected,
}) => {
    const {
        selectComponent,
        getCompatibleComponents,
        previousStep,
        mode,
        preferences,
        build
    } = useBuildStore();

    // Fetch all components of the specified type
    const allComponents = useMemo(() => {
        return getComponentsByType(componentType);
    }, [componentType]);

    // Filter to only compatible components using the compatibility engine
    // Requirements: 2.1
    // Include preferences and build in dependencies to re-filter when they change
    const compatibleComponents = useMemo(() => {
        console.log('Filtering components for:', componentType);
        console.log('Brand preferences:', preferences?.brandPreferences);
        const filtered = getCompatibleComponents(componentType, allComponents);
        console.log('Filtered components:', filtered.map(c => `${c.name} (${c.manufacturer})`));
        return filtered;
    }, [componentType, allComponents, getCompatibleComponents, preferences?.brandPreferences, build]);

    const handleSelect = (component: any) => {
        selectComponent(componentType, component);
        if (onComponentSelected) {
            onComponentSelected();
        }
    };

    // Handle backtracking when no compatible components exist
    // Requirements: 2.1 - Allow user to backtrack and change selections
    const handleBacktrack = () => {
        previousStep();
    };

    return (
        <ComponentSelectorWithAI
            componentType={componentType}
            options={compatibleComponents}
            onSelect={handleSelect}
            mode={mode}
            onBacktrack={handleBacktrack}
        />
    );
};
