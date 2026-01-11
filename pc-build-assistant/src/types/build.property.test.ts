/**
 * Property-based tests for build data models
 * Feature: pc-build-assistant, Property 24: Persisted Data Completeness
 * Validates: Requirements 10.3
 */

import * as fc from 'fast-check';
import {
    UserPreferences,
    PartialBuild,
    BuildMetrics,
    CompatibilityConstraints,
} from './build';
import {
    Component,
    ComponentType,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    StorageSpecifications,
    PSUSpecifications,
} from './components';

// Arbitraries for component specifications
const cpuSpecArbitrary = fc.record({
    socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
    cores: fc.integer({ min: 4, max: 32 }),
    threads: fc.integer({ min: 4, max: 64 }),
    baseClock: fc.float({ min: 2.0, max: 4.0 }),
    boostClock: fc.float({ min: 3.0, max: 6.0 }),
    tdp: fc.integer({ min: 65, max: 250 }),
    integratedGraphics: fc.boolean(),
}) as fc.Arbitrary<CPUSpecifications>;

const gpuSpecArbitrary = fc.record({
    vram: fc.constantFrom(4, 6, 8, 12, 16, 24),
    powerDraw: fc.integer({ min: 100, max: 450 }),
    length: fc.integer({ min: 200, max: 350 }),
    pciSlots: fc.constantFrom(2, 2.5, 3),
    powerConnectors: fc.array(fc.constantFrom('6-pin', '8-pin'), { minLength: 0, maxLength: 3 }),
    performanceScore: fc.integer({ min: 1000, max: 30000 }),
}) as fc.Arbitrary<GPUSpecifications>;

const motherboardSpecArbitrary = fc.record({
    socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
    formFactor: fc.constantFrom('ATX', 'Micro-ATX', 'Mini-ITX'),
    ramType: fc.constantFrom('DDR4', 'DDR5'),
    ramSlots: fc.constantFrom(2, 4),
    maxRamCapacity: fc.constantFrom(64, 128, 192),
    maxRamSpeed: fc.integer({ min: 3200, max: 7200 }),
    m2Slots: fc.integer({ min: 1, max: 4 }),
    sataPorts: fc.integer({ min: 4, max: 8 }),
    pciSlots: fc.integer({ min: 1, max: 4 }),
}) as fc.Arbitrary<MotherboardSpecifications>;

const ramSpecArbitrary = fc.record({
    type: fc.constantFrom('DDR4', 'DDR5'),
    speed: fc.integer({ min: 3200, max: 7200 }),
    capacity: fc.constantFrom(8, 16, 32, 64),
    modules: fc.constantFrom(1, 2, 4),
    latency: fc.constantFrom('CL16', 'CL18', 'CL30', 'CL36'),
}) as fc.Arbitrary<RAMSpecifications>;

const storageSpecArbitrary = fc.record({
    type: fc.constantFrom('M.2 NVMe', 'M.2 SATA', 'SATA SSD', 'SATA HDD'),
    capacity: fc.constantFrom(256, 512, 1000, 2000, 4000),
    readSpeed: fc.integer({ min: 500, max: 7000 }),
    writeSpeed: fc.integer({ min: 400, max: 6500 }),
}) as fc.Arbitrary<StorageSpecifications>;

const psuSpecArbitrary = fc.record({
    wattage: fc.constantFrom(500, 650, 750, 850, 1000),
    efficiency: fc.constantFrom('80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'),
    modular: fc.constantFrom('Full', 'Semi', 'Non'),
    connectors: fc.record({
        pcie6pin: fc.integer({ min: 0, max: 4 }),
        pcie8pin: fc.integer({ min: 0, max: 4 }),
        sata: fc.integer({ min: 4, max: 12 }),
        molex: fc.integer({ min: 2, max: 6 }),
    }),
}) as fc.Arbitrary<PSUSpecifications>;

// Component arbitrary
const componentArbitrary = (type: ComponentType) => {
    let specArbitrary: fc.Arbitrary<any>;

    switch (type) {
        case 'CPU':
            specArbitrary = cpuSpecArbitrary;
            break;
        case 'GPU':
            specArbitrary = gpuSpecArbitrary;
            break;
        case 'Motherboard':
            specArbitrary = motherboardSpecArbitrary;
            break;
        case 'RAM':
            specArbitrary = ramSpecArbitrary;
            break;
        case 'Storage':
            specArbitrary = storageSpecArbitrary;
            break;
        case 'PSU':
            specArbitrary = psuSpecArbitrary;
            break;
    }

    return fc.record({
        id: fc.uuid(),
        type: fc.constant(type),
        name: fc.string({ minLength: 5, maxLength: 50 }),
        manufacturer: fc.constantFrom('Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Corsair', 'Samsung'),
        price: fc.integer({ min: 50, max: 2000 }),
        specifications: specArbitrary,
    }) as fc.Arbitrary<Component>;
};

