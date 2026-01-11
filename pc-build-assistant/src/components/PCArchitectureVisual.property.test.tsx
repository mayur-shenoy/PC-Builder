/**
 * Property-based tests for PCArchitectureVisual
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { PCArchitectureVisual } from './PCArchitectureVisual';
import { PartialBuild } from '../types/build';
import { Component, ComponentType } from '../types/components';

// Custom arbitraries for generating test data
const componentTypeArbitrary = fc.constantFrom<ComponentType>(
    'CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'
);

const cpuArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant<ComponentType>('CPU'),
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
    type: fc.constant<ComponentType>('GPU'),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 200, max: 2000 }),
    specifications: fc.record({
        vram: fc.integer({ min: 4, max: 24 }),
        powerDraw: fc.integer({ min: 100, max: 450 }),
        length: fc.integer({ min: 200, max: 350 }),
        pciSlots: fc.integer({ min: 2, max: 3 }),
        powerConnectors: fc.array(fc.constantFrom('6-pin', '8-pin'), { minLength: 1, maxLength: 3 }),
        performanceScore: fc.integer({ min: 1000, max: 10000 }),
    }),
}) as fc.Arbitrary<Component>;

const motherboardArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constant<ComponentType>('Motherboard'),
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
    type: fc.constant<ComponentType>('RAM'),
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
    type: fc.constant<ComponentType>('Storage'),
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
    type: fc.constant<ComponentType>('PSU'),
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

const partialBuildArbitrary = fc.record({
    cpu: fc.option(cpuArbitrary),
    gpu: fc.option(gpuArbitrary),
    motherboard: fc.option(motherboardArbitrary),
    ram: fc.option(ramArbitrary),
    storage: fc.option(fc.array(storageArbitrary, { minLength: 0, maxLength: 3 })),
    psu: fc.option(psuArbitrary),
}) as fc.Arbitrary<PartialBuild>;

/**
 * Property 13: Visual Representation Updates
 * Feature: pc-build-assistant, Property 13: Visual Representation Updates
 * Validates: Requirements 6.1, 6.2
 * 
 * For any build state, the visual representation component should render without errors
 * and update when any component is selected.
 */
