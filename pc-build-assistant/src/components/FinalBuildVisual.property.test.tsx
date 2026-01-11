/**
 * Property-based tests for FinalBuildVisual
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { FinalBuildVisual } from './FinalBuildVisual';
import type { CompleteBuild, BuildMetrics } from '../types/build';
import type { Component } from '../types/components';

// Custom arbitraries for generating test data
const cpuArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant('CPU' as const),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 100, max: 1000 }),
    specifications: fc.record({
        socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
        cores: fc.integer({ min: 4, max: 32 }),
        threads: fc.integer({ min: 4, max: 64 }),
        baseClock: fc.float({ min: 2.0, max: 4.0 }),
        boostClock: fc.float({ min: 3.0, max: 6.0 }),
        tdp: fc.integer({ min: 65, max: 250 }),
        integratedGraphics: fc.boolean(),
    }),
}) as fc.Arbitrary<Component>;

const gpuArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant('GPU' as const),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 200, max: 2000 }),
    specifications: fc.record({
        vram: fc.integer({ min: 4, max: 24 }),
        powerDraw: fc.integer({ min: 100, max: 450 }),
        length: fc.integer({ min: 200, max: 350 }),
        pciSlots: fc.integer({ min: 2, max: 3 }),
        powerConnectors: fc.array(fc.constantFrom('6-pin', '8-pin'), { minLength: 1, maxLength: 3 }),
        performanceScore: fc.integer({ min: 30, max: 100 }),
    }),
}) as fc.Arbitrary<Component>;

const motherboardArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant('Motherboard' as const),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 100, max: 800 }),
    specifications: fc.record({
        socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
        formFactor: fc.constantFrom('ATX', 'Micro-ATX', 'Mini-ITX'),
        ramType: fc.constantFrom('DDR4', 'DDR5'),
        ramSlots: fc.integer({ min: 2, max: 4 }),
        maxRamCapacity: fc.integer({ min: 32, max: 128 }),
        maxRamSpeed: fc.integer({ min: 2400, max: 6000 }),
        m2Slots: fc.integer({ min: 1, max: 4 }),
        sataPorts: fc.integer({ min: 2, max: 8 }),
        pciSlots: fc.integer({ min: 2, max: 4 }),
    }),
}) as fc.Arbitrary<Component>;

const ramArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant('RAM' as const),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 50, max: 500 }),
    specifications: fc.record({
        type: fc.constantFrom('DDR4', 'DDR5'),
        speed: fc.integer({ min: 2400, max: 6000 }),
        capacity: fc.integer({ min: 8, max: 64 }),
        modules: fc.integer({ min: 1, max: 4 }),
        latency: fc.string({ minLength: 5, maxLength: 10 }),
    }),
}) as fc.Arbitrary<Component>;

const storageArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant('Storage' as const),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 50, max: 500 }),
    specifications: fc.record({
        type: fc.constantFrom('M.2 NVMe', 'M.2 SATA', 'SATA SSD', 'SATA HDD'),
        capacity: fc.integer({ min: 256, max: 4000 }),
        readSpeed: fc.integer({ min: 500, max: 7000 }),
        writeSpeed: fc.integer({ min: 400, max: 6000 }),
    }),
}) as fc.Arbitrary<Component>;

const psuArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant('PSU' as const),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 50, max: 300 }),
    specifications: fc.record({
        wattage: fc.integer({ min: 500, max: 1200 }),
        efficiency: fc.constantFrom('80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'),
        modular: fc.constantFrom('Full', 'Semi', 'Non'),
        connectors: fc.record({
            pcie6pin: fc.integer({ min: 0, max: 4 }),
            pcie8pin: fc.integer({ min: 0, max: 4 }),
            sata: fc.integer({ min: 4, max: 12 }),
            molex: fc.integer({ min: 2, max: 6 }),
        }),
    }),
}) as fc.Arbitrary<Component>;

const completeBuildArbitrary = fc.record({
    cpu: cpuArbitrary,
    gpu: gpuArbitrary,
    motherboard: motherboardArbitrary,
    ram: ramArbitrary,
    storage: fc.array(storageArbitrary, { minLength: 1, maxLength: 3 }),
    psu: psuArbitrary,
}) as fc.Arbitrary<CompleteBuild>;

const buildMetricsArbitrary = fc.record({
    strategy: fc.constantFrom('GPU-heavy', 'CPU-heavy', 'Balanced', 'Power-efficient'),
    budgetDistribution: fc.record({
        CPU: fc.float({ min: 0, max: 100 }),
        GPU: fc.float({ min: 0, max: 100 }),
        Motherboard: fc.float({ min: 0, max: 100 }),
        RAM: fc.float({ min: 0, max: 100 }),
        Storage: fc.float({ min: 0, max: 100 }),
        PSU: fc.float({ min: 0, max: 100 }),
    }),
    bottleneckPercentage: fc.float({ min: 0, max: 100 }),
    upgradeFlexibility: fc.float({ min: 0, max: 100 }),
}) as fc.Arbitrary<BuildMetrics>;

/**
 * Property 18: Final Visual Completeness
 * Feature: pc-build-assistant, Property 18: Final Visual Completeness
 * Validates: Requirements 8.6, 8.7
 * 
 * For any complete build, the final visual representation should display all selected
 * components and highlight the build strategy visually.
 */
