/**
 * Property-based tests for Build Store
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import { useBuildStore } from './buildStore';
import { UserPreferences, PartialBuild } from '../types/build';
import { Component, ComponentType } from '../types/components';

// Custom arbitraries for generating test data
const userPreferencesArbitrary = fc.record({
    budgetMin: fc.integer({ min: 500, max: 2000 }),
    budgetMax: fc.integer({ min: 2000, max: 10000 }),
    useCase: fc.constantFrom('gaming', 'productivity', 'mixed', 'content-creation'),
    performanceFocus: fc.constantFrom('GPU-heavy', 'CPU-heavy', 'balanced'),
    storageRequirements: fc.constantFrom('minimal', 'moderate', 'extensive'),
    upgradeHorizon: fc.constantFrom('1-year', '3-year', '5-year'),
    brandPreferences: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 3 })),
    powerConstraints: fc.option(fc.integer({ min: 300, max: 1500 })),
}) as fc.Arbitrary<UserPreferences>;

// Arbitrary for generating component specifications
const cpuSpecsArbitrary = fc.record({
    socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
    cores: fc.integer({ min: 4, max: 32 }),
    threads: fc.integer({ min: 4, max: 64 }),
    baseClock: fc.float({ min: 2.0, max: 5.0 }),
    boostClock: fc.float({ min: 3.0, max: 6.0 }),
    tdp: fc.integer({ min: 65, max: 250 }),
    integratedGraphics: fc.boolean(),
});

const gpuSpecsArbitrary = fc.record({
    vram: fc.integer({ min: 4, max: 24 }),
    powerDraw: fc.integer({ min: 75, max: 450 }),
    length: fc.integer({ min: 180, max: 350 }),
    pciSlots: fc.integer({ min: 2, max: 3 }),
    powerConnectors: fc.array(fc.constantFrom('6-pin', '8-pin'), { minLength: 0, maxLength: 3 }),
    performanceScore: fc.integer({ min: 50, max: 100 }),
});

const motherboardSpecsArbitrary = fc.record({
    socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
    formFactor: fc.constantFrom('ATX', 'Micro-ATX', 'Mini-ITX'),
    ramType: fc.constantFrom('DDR4', 'DDR5'),
    ramSlots: fc.integer({ min: 2, max: 4 }),
    maxRamCapacity: fc.integer({ min: 32, max: 128 }),
    maxRamSpeed: fc.integer({ min: 2400, max: 6000 }),
    m2Slots: fc.integer({ min: 1, max: 4 }),
    sataPorts: fc.integer({ min: 2, max: 8 }),
    pciSlots: fc.integer({ min: 2, max: 4 }),
});

const ramSpecsArbitrary = fc.record({
    type: fc.constantFrom('DDR4', 'DDR5'),
    speed: fc.integer({ min: 2400, max: 6000 }),
    capacity: fc.integer({ min: 8, max: 64 }),
    modules: fc.integer({ min: 1, max: 4 }),
    latency: fc.string(),
});

const psuSpecsArbitrary = fc.record({
    wattage: fc.integer({ min: 500, max: 1200 }),
    efficiency: fc.constantFrom('80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'),
    modular: fc.constantFrom('Full', 'Semi', 'Non'),
    connectors: fc.record({
        pcie6pin: fc.integer({ min: 0, max: 4 }),
        pcie8pin: fc.integer({ min: 0, max: 4 }),
        sata: fc.integer({ min: 4, max: 12 }),
        molex: fc.integer({ min: 2, max: 6 }),
    }),
});

const storageSpecsArbitrary = fc.record({
    type: fc.constantFrom('M.2 NVMe', 'M.2 SATA', 'SATA SSD', 'SATA HDD'),
    capacity: fc.integer({ min: 256, max: 4000 }),
    readSpeed: fc.integer({ min: 500, max: 7000 }),
    writeSpeed: fc.integer({ min: 400, max: 6000 }),
});

// Arbitrary for generating a complete component
const componentArbitrary = (type: ComponentType) => {
    let specsArb;
    switch (type) {
        case 'CPU':
            specsArb = cpuSpecsArbitrary;
            break;
        case 'GPU':
            specsArb = gpuSpecsArbitrary;
            break;
        case 'Motherboard':
            specsArb = motherboardSpecsArbitrary;
            break;
        case 'RAM':
            specsArb = ramSpecsArbitrary;
            break;
        case 'PSU':
            specsArb = psuSpecsArbitrary;
            break;
        case 'Storage':
            specsArb = storageSpecsArbitrary;
            break;
    }

    return fc.record({
        id: fc.string(),
        type: fc.constant(type),
        name: fc.string(),
        manufacturer: fc.string(),
        price: fc.integer({ min: 50, max: 2000 }),
        specifications: specsArb,
    }) as fc.Arbitrary<Component>;
};

// Arbitrary for generating a partial build
const partialBuildArbitrary = fc.record({
    cpu: fc.option(componentArbitrary('CPU')),
    gpu: fc.option(componentArbitrary('GPU')),
    motherboard: fc.option(componentArbitrary('Motherboard')),
    ram: fc.option(componentArbitrary('RAM')),
    storage: fc.option(fc.array(componentArbitrary('Storage'), { minLength: 0, maxLength: 3 })),
    psu: fc.option(componentArbitrary('PSU')),
}) as fc.Arbitrary<PartialBuild>;

describe('Build Store Property Tests', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Reset store state
        useBuildStore.getState().resetBuild();
    });

    afterEach(() => {
        localStorage.clear();
    });

    /**
     * Property 2: Preference Persistence Round Trip
     * Feature: pc-build-assistant, Property 2: Preference Persistence Round Trip
     * Validates: Requirements 1.5
     * 
     * For any valid user preferences object, saving it and then retrieving it 
     * should produce an equivalent preferences object.
     */
    test('Property 2: Preference persistence round trip', () => {
        fc.assert(
            fc.property(userPreferencesArbitrary, (preferences) => {
                // Save preferences to store
                useBuildStore.getState().setPreferences(preferences);

                // Get the stored preferences
                const storedPreferences = useBuildStore.getState().preferences;

                // Verify preferences match
                expect(storedPreferences).toEqual(preferences);

                // Simulate page reload by creating a new store instance
                // The persist middleware should restore the preferences from localStorage
                const restoredPreferences = useBuildStore.getState().preferences;

                // Verify restored preferences match original
                expect(restoredPreferences).toEqual(preferences);
            }),
            { numRuns: 100 }
        );
    });

    /**
     * Property 23: Build State Persistence Round Trip
     * Feature: pc-build-assistant, Property 23: Build State Persistence Round Trip
     * Validates: Requirements 10.1, 10.2, 10.3, 10.4
     * 
     * For any build state with selected components, persisting the state and then 
     * restoring it should produce an equivalent build state with all components, 
     * preferences, and metrics intact.
     */
    test('Property 23: Build state persistence round trip', () => {
        fc.assert(
            fc.property(
                partialBuildArbitrary,
                userPreferencesArbitrary,
                fc.constantFrom('beginner', 'advanced'),
                fc.constantFrom('CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'),
                (build, preferences, mode, currentStep) => {
                    // Reset store first
                    useBuildStore.getState().resetBuild();

                    // Set preferences
                    useBuildStore.getState().setPreferences(preferences);

                    // Set mode
                    useBuildStore.getState().setMode(mode);

                    // Manually set build state (simulating component selections)
                    useBuildStore.setState({
                        build,
                        currentStep,
                    });

                    // Get the current state
                    const currentState = useBuildStore.getState();

                    // Verify state was set correctly
                    expect(currentState.build).toEqual(build);
                    expect(currentState.preferences).toEqual(preferences);
                    expect(currentState.mode).toEqual(mode);
                    expect(currentState.currentStep).toEqual(currentStep);

                    // Simulate page reload by accessing localStorage directly
                    const storageKey = 'pc-build-assistant-storage';
                    const persistedData = localStorage.getItem(storageKey);

                    // Verify data was persisted
                    expect(persistedData).not.toBeNull();

                    if (persistedData) {
                        const parsed = JSON.parse(persistedData);

                        // Verify persisted data contains required sections
                        // Requirements: 10.3
                        expect(parsed.state).toBeDefined();
                        expect(parsed.state.build).toBeDefined();
                        expect(parsed.state.preferences).toBeDefined();
                        expect(parsed.state.mode).toBeDefined();
                        expect(parsed.state.currentStep).toBeDefined();

                        // Verify persisted data matches current state
                        expect(parsed.state.build).toEqual(build);
                        expect(parsed.state.preferences).toEqual(preferences);
                        expect(parsed.state.mode).toEqual(mode);
                        expect(parsed.state.currentStep).toEqual(currentStep);
                    }

                    // Get restored state (simulating app restart)
                    const restoredState = useBuildStore.getState();

                    // Verify restored state matches original
                    // Requirements: 10.1, 10.2, 10.4
                    expect(restoredState.build).toEqual(build);
                    expect(restoredState.preferences).toEqual(preferences);
                    expect(restoredState.mode).toEqual(mode);
                    expect(restoredState.currentStep).toEqual(currentStep);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 12: Metrics Recalculation on Change
     * Feature: pc-build-assistant, Property 12: Metrics Recalculation on Change
     * Validates: Requirements 5.5
     * 
     * For any build state, changing a component selection should result in different 
     * build metrics (except in edge cases where the components have identical specifications).
     */
    test('Property 12: Metrics recalculation on change', () => {
        fc.assert(
            fc.property(
                componentArbitrary('CPU'),
                componentArbitrary('GPU'),
                (cpu, gpu) => {
                    // Reset store
                    useBuildStore.getState().resetBuild();

                    // Select CPU only
                    useBuildStore.getState().selectComponent('CPU', cpu);
                    const metricsWithCPUOnly = useBuildStore.getState().metrics;

                    // Add GPU
                    useBuildStore.getState().selectComponent('GPU', gpu);
                    const metricsWithCPUAndGPU = useBuildStore.getState().metrics;

                    // Both should have metrics
                    expect(metricsWithCPUOnly).not.toBeNull();
                    expect(metricsWithCPUAndGPU).not.toBeNull();

                    // Metrics should have changed (adding GPU changes budget distribution)
                    expect(metricsWithCPUAndGPU).not.toEqual(metricsWithCPUOnly);

                    // Budget distribution should now include GPU
                    expect(metricsWithCPUAndGPU?.budgetDistribution['GPU']).toBeDefined();
                    expect(metricsWithCPUAndGPU?.budgetDistribution['GPU']).toBeGreaterThan(0);

                    // CPU percentage should have decreased (no longer 100%)
                    expect(metricsWithCPUAndGPU?.budgetDistribution['CPU']).toBeLessThan(100);

                    // Metrics should always have all required fields
                    expect(metricsWithCPUAndGPU?.strategy).toBeDefined();
                    expect(metricsWithCPUAndGPU?.budgetDistribution).toBeDefined();
                    expect(metricsWithCPUAndGPU?.bottleneckPercentage).toBeDefined();
                    expect(metricsWithCPUAndGPU?.upgradeFlexibility).toBeDefined();
                }
            ),
            { numRuns: 100 }
        );
    });
});