describe('Property 13: Visual Representation Updates', () => {
    it('should render without errors for any build state', () => {
        fc.assert(
            fc.property(
                partialBuildArbitrary,
                fc.boolean(),
                fc.option(componentTypeArbitrary),
                (build, highlightCompatibility, currentStep) => {
                    // Should not throw an error
                    const { container } = render(
                        <PCArchitectureVisual
                            build={build}
                            highlightCompatibility={highlightCompatibility}
                            currentStep={currentStep ?? undefined}
                        />
                    );

                    // Should render the SVG element
                    const svg = container.querySelector('.architecture-svg');
                    expect(svg).toBeTruthy();

                    // Should render component boxes
                    const componentBoxes = container.querySelectorAll('.component-box');
                    expect(componentBoxes.length).toBe(6); // Always 6 component types

                    // Should render connection lines
                    const connections = container.querySelectorAll('.connection');
                    expect(connections.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should update visual when components are added to build', () => {
        fc.assert(
            fc.property(
                cpuArbitrary,
                gpuArbitrary,
                (cpu, gpu) => {
                    // Render with empty build
                    const { container: container1 } = render(
                        <PCArchitectureVisual build={{}} />
                    );

                    const emptySelectedBoxes = container1.querySelectorAll('.component-box.selected');
                    expect(emptySelectedBoxes.length).toBe(0);

                    // Render with CPU selected
                    const { container: container2 } = render(
                        <PCArchitectureVisual build={{ cpu }} />
                    );

                    const cpuSelectedBoxes = container2.querySelectorAll('.component-box.selected');
                    expect(cpuSelectedBoxes.length).toBe(1);

                    // Render with CPU and GPU selected
                    const { container: container3 } = render(
                        <PCArchitectureVisual build={{ cpu, gpu }} />
                    );

                    const bothSelectedBoxes = container3.querySelectorAll('.component-box.selected');
                    expect(bothSelectedBoxes.length).toBe(2);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should highlight current step when provided', () => {
        fc.assert(
            fc.property(
                partialBuildArbitrary,
                componentTypeArbitrary,
                (build, currentStep) => {
                    const { container } = render(
                        <PCArchitectureVisual
                            build={build}
                            currentStep={currentStep}
                        />
                    );

                    // Should have exactly one current component box
                    const currentBoxes = container.querySelectorAll('.component-box.current');
                    expect(currentBoxes.length).toBe(1);
                }
            ),
            { numRuns: 100 }
        );
    });
});

/**
 * Property 14: Compatibility Status Visualization
 * Feature: pc-build-assistant, Property 14: Compatibility Status Visualization
 * Validates: Requirements 6.3
 * 
 * For any build state, the visual representation should include compatibility status
 * indicators for all component relationships.
 */
describe('Property 14: Compatibility Status Visualization', () => {
    it('should display compatibility status for all connections', () => {
        fc.assert(
            fc.property(
                partialBuildArbitrary,
                (build) => {
                    const { container } = render(
                        <PCArchitectureVisual
                            build={build}
                            highlightCompatibility={true}
                        />
                    );

                    // Should render connection lines with status classes
                    const connections = container.querySelectorAll('.connection');
                    expect(connections.length).toBeGreaterThan(0);

                    // Each connection should have a status class
                    connections.forEach(conn => {
                        const hasStatus =
                            conn.classList.contains('compatible') ||
                            conn.classList.contains('incompatible') ||
                            conn.classList.contains('pending') ||
                            conn.classList.contains('neutral');
                        expect(hasStatus).toBe(true);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should show legend when highlightCompatibility is enabled', () => {
        fc.assert(
            fc.property(
                partialBuildArbitrary,
                (build) => {
                    const { container } = render(
                        <PCArchitectureVisual
                            build={build}
                            highlightCompatibility={true}
                        />
                    );

                    // Should display legend
                    const legend = container.querySelector('.visual-legend');
                    expect(legend).toBeTruthy();

                    // Legend should have items
                    const legendItems = container.querySelectorAll('.legend-item');
                    expect(legendItems.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should not show legend when highlightCompatibility is disabled', () => {
        fc.assert(
            fc.property(
                partialBuildArbitrary,
                (build) => {
                    const { container } = render(
                        <PCArchitectureVisual
                            build={build}
                            highlightCompatibility={false}
                        />
                    );

                    // Should not display legend
                    const legend = container.querySelector('.visual-legend');
                    expect(legend).toBeFalsy();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should mark CPU-Motherboard connection as compatible when sockets match', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
                (socket) => {
                    // Create CPU and Motherboard with matching sockets
                    const cpu: Component = {
                        id: 'cpu-1',
                        type: 'CPU',
                        name: 'Test CPU',
                        manufacturer: 'TestCo',
                        price: 300,
                        specifications: {
                            socket,
                            cores: 8,
                            threads: 16,
                            baseClock: 3.0,
                            boostClock: 4.5,
                            tdp: 125,
                            integratedGraphics: false,
                            performanceScore: 80,
                        },
                    };

                    const motherboard: Component = {
                        id: 'mb-1',
                        type: 'Motherboard',
                        name: 'Test Motherboard',
                        manufacturer: 'TestCo',
                        price: 200,
                        specifications: {
                            socket,
                            formFactor: 'ATX',
                            ramType: 'DDR4',
                            ramSlots: 4,
                            maxRamCapacity: 128,
                            maxRamSpeed: 3200,
                            m2Slots: 2,
                            sataPorts: 6,
                            pciSlots: 3,
                        },
                    };

                    const { container } = render(
                        <PCArchitectureVisual
                            build={{ cpu, motherboard }}
                            highlightCompatibility={true}
                        />
                    );

                    // Find CPU-Motherboard connection
                    const connections = container.querySelectorAll('.connection');
                    const cpuMbConnection = Array.from(connections).find(conn => {
                        // Check if this connection involves both CPU and Motherboard
                        return conn.classList.contains('compatible') ||
                            conn.classList.contains('incompatible');
                    });

                    // At least one connection should be marked as compatible
                    const compatibleConnections = container.querySelectorAll('.connection.compatible');
                    expect(compatibleConnections.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display component names for selected components', () => {
        fc.assert(
            fc.property(
                cpuArbitrary,
                gpuArbitrary,
                (cpu, gpu) => {
                    const { container } = render(
                        <PCArchitectureVisual
                            build={{ cpu, gpu }}
                        />
                    );

                    // Should display manufacturer names in component boxes
                    const componentNames = container.querySelectorAll('.component-name');
                    const nameTexts = Array.from(componentNames).map(el => el.textContent);

                    // Should include the manufacturers of selected components
                    expect(nameTexts).toContain(cpu.manufacturer);
                    expect(nameTexts).toContain(gpu.manufacturer);
                }
            ),
            { numRuns: 100 }
        );
    });
});