describe('Property 18: Final Visual Completeness', () => {
    it('should render without errors for any complete build', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    // Should not throw an error
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should render the main container
                    const visual = container.querySelector('.final-build-visual');
                    expect(visual).toBeTruthy();

                    // Should render the SVG element
                    const svg = container.querySelector('.final-architecture-svg');
                    expect(svg).toBeTruthy();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display all 6 component types', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should render exactly 6 component boxes (CPU, GPU, Motherboard, RAM, Storage, PSU)
                    const componentBoxes = container.querySelectorAll('.component-box');
                    expect(componentBoxes.length).toBe(6);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display strategy badge with correct strategy', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should display strategy badge
                    const strategyBadge = container.querySelector('.strategy-badge');
                    expect(strategyBadge).toBeTruthy();

                    // Strategy label should contain the strategy name
                    const strategyLabel = container.querySelector('.strategy-label');
                    expect(strategyLabel).toBeTruthy();
                    expect(strategyLabel?.textContent).toContain(metrics.strategy);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should highlight components based on build strategy', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should have highlighted component boxes based on strategy
                    const highlightedBoxes = container.querySelectorAll('.component-box.highlighted');

                    // GPU-heavy should highlight GPU
                    // CPU-heavy should highlight CPU
                    // Balanced should highlight both CPU and GPU
                    // Power-efficient may not highlight any specific component
                    if (metrics.strategy === 'GPU-heavy') {
                        expect(highlightedBoxes.length).toBeGreaterThanOrEqual(1);
                    } else if (metrics.strategy === 'CPU-heavy') {
                        expect(highlightedBoxes.length).toBeGreaterThanOrEqual(1);
                    } else if (metrics.strategy === 'Balanced') {
                        expect(highlightedBoxes.length).toBeGreaterThanOrEqual(2);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display component details for all components', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should display component details section
                    const componentDetails = container.querySelector('.component-details');
                    expect(componentDetails).toBeTruthy();

                    // Should have detail items for all 6 component types
                    const detailItems = container.querySelectorAll('.detail-item');
                    expect(detailItems.length).toBe(6);

                    // Should display component names
                    const detailValues = container.querySelectorAll('.detail-value');
                    const valueTexts = Array.from(detailValues).map(el => el.textContent);

                    // Should include all component names
                    expect(valueTexts.some(text => text?.includes(build.cpu.name))).toBe(true);
                    expect(valueTexts.some(text => text?.includes(build.gpu.name))).toBe(true);
                    expect(valueTexts.some(text => text?.includes(build.motherboard.name))).toBe(true);
                    expect(valueTexts.some(text => text?.includes(build.ram.name))).toBe(true);
                    expect(valueTexts.some(text => text?.includes(build.psu.name))).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display connection lines between components', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should render connection lines
                    const connections = container.querySelectorAll('.connection-line');
                    expect(connections.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display component specifications summary', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should display component summaries in SVG
                    const componentSummaries = container.querySelectorAll('.component-summary');
                    expect(componentSummaries.length).toBe(6);

                    // Summaries should not be empty
                    componentSummaries.forEach(summary => {
                        expect(summary.textContent).toBeTruthy();
                        expect(summary.textContent?.length).toBeGreaterThan(0);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display all storage drives in component details', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Find storage detail item
                    const detailItems = Array.from(container.querySelectorAll('.detail-item'));
                    const storageItem = detailItems.find(item => {
                        const label = item.querySelector('.detail-label');
                        return label?.textContent === 'Storage:';
                    });

                    expect(storageItem).toBeTruthy();

                    // Storage value should contain all storage drive names
                    const storageValue = storageItem?.querySelector('.detail-value');
                    build.storage.forEach(storage => {
                        expect(storageValue?.textContent).toContain(storage.name);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should use different colors for different build strategies', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                (build) => {
                    // Test each strategy
                    const strategies: Array<'GPU-heavy' | 'CPU-heavy' | 'Balanced' | 'Power-efficient'> = [
                        'GPU-heavy',
                        'CPU-heavy',
                        'Balanced',
                        'Power-efficient',
                    ];

                    const colors = strategies.map(strategy => {
                        const metrics: BuildMetrics = {
                            strategy,
                            budgetDistribution: {},
                            bottleneckPercentage: 0,
                            upgradeFlexibility: 0,
                        };

                        const { container } = render(
                            <FinalBuildVisual build={build} metrics={metrics} />
                        );

                        const strategyBadge = container.querySelector('.strategy-badge') as HTMLElement;
                        return strategyBadge?.style.backgroundColor;
                    });

                    // Each strategy should have a unique color
                    const uniqueColors = new Set(colors);
                    expect(uniqueColors.size).toBe(4);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display strategy icon for each strategy type', () => {
        fc.assert(
            fc.property(
                completeBuildArbitrary,
                buildMetricsArbitrary,
                (build, metrics) => {
                    const { container } = render(
                        <FinalBuildVisual build={build} metrics={metrics} />
                    );

                    // Should display strategy icon
                    const strategyIcon = container.querySelector('.strategy-icon');
                    expect(strategyIcon).toBeTruthy();
                    expect(strategyIcon?.textContent).toBeTruthy();
                    expect(strategyIcon?.textContent?.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });
});
