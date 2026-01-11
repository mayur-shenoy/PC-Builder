/**
 * Property-based tests for TradeOffDisplay
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { TradeOffDisplay } from './TradeOffDisplay';
import { Component, ComponentType, CPUSpecifications } from '../types/components';

// Custom arbitrary for generating valid components
const validComponentArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.constantFrom<ComponentType>('CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU'),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    manufacturer: fc.string({ minLength: 3, maxLength: 20 }),
    price: fc.integer({ min: 50, max: 5000 }),
    specifications: fc.record({
        socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
        cores: fc.integer({ min: 4, max: 32 }),
        threads: fc.integer({ min: 4, max: 64 }),
        baseClock: fc.float({ min: 2.0, max: 4.0 }),
        boostClock: fc.float({ min: 3.0, max: 6.0 }),
        tdp: fc.integer({ min: 65, max: 250 }),
        integratedGraphics: fc.boolean(),
    }) as fc.Arbitrary<CPUSpecifications>,
}) as fc.Arbitrary<Component>;

/**
 * Property 8: Trade-Off Indicators Presence
 * Feature: pc-build-assistant, Property 8: Trade-Off Indicators Presence
 * Validates: Requirements 3.2
 * 
 * For any component option displayed to the user, the rendered output should include
 * all four trade-off indicators: cost, performance, power consumption, and upgrade path.
 */
describe('Property 8: Trade-Off Indicators Presence', () => {
    it('should display all four trade-off indicators for any component options', () => {
        fc.assert(
            fc.property(
                fc.array(validComponentArbitrary, { minLength: 1, maxLength: 3 }),
                fc.constantFrom<'beginner' | 'advanced'>('beginner', 'advanced'),
                (components, mode) => {
                    const { container } = render(
                        <TradeOffDisplay
                            components={components}
                            mode={mode}
                        />
                    );

                    // Property: All four trade-off categories must be present
                    const categories = container.querySelectorAll('.tradeoff-category');

                    // Should have exactly 4 categories: cost, performance, power, upgradeability
                    expect(categories.length).toBe(4);

                    // Verify each category has the expected structure
                    const categoryLabels = Array.from(categories).map(
                        cat => cat.querySelector('.category-label')?.textContent
                    );

                    // All four indicators must be present
                    expect(categoryLabels).toContain('Cost');
                    expect(categoryLabels).toContain('Performance');
                    expect(categoryLabels).toContain('Power');
                    expect(categoryLabels).toContain('Upgrade Path');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should display trade-off bars for each component in each category', () => {
        fc.assert(
            fc.property(
                fc.array(validComponentArbitrary, { minLength: 1, maxLength: 3 }),
                fc.constantFrom<'beginner' | 'advanced'>('beginner', 'advanced'),
                (components, mode) => {
                    const { container } = render(
                        <TradeOffDisplay
                            components={components}
                            mode={mode}
                        />
                    );

                    // Each category should have bars for each component
                    const categories = container.querySelectorAll('.tradeoff-category');

                    categories.forEach(category => {
                        const bars = category.querySelectorAll('.metric-bar');
                        // Each category should have one bar per component
                        expect(bars.length).toBe(components.length);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should render without errors for empty component list', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<'beginner' | 'advanced'>('beginner', 'advanced'),
                (mode) => {
                    const { container } = render(
                        <TradeOffDisplay
                            components={[]}
                            mode={mode}
                        />
                    );

                    // Should render nothing or handle gracefully
                    expect(container.querySelector('.tradeoff-display')).toBeNull();
                }
            ),
            { numRuns: 100 }
        );
    });
});
