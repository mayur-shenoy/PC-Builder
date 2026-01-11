/**
 * Property-based tests for ComponentSelector
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { ComponentSelector } from './ComponentSelector';
import { Component, ComponentType } from '../types/components';

// Custom arbitraries for generating test data
const componentTypeArbitrary = fc.constantFrom<ComponentType>(
    'CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'
);

// Generate specifications based on component type
const createComponentArbitrary = (type: ComponentType) => {
    let specificationsArbitrary;

    switch (type) {
        case 'CPU':
            specificationsArbitrary = fc.record({
                socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
                cores: fc.integer({ min: 4, max: 32 }),
                threads: fc.integer({ min: 4, max: 64 }),
                baseClock: fc.float({ min: 2.0, max: 4.0 }),
                boostClock: fc.float({ min: 3.0, max: 6.0 }),
                tdp: fc.integer({ min: 65, max: 250 }),
                integratedGraphics: fc.boolean(),
            });
            break;
        case 'GPU':
            specificationsArbitrary = fc.record({
                vram: fc.integer({ min: 4, max: 24 }),
                powerDraw: fc.integer({ min: 150, max: 450 }),
                length: fc.integer({ min: 200, max: 350 }),
                pciSlots: fc.integer({ min: 2, max: 3 }),
                powerConnectors: fc.array(fc.constantFrom('6-pin', '8-pin'), { minLength: 1, maxLength: 3 }),
                performanceScore: fc.integer({ min: 5000, max: 25000 }),
            });
            break;
        case 'Motherboard':
            specificationsArbitrary = fc.record({
                socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
                formFactor: fc.constantFrom('ATX', 'Micro-ATX', 'Mini-ITX'),
                ramType: fc.constantFrom('DDR4', 'DDR5'),
                ramSlots: fc.integer({ min: 2, max: 4 }),
                maxRamCapacity: fc.integer({ min: 32, max: 128 }),
                maxRamSpeed: fc.integer({ min: 3200, max: 6000 }),
                m2Slots: fc.integer({ min: 1, max: 4 }),
                sataPorts: fc.integer({ min: 4, max: 8 }),
                pciSlots: fc.integer({ min: 2, max: 4 }),
            });
            break;
        case 'RAM':
            specificationsArbitrary = fc.record({
                type: fc.constantFrom('DDR4', 'DDR5'),
                speed: fc.integer({ min: 3200, max: 6000 }),
                capacity: fc.integer({ min: 8, max: 64 }),
                modules: fc.integer({ min: 1, max: 4 }),
                latency: fc.string({ minLength: 5, maxLength: 10 }),
            });
            break;
        case 'Storage':
            specificationsArbitrary = fc.record({
                type: fc.constantFrom('M.2 NVMe', 'M.2 SATA', 'SATA SSD', 'SATA HDD'),
                capacity: fc.integer({ min: 256, max: 4000 }),
                readSpeed: fc.integer({ min: 500, max: 7000 }),
                writeSpeed: fc.integer({ min: 400, max: 6000 }),
            });
            break;
        case 'PSU':
            specificationsArbitrary = fc.record({
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
            break;
        default:
            specificationsArbitrary = fc.record({});
    }

    return fc.record({
        id: fc.uuid(),
        type: fc.constant(type),
        name: fc.string({ minLength: 5, maxLength: 50 }),
        manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
        price: fc.integer({ min: 50, max: 5000 }),
        specifications: specificationsArbitrary,
    }) as fc.Arbitrary<Component>;
};

// Generic component arbitrary that generates any type
const componentArbitrary = componentTypeArbitrary.chain(type => createComponentArbitrary(type));

/**
 * Property 4: Component Option Count Constraint
 * Feature: pc-build-assistant, Property 4: Component Option Count Constraint
 * Validates: Requirements 2.2
 * 
 * For any component selection step where at least 3 compatible components exist,
 * the system should present between 2 and 3 options.
 */
describe('Property 4: Component Option Count Constraint', () => {
    it('should display between 2-3 options when at least 3 compatible components exist', () => {
        fc.assert(
            fc.property(
                componentTypeArbitrary.chain(type =>
                    fc.tuple(
                        fc.constant(type),
                        fc.array(createComponentArbitrary(type), { minLength: 3, maxLength: 10 }),
                        fc.constantFrom<'beginner' | 'advanced'>('beginner', 'advanced')
                    )
                ),
                ([componentType, components, mode]) => {
                    const mockOnSelect = jest.fn();

                    const { container } = render(
                        <ComponentSelector
                            componentType={componentType}
                            options={components}
                            onSelect={mockOnSelect}
                            mode={mode}
                        />
                    );

                    // Count the number of component cards rendered
                    const componentCards = container.querySelectorAll('.component-card');
                    const displayedCount = componentCards.length;

                    // Property: When at least 3 components exist, display 2-3 options
                    expect(displayedCount).toBeGreaterThanOrEqual(2);
                    expect(displayedCount).toBeLessThanOrEqual(3);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display all options when fewer than 3 components exist', () => {
        fc.assert(
            fc.property(
                componentTypeArbitrary.chain(type =>
                    fc.tuple(
                        fc.constant(type),
                        fc.array(createComponentArbitrary(type), { minLength: 1, maxLength: 2 }),
                        fc.constantFrom<'beginner' | 'advanced'>('beginner', 'advanced')
                    )
                ),
                ([componentType, components, mode]) => {
                    const mockOnSelect = jest.fn();

                    const { container } = render(
                        <ComponentSelector
                            componentType={componentType}
                            options={components}
                            onSelect={mockOnSelect}
                            mode={mode}
                        />
                    );

                    const componentCards = container.querySelectorAll('.component-card');
                    const displayedCount = componentCards.length;

                    // When fewer than 3 components exist, display all of them
                    expect(displayedCount).toBe(components.length);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display no-options message when zero components exist', () => {
        fc.assert(
            fc.property(
                componentTypeArbitrary,
                fc.constantFrom<'beginner' | 'advanced'>('beginner', 'advanced'),
                (componentType, mode) => {
                    const mockOnSelect = jest.fn();

                    const { container } = render(
                        <ComponentSelector
                            componentType={componentType}
                            options={[]}
                            onSelect={mockOnSelect}
                            mode={mode}
                        />
                    );

                    // Should display no-options message
                    const noOptionsElements = screen.queryAllByText(/No compatible/i);
                    expect(noOptionsElements.length).toBeGreaterThan(0);

                    // Verify the no-options error div is present
                    const noOptionsDiv = container.querySelector('.no-options-error');
                    expect(noOptionsDiv).toBeTruthy();
                }
            ),
            { numRuns: 100 }
        );
    });
});
