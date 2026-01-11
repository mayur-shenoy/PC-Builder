/**
 * Unit tests for Build Store compatibility integration
 * Requirements: 2.1, 2.5
 */

import { useBuildStore } from './buildStore';
import { mockCPUs } from '../data/mockCPUs';
import { mockMotherboards } from '../data/mockMotherboards';

describe('Build Store Compatibility Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        useBuildStore.getState().resetBuild();
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('getCompatibleComponents filters based on current build', () => {
        const store = useBuildStore.getState();

        // Select a CPU with LGA 1700 socket
        const intelCPU = mockCPUs.find(cpu => cpu.id === 'cpu-1'); // Intel Core i9-13900K, LGA 1700
        expect(intelCPU).toBeDefined();

        if (intelCPU) {
            store.selectComponent('CPU', intelCPU);

            // Get compatible motherboards
            const compatibleMotherboards = store.getCompatibleComponents('Motherboard', mockMotherboards);

            // All compatible motherboards should have LGA 1700 socket
            compatibleMotherboards.forEach(mobo => {
                const specs = mobo.specifications as any;
                expect(specs.socket).toBe('LGA 1700');
            });

            // Should have at least one compatible motherboard
            expect(compatibleMotherboards.length).toBeGreaterThan(0);
        }
    });

    test('getConstraints returns current compatibility constraints', () => {
        const store = useBuildStore.getState();

        // Initially, no constraints
        let constraints = store.getConstraints();
        expect(constraints.requiredSocket).toBeUndefined();

        // Select a CPU
        const intelCPU = mockCPUs.find(cpu => cpu.id === 'cpu-1'); // Intel Core i9-13900K, LGA 1700
        if (intelCPU) {
            store.selectComponent('CPU', intelCPU);

            // Now should have socket constraint
            constraints = store.getConstraints();
            expect(constraints.requiredSocket).toBe('LGA 1700');
        }
    });

    test('selectComponent updates constraints', () => {
        const store = useBuildStore.getState();

        // Select CPU
        const intelCPU = mockCPUs.find(cpu => cpu.id === 'cpu-1');
        if (intelCPU) {
            store.selectComponent('CPU', intelCPU);

            const constraintsAfterCPU = store.getConstraints();
            expect(constraintsAfterCPU.requiredSocket).toBe('LGA 1700');

            // Select motherboard
            const compatibleMotherboard = mockMotherboards.find(
                mobo => (mobo.specifications as any).socket === 'LGA 1700'
            );

            if (compatibleMotherboard) {
                store.selectComponent('Motherboard', compatibleMotherboard);

                const constraintsAfterMotherboard = store.getConstraints();
                expect(constraintsAfterMotherboard.requiredSocket).toBe('LGA 1700');
                expect(constraintsAfterMotherboard.requiredRamType).toBeDefined();
                expect(constraintsAfterMotherboard.maxRamSpeed).toBeDefined();
            }
        }
    });

    test('selectComponent recalculates metrics', () => {
        // Reset store to ensure clean state
        useBuildStore.getState().resetBuild();

        const store = useBuildStore.getState();

        // After reset, metrics should be null
        expect(store.metrics).toBeNull();

        // Select a CPU
        const intelCPU = mockCPUs.find(cpu => cpu.id === 'cpu-1');
        if (intelCPU) {
            store.selectComponent('CPU', intelCPU);

            // Metrics should now be calculated
            const metricsAfterCPU = useBuildStore.getState().metrics;
            expect(metricsAfterCPU).not.toBeNull();
            expect(metricsAfterCPU?.strategy).toBeDefined();
            expect(metricsAfterCPU?.budgetDistribution).toBeDefined();
            expect(metricsAfterCPU?.bottleneckPercentage).toBeDefined();
            expect(metricsAfterCPU?.upgradeFlexibility).toBeDefined();

            // Select a motherboard
            const compatibleMotherboard = mockMotherboards.find(
                mobo => (mobo.specifications as any).socket === 'LGA 1700'
            );

            if (compatibleMotherboard) {
                store.selectComponent('Motherboard', compatibleMotherboard);

                // Metrics should be recalculated
                const metricsAfterMotherboard = useBuildStore.getState().metrics;
                expect(metricsAfterMotherboard).not.toBeNull();

                // Metrics should have changed (different budget distribution)
                expect(metricsAfterMotherboard).not.toEqual(metricsAfterCPU);
            }
        }
    });
});
