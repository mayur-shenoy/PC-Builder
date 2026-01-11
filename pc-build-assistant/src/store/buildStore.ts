/**
 * Build Store - Zustand state management for PC Build Assistant
 * Requirements: 1.5, 2.5, 5.5, 10.1, 10.2
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Component, ComponentType } from '../types/components';
import { PartialBuild, UserPreferences, BuildMetrics, CompatibilityConstraints } from '../types/build';
import { computeBuildMetrics } from '../services/buildMetrics';
import { filterCompatibleComponents, getCompatibilityConstraints } from '../services/compatibilityEngine';

export interface BuildStore {
    // State
    build: PartialBuild;
    preferences: UserPreferences | null;
    mode: 'beginner' | 'advanced';
    currentStep: ComponentType;
    persistenceError: string | null;

    // Actions
    setPreferences: (prefs: UserPreferences) => void;
    selectComponent: (type: ComponentType, component: Component) => void;
    setMode: (mode: 'beginner' | 'advanced') => void;
    nextStep: () => void;
    previousStep: () => void;
    resetBuild: () => void;
    clearPersistenceError: () => void;

    // Computed state (not persisted, recalculated on load)
    metrics: BuildMetrics | null;

    // Compatibility engine integration
    // Requirements: 2.1, 2.5
    getCompatibleComponents: (componentType: ComponentType, allComponents: Component[]) => Component[];
    getConstraints: () => CompatibilityConstraints;
}

// Component selection order as per Requirements 2.3
const COMPONENT_ORDER: ComponentType[] = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'];

/**
 * Check if localStorage is available
 * Requirements: 10.1, 10.2
 */
function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Custom storage implementation with error handling
 * Requirements: 10.1, 10.2
 */
const createSafeStorage = (): any => {
    const storageAvailable = isLocalStorageAvailable();
    let inMemoryStorage: Record<string, string> = {};

    return {
        getItem: (name: string): string | null => {
            if (storageAvailable) {
                try {
                    return localStorage.getItem(name);
                } catch (error) {
                    console.error('Error reading from localStorage:', error);
                    return inMemoryStorage[name] || null;
                }
            }
            return inMemoryStorage[name] || null;
        },
        setItem: (name: string, value: string): void => {
            if (storageAvailable) {
                try {
                    localStorage.setItem(name, value);
                } catch (error) {
                    console.error('Error writing to localStorage:', error);
                    // Fall back to in-memory storage
                    inMemoryStorage[name] = value;
                    // Notify user about persistence issue
                    if (error instanceof Error && error.name === 'QuotaExceededError') {
                        console.warn('localStorage quota exceeded. Using in-memory storage.');
                    }
                }
            } else {
                inMemoryStorage[name] = value;
            }
        },
        removeItem: (name: string): void => {
            if (storageAvailable) {
                try {
                    localStorage.removeItem(name);
                } catch (error) {
                    console.error('Error removing from localStorage:', error);
                }
            }
            delete inMemoryStorage[name];
        },
    };
};

/**
 * Creates the build store with state management and persistence
 * Requirements: 1.5, 2.5, 5.5, 10.1, 10.2
 */
export const useBuildStore = create<BuildStore>()(
    persist(
        (set, get) => ({
            // Initial state
            build: {},
            preferences: null,
            mode: 'beginner',
            currentStep: 'CPU',
            metrics: null,
            persistenceError: null,

            // Set user preferences
            // Requirements: 1.5
            setPreferences: (prefs: UserPreferences) => {
                set({ preferences: prefs });
            },

            // Select a component and update build state
            // Requirements: 2.5, 5.5
            selectComponent: (type: ComponentType, component: Component) => {
                set((state) => {
                    const newBuild: PartialBuild = { ...state.build };

                    // Handle storage as an array
                    if (type === 'Storage') {
                        if (!newBuild.storage) {
                            newBuild.storage = [];
                        }
                        newBuild.storage = [...newBuild.storage, component];
                    } else {
                        // For other components, directly assign
                        const key = type.toLowerCase();
                        if (key === 'cpu') {
                            newBuild.cpu = component;
                        } else if (key === 'gpu') {
                            newBuild.gpu = component;
                        } else if (key === 'motherboard') {
                            newBuild.motherboard = component;
                        } else if (key === 'ram') {
                            newBuild.ram = component;
                        } else if (key === 'psu') {
                            newBuild.psu = component;
                        }
                    }

                    // Recalculate metrics after component selection
                    // Requirements: 5.5
                    const newMetrics = computeBuildMetrics(newBuild);

                    return {
                        build: newBuild,
                        metrics: newMetrics,
                    };
                });
            },

            // Set UI mode (beginner/advanced)
            setMode: (mode: 'beginner' | 'advanced') => {
                set({ mode });
            },

            // Advance to next component in the selection order
            // Requirements: 2.3
            nextStep: () => {
                set((state) => {
                    const currentIndex = COMPONENT_ORDER.indexOf(state.currentStep);
                    const nextIndex = Math.min(currentIndex + 1, COMPONENT_ORDER.length - 1);
                    return { currentStep: COMPONENT_ORDER[nextIndex] };
                });
            },

            // Go back to previous component in the selection order
            // Requirements: 2.3
            previousStep: () => {
                set((state) => {
                    const currentIndex = COMPONENT_ORDER.indexOf(state.currentStep);
                    const prevIndex = Math.max(currentIndex - 1, 0);
                    return { currentStep: COMPONENT_ORDER[prevIndex] };
                });
            },

            // Reset build to initial state
            resetBuild: () => {
                set({
                    build: {},
                    preferences: null,
                    currentStep: 'CPU',
                    metrics: null,
                });
            },

            // Clear persistence error
            // Requirements: 10.1, 10.2
            clearPersistenceError: () => {
                set({ persistenceError: null });
            },

            // Get compatible components for a given type
            // Requirements: 2.1, 2.5
            getCompatibleComponents: (componentType: ComponentType, allComponents: Component[]) => {
                const state = get();
                const brandPreferences = state.preferences?.brandPreferences;
                return filterCompatibleComponents(componentType, state.build, allComponents, brandPreferences, state.preferences || undefined);
            },

            // Get current compatibility constraints
            // Requirements: 2.5
            getConstraints: () => {
                const state = get();
                return getCompatibilityConstraints(state.build);
            },
        }),
        {
            name: 'pc-build-assistant-storage',
            storage: createSafeStorage(),
            // Only persist essential state, metrics will be recalculated
            partialize: (state): any => ({
                build: state.build,
                preferences: state.preferences,
                mode: state.mode,
                currentStep: state.currentStep,
            }),
            // Rehydrate and recalculate metrics on load
            onRehydrateStorage: () => (state) => {
                if (state && state.build) {
                    state.metrics = computeBuildMetrics(state.build);
                }

                // Check if localStorage is available and warn if not
                if (!isLocalStorageAvailable()) {
                    if (state) {
                        state.persistenceError = 'localStorage is not available. Your build progress will not be saved between sessions.';
                    }
                    console.warn('localStorage is not available. Using in-memory storage only.');
                }
            },
        }
    )
);
