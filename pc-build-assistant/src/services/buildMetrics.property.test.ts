/**
 * Property-based tests for Build Metrics
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import {
    computeBuildMetrics,
    classifyBuildStrategy,
    calculateBudgetDistribution,
    estimateBottleneck,
    calculateUpgradeFlexibility,
} from './buildMetrics';
import {
    Component,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    PSUSpecifications,
} from '../types/components';
import { PartialBuild } from '../types/build';

// Custom arbitraries for generating test data (reused from compatibility tests)

const socketArbitrary = fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5');

const cpuArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('CPU' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('Intel', 'AMD'),
    price: fc.integer({ min: 100, max: 1000 }),
    specifications: fc.record({
        socket: socketArbitrary,
        cores: fc.integer({ min: 4, max: 32 }),
        threads: fc.integer({ min: 4, max: 64 }),
        baseClock: fc.float({ min: 2.0, max: 4.0 }),
        boostClock: fc.float({ min: 3.0, max: 6.0 }),
        tdp: fc.integer({ min: 65, max: 250 }),
        integratedGraphics: fc.boolean(),
    }) as fc.Arbitrary<CPUSpecifications>,
});

const gpuArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('GPU' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('NVIDIA', 'AMD'),
    price: fc.integer({ min: 200, max: 2000 }),
    specifications: fc.record({
        vram: fc.integer({ min: 4, max: 24 }),
        powerDraw: fc.integer({ min: 100, max: 450 }),
        length: fc.integer({ min: 180, max: 350 }),
        pciSlots: fc.integer({ min: 2, max: 3 }),
        powerConnectors: fc.array(fc.constantFrom('6-pin', '8-pin'), { minLength: 0, maxLength: 3 }),
        performanceScore: fc.integer({ min: 10, max: 100 }),
    }) as fc.Arbitrary<GPUSpecifications>,
});

const motherboardArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('Motherboard' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('ASUS', 'MSI', 'Gigabyte', 'ASRock'),
    price: fc.integer({ min: 100, max: 500 }),
    specifications: fc.record({
        socket: socketArbitrary,
        formFactor: fc.constantFrom('ATX', 'Micro-ATX', 'Mini-ITX'),
        ramType: fc.constantFrom('DDR4', 'DDR5'),
        ramSlots: fc.integer({ min: 2, max: 4 }),
        maxRamCapacity: fc.integer({ min: 32, max: 128 }),
        maxRamSpeed: fc.integer({ min: 2400, max: 6400 }),
        m2Slots: fc.integer({ min: 1, max: 4 }),
        sataPorts: fc.integer({ min: 4, max: 8 }),
        pciSlots: fc.integer({ min: 2, max: 4 }),
    }) as fc.Arbitrary<MotherboardSpecifications>,
});

const ramArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('RAM' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('Corsair', 'G.Skill', 'Kingston', 'Crucial'),
    price: fc.integer({ min: 50, max: 300 }),
    specifications: fc.record({
        type: fc.constantFrom('DDR4', 'DDR5'),
        speed: fc.integer({ min: 2400, max: 6400 }),
        capacity: fc.integer({ min: 8, max: 64 }),
        modules: fc.integer({ min: 1, max: 4 }),
        latency: fc.string({ minLength: 5, maxLength: 10 }),
    }) as fc.Arbitrary<RAMSpecifications>,
});

const storageArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('Storage' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('Samsung', 'WD', 'Seagate', 'Crucial'),
    price: fc.integer({ min: 50, max: 500 }),
    specifications: fc.record({
        type: fc.constantFrom('M.2 NVMe', 'M.2 SATA', 'SATA SSD', 'SATA HDD'),
        capacity: fc.integer({ min: 256, max: 4000 }),
        readSpeed: fc.integer({ min: 500, max: 7000 }),
        writeSpeed: fc.integer({ min: 500, max: 5000 }),
    }),
});

const psuArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('PSU' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('Corsair', 'EVGA', 'Seasonic', 'Thermaltake'),
    price: fc.integer({ min: 50, max: 300 }),
    specifications: fc.record({
        wattage: fc.integer({ min: 400, max: 1200 }),
        efficiency: fc.constantFrom('80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'),
        modular: fc.constantFrom('Full', 'Semi', 'Non'),
        connectors: fc.record({
            pcie6pin: fc.integer({ min: 0, max: 4 }),
            pcie8pin: fc.integer({ min: 0, max: 4 }),
            sata: fc.integer({ min: 4, max: 12 }),
            molex: fc.integer({ min: 2, max: 6 }),
        }),
    }) as fc.Arbitrary<PSUSpecifications>,
});

// Arbitrary for partial builds with at least one component
const partialBuildWithComponentsArbitrary: fc.Arbitrary<PartialBuild> = fc
    .record({
        cpu: fc.option(cpuArbitrary, { nil: undefined }),
        gpu: fc.option(gpuArbitrary, { nil: undefined }),
        motherboard: fc.option(motherboardArbitrary, { nil: undefined }),
        ram: fc.option(ramArbitrary, { nil: undefined }),
        storage: fc.option(fc.array(storageArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
        psu: fc.option(psuArbitrary, { nil: undefined }),
    })
    .filter((build) => {
        // Ensure at least one component is selected
        return !!(build.cpu || build.gpu || build.motherboard || build.ram || build.psu || (build.storage && build.storage.length > 0));
    });

describe('Build Metrics - Property Tests', () => {
    // Feature: pc-build-assistant, Property 10: Build Metrics Completeness
    // Validates: Requirements 5.1
    describe('Property 10: Build Metrics Completeness', () => {
        test('For any build state with at least one component, computed metrics should contain all required fields', () => {
            fc.assert(
                fc.property(partialBuildWithComponentsArbitrary, (build) => {
                    const metrics = computeBuildMetrics(build);

                    // Verify all required fields are present
                    expect(metrics).toHaveProperty('strategy');
                    expect(metrics).toHaveProperty('budgetDistribution');
                    expect(metrics).toHaveProperty('bottleneckPercentage');
                    expect(metrics).toHaveProperty('upgradeFlexibility');

                    // Verify types
                    expect(typeof metrics.strategy).toBe('string');
                    expect(typeof metrics.budgetDistribution).toBe('object');
                    expect(typeof metrics.bottleneckPercentage).toBe('number');
                    expect(typeof metrics.upgradeFlexibility).toBe('number');

                    // Verify numeric ranges
                    expect(metrics.bottleneckPercentage).toBeGreaterThanOrEqual(0);
                    expect(metrics.bottleneckPercentage).toBeLessThanOrEqual(100);
                    expect(metrics.upgradeFlexibility).toBeGreaterThanOrEqual(0);
                    expect(metrics.upgradeFlexibility).toBeLessThanOrEqual(100);
                }),
                { numRuns: 100 }
            );
        });

        test('For any build with components, budget distribution percentages should sum to approximately 100%', () => {
            fc.assert(
                fc.property(partialBuildWithComponentsArbitrary, (build) => {
                    const distribution = calculateBudgetDistribution(build);

                    if (Object.keys(distribution).length > 0) {
                        const sum = Object.values(distribution).reduce((acc, val) => acc + val, 0);

                        // Should sum to approximately 100% (within floating point tolerance)
                        expect(sum).toBeGreaterThan(99.9);
                        expect(sum).toBeLessThan(100.1);
                    }
                }),
                { numRuns: 100 }
            );
        });

        test('For any build, all budget distribution values should be non-negative percentages', () => {
            fc.assert(
                fc.property(partialBuildWithComponentsArbitrary, (build) => {
                    const distribution = calculateBudgetDistribution(build);

                    Object.values(distribution).forEach((percentage) => {
                        expect(percentage).toBeGreaterThanOrEqual(0);
                        expect(percentage).toBeLessThanOrEqual(100);
                    });
                }),
                { numRuns: 100 }
            );
        });

        test('For any build, bottleneck percentage should be in valid range', () => {
            fc.assert(
                fc.property(partialBuildWithComponentsArbitrary, (build) => {
                    const bottleneck = estimateBottleneck(build);

                    expect(bottleneck).toBeGreaterThanOrEqual(0);
                    expect(bottleneck).toBeLessThanOrEqual(100);
                }),
                { numRuns: 100 }
            );
        });

        test('For any build, upgrade flexibility should be in valid range', () => {
            fc.assert(
                fc.property(partialBuildWithComponentsArbitrary, (build) => {
                    const flexibility = calculateUpgradeFlexibility(build);

                    expect(flexibility).toBeGreaterThanOrEqual(0);
                    expect(flexibility).toBeLessThanOrEqual(100);
                }),
                { numRuns: 100 }
            );
        });
    });

    // Feature: pc-build-assistant, Property 11: Build Strategy Tag Validity
    // Validates: Requirements 5.2
    describe('Property 11: Build Strategy Tag Validity', () => {
        test('For any build state, the assigned strategy tag must be one of the valid values', () => {
            fc.assert(
                fc.property(partialBuildWithComponentsArbitrary, (build) => {
                    const strategy = classifyBuildStrategy(build);

                    const validStrategies = ['GPU-heavy', 'CPU-heavy', 'Balanced', 'Power-efficient'];
                    expect(validStrategies).toContain(strategy);
                }),
                { numRuns: 100 }
            );
        });

        test('For any build where GPU cost > 40% of total, strategy should be GPU-heavy', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 500, max: 2000 }),
                    fc.integer({ min: 100, max: 400 }),
                    (gpuPrice, otherComponentsPrice) => {
                        // Create a build where GPU is > 40% of total cost
                        const totalCost = gpuPrice + otherComponentsPrice;
                        const gpuPercent = (gpuPrice / totalCost) * 100;

                        // Only test when GPU is actually > 40%
                        fc.pre(gpuPercent > 40);

                        const gpu: Component = {
                            id: 'test-gpu',
                            type: 'GPU',
                            name: 'Test GPU',
                            manufacturer: 'NVIDIA',
                            price: gpuPrice,
                            specifications: {
                                vram: 8,
                                powerDraw: 250,
                                length: 280,
                                pciSlots: 2,
                                powerConnectors: ['8-pin'],
                                performanceScore: 50,
                            } as GPUSpecifications,
                        };

                        const cpu: Component = {
                            id: 'test-cpu',
                            type: 'CPU',
                            name: 'Test CPU',
                            manufacturer: 'Intel',
                            price: otherComponentsPrice,
                            specifications: {
                                socket: 'LGA 1700',
                                cores: 8,
                                threads: 16,
                                baseClock: 3.0,
                                boostClock: 4.5,
                                tdp: 125,
                                integratedGraphics: false,
                            } as CPUSpecifications,
                        };

                        const build: PartialBuild = { gpu, cpu };
                        const strategy = classifyBuildStrategy(build);

                        expect(strategy).toBe('GPU-heavy');
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For any build with low power draw (< 200W), strategy should be Power-efficient', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 35, max: 65 }),
                    fc.integer({ min: 50, max: 100 }),
                    (cpuTdp, gpuPowerDraw) => {
                        const totalPower = cpuTdp + gpuPowerDraw;

                        // Only test when total power is < 200W
                        fc.pre(totalPower < 200);

                        const cpu: Component = {
                            id: 'test-cpu',
                            type: 'CPU',
                            name: 'Test CPU',
                            manufacturer: 'Intel',
                            price: 200,
                            specifications: {
                                socket: 'LGA 1700',
                                cores: 4,
                                threads: 8,
                                baseClock: 2.5,
                                boostClock: 3.5,
                                tdp: cpuTdp,
                                integratedGraphics: true,
                            } as CPUSpecifications,
                        };

                        const gpu: Component = {
                            id: 'test-gpu',
                            type: 'GPU',
                            name: 'Test GPU',
                            manufacturer: 'NVIDIA',
                            price: 200,
                            specifications: {
                                vram: 4,
                                powerDraw: gpuPowerDraw,
                                length: 200,
                                pciSlots: 2,
                                powerConnectors: [],
                                performanceScore: 30,
                            } as GPUSpecifications,
                        };

                        const build: PartialBuild = { cpu, gpu };
                        const strategy = classifyBuildStrategy(build);

                        expect(strategy).toBe('Power-efficient');
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For empty build, strategy should default to Balanced', () => {
            const emptyBuild: PartialBuild = {};
            const strategy = classifyBuildStrategy(emptyBuild);

            expect(strategy).toBe('Balanced');
        });
    });
});