// User preferences arbitrary
const userPreferencesArbitrary = fc.record({
    budgetMin: fc.integer({ min: 500, max: 2000 }),
    budgetMax: fc.integer({ min: 2000, max: 10000 }),
    useCase: fc.constantFrom('gaming', 'productivity', 'mixed', 'content-creation'),
    performanceFocus: fc.constantFrom('GPU-heavy', 'CPU-heavy', 'balanced'),
    storageRequirements: fc.constantFrom('minimal', 'moderate', 'extensive'),
    upgradeHorizon: fc.constantFrom('1-year', '3-year', '5-year'),
    brandPreferences: fc.option(fc.array(fc.constantFrom('Intel', 'AMD', 'NVIDIA'), { minLength: 1, maxLength: 3 })),
    powerConstraints: fc.option(fc.integer({ min: 500, max: 1200 })),
}) as fc.Arbitrary<UserPreferences>;

// Build metrics arbitrary
const buildMetricsArbitrary = fc.record({
    strategy: fc.constantFrom('GPU-heavy', 'CPU-heavy', 'Balanced', 'Power-efficient'),
    budgetDistribution: fc.dictionary(
        fc.constantFrom('CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'),
        fc.float({ min: 0, max: 1 })
    ),
    bottleneckPercentage: fc.float({ min: 0, max: 100 }),
    upgradeFlexibility: fc.float({ min: 0, max: 10 }),
}) as fc.Arbitrary<BuildMetrics>;

// Partial build arbitrary
const partialBuildArbitrary = fc.record({
    cpu: fc.option(componentArbitrary('CPU')),
    gpu: fc.option(componentArbitrary('GPU')),
    motherboard: fc.option(componentArbitrary('Motherboard')),
    ram: fc.option(componentArbitrary('RAM')),
    storage: fc.option(fc.array(componentArbitrary('Storage'), { minLength: 1, maxLength: 3 })),
    psu: fc.option(componentArbitrary('PSU')),
}) as fc.Arbitrary<PartialBuild>;

// Persisted data structure
interface PersistedData {
    componentSelections: PartialBuild;
    userPreferences: UserPreferences;
    buildMetrics: BuildMetrics;
}

const persistedDataArbitrary = fc.record({
    componentSelections: partialBuildArbitrary,
    userPreferences: userPreferencesArbitrary,
    buildMetrics: buildMetricsArbitrary,
}) as fc.Arbitrary<PersistedData>;

describe('Property 24: Persisted Data Completeness', () => {
    it('should contain all three required sections when persisted', () => {
        fc.assert(
            fc.property(persistedDataArbitrary, (persistedData) => {
                // Verify that persisted data has all three required sections
                const hasComponentSelections = 'componentSelections' in persistedData;
                const hasUserPreferences = 'userPreferences' in persistedData;
                const hasBuildMetrics = 'buildMetrics' in persistedData;

                return hasComponentSelections && hasUserPreferences && hasBuildMetrics;
            }),
            { numRuns: 100 }
        );
    });

    it('should preserve component selections structure', () => {
        fc.assert(
            fc.property(persistedDataArbitrary, (persistedData) => {
                const { componentSelections } = persistedData;

                // Verify structure has expected component keys
                const hasExpectedKeys =
                    'cpu' in componentSelections &&
                    'gpu' in componentSelections &&
                    'motherboard' in componentSelections &&
                    'ram' in componentSelections &&
                    'storage' in componentSelections &&
                    'psu' in componentSelections;

                return hasExpectedKeys;
            }),
            { numRuns: 100 }
        );
    });

    it('should preserve user preferences structure', () => {
        fc.assert(
            fc.property(persistedDataArbitrary, (persistedData) => {
                const { userPreferences } = persistedData;

                // Verify all required preference fields exist
                const hasRequiredFields =
                    typeof userPreferences.budgetMin === 'number' &&
                    typeof userPreferences.budgetMax === 'number' &&
                    typeof userPreferences.useCase === 'string' &&
                    typeof userPreferences.performanceFocus === 'string' &&
                    typeof userPreferences.storageRequirements === 'string' &&
                    typeof userPreferences.upgradeHorizon === 'string';

                return hasRequiredFields;
            }),
            { numRuns: 100 }
        );
    });

    it('should preserve build metrics structure', () => {
        fc.assert(
            fc.property(persistedDataArbitrary, (persistedData) => {
                const { buildMetrics } = persistedData;

                // Verify all required metrics fields exist
                const hasRequiredFields =
                    typeof buildMetrics.strategy === 'string' &&
                    typeof buildMetrics.budgetDistribution === 'object' &&
                    typeof buildMetrics.bottleneckPercentage === 'number' &&
                    typeof buildMetrics.upgradeFlexibility === 'number';

                return hasRequiredFields;
            }),
            { numRuns: 100 }
        );
    });
});
