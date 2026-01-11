/**
 * Component data store with query functions
 * Requirements: 2.1
 */

import { Component, ComponentType } from '../types';
import { mockCPUs } from './mockCPUs';
import { mockGPUs } from './mockGPUs';
import { mockMotherboards } from './mockMotherboards';
import { mockRAM } from './mockRAM';
import { mockStorage } from './mockStorage';
import { mockPSUs } from './mockPSUs';

// Aggregate all components
const allComponents: Component[] = [
    ...mockCPUs,
    ...mockGPUs,
    ...mockMotherboards,
    ...mockRAM,
    ...mockStorage,
    ...mockPSUs,
];

/**
 * Get all components of a specific type
 * @param type - The component type to filter by
 * @returns Array of components matching the specified type
 */
export function getComponentsByType(type: ComponentType): Component[] {
    return allComponents.filter(component => component.type === type);
}

/**
 * Get a component by its unique ID
 * @param id - The component ID to search for
 * @returns The component if found, undefined otherwise
 */
export function getComponentById(id: string): Component | undefined {
    return allComponents.find(component => component.id === id);
}

/**
 * Get all components
 * @returns Array of all components
 */
export function getAllComponents(): Component[] {
    return [...allComponents];
}

// Export all mock data for direct access if needed
export { mockCPUs, mockGPUs, mockMotherboards, mockRAM, mockStorage, mockPSUs };
