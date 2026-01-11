/**
 * Tests for PCArchitectureVisualContainer
 * Requirements: 6.2
 */

import { render, act } from '@testing-library/react';
import { PCArchitectureVisualContainer } from './PCArchitectureVisualContainer';
import { useBuildStore } from '../store/buildStore';

describe('PCArchitectureVisualContainer', () => {
    beforeEach(() => {
        // Reset store before each test
        useBuildStore.getState().resetBuild();
    });

    it('should render PCArchitectureVisual with build from store', () => {
        const { container } = render(<PCArchitectureVisualContainer />);

        // Should render the visual component
        const svg = container.querySelector('.architecture-svg');
        expect(svg).toBeTruthy();

        // Should render component boxes
        const componentBoxes = container.querySelectorAll('.component-box');
        expect(componentBoxes.length).toBe(6);
    });

    it('should update when build state changes', () => {
        const { container, rerender } = render(<PCArchitectureVisualContainer />);

        // Initially no selected components
        let selectedBoxes = container.querySelectorAll('.component-box.selected');
        expect(selectedBoxes.length).toBe(0);

        // Add a CPU to the build
        const cpu = {
            id: 'cpu-1',
            type: 'CPU' as const,
            name: 'Test CPU',
            manufacturer: 'TestCo',
            price: 300,
            specifications: {
                socket: 'LGA 1700',
                cores: 8,
                threads: 16,
                baseClock: 3.0,
                boostClock: 4.5,
                tdp: 125,
                integratedGraphics: false,
                performanceScore: 80,
            },
        };

        // Wrap state update in act
        act(() => {
            useBuildStore.getState().selectComponent('CPU', cpu);
        });

        // Re-render to reflect store changes
        rerender(<PCArchitectureVisualContainer />);

        // Should now have one selected component
        selectedBoxes = container.querySelectorAll('.component-box.selected');
        expect(selectedBoxes.length).toBe(1);
    });

    it('should highlight current step from store', () => {
        const { container } = render(<PCArchitectureVisualContainer />);

        // Should have one current component box (default is CPU)
        const currentBoxes = container.querySelectorAll('.component-box.current');
        expect(currentBoxes.length).toBe(1);
    });

    it('should pass highlightCompatibility prop to visual component', () => {
        const { container: container1 } = render(
            <PCArchitectureVisualContainer highlightCompatibility={true} />
        );

        // Should show legend when highlightCompatibility is true
        const legend1 = container1.querySelector('.visual-legend');
        expect(legend1).toBeTruthy();

        const { container: container2 } = render(
            <PCArchitectureVisualContainer highlightCompatibility={false} />
        );

        // Should not show legend when highlightCompatibility is false
        const legend2 = container2.querySelector('.visual-legend');
        expect(legend2).toBeFalsy();
    });
});
