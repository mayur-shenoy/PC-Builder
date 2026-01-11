/**
 * Tests for component data store
 * Requirements: 2.1
 */

import { getComponentsByType, getComponentById, getAllComponents } from './componentStore';

describe('Component Store', () => {
    describe('getComponentsByType', () => {
        it('should return all CPUs when type is CPU', () => {
            const cpus = getComponentsByType('CPU');
            expect(cpus.length).toBeGreaterThan(0);
            expect(cpus.every(c => c.type === 'CPU')).toBe(true);
        });

        it('should return all GPUs when type is GPU', () => {
            const gpus = getComponentsByType('GPU');
            expect(gpus.length).toBeGreaterThan(0);
            expect(gpus.every(c => c.type === 'GPU')).toBe(true);
        });

        it('should return all Motherboards when type is Motherboard', () => {
            const motherboards = getComponentsByType('Motherboard');
            expect(motherboards.length).toBeGreaterThan(0);
            expect(motherboards.every(c => c.type === 'Motherboard')).toBe(true);
        });

        it('should return all RAM when type is RAM', () => {
            const ram = getComponentsByType('RAM');
            expect(ram.length).toBeGreaterThan(0);
            expect(ram.every(c => c.type === 'RAM')).toBe(true);
        });

        it('should return all Storage when type is Storage', () => {
            const storage = getComponentsByType('Storage');
            expect(storage.length).toBeGreaterThan(0);
            expect(storage.every(c => c.type === 'Storage')).toBe(true);
        });

        it('should return all PSUs when type is PSU', () => {
            const psus = getComponentsByType('PSU');
            expect(psus.length).toBeGreaterThan(0);
            expect(psus.every(c => c.type === 'PSU')).toBe(true);
        });
    });

    describe('getComponentById', () => {
        it('should return the correct component when ID exists', () => {
            const component = getComponentById('cpu-1');
            expect(component).toBeDefined();
            expect(component?.id).toBe('cpu-1');
            expect(component?.type).toBe('CPU');
        });

        it('should return undefined when ID does not exist', () => {
            const component = getComponentById('nonexistent-id');
            expect(component).toBeUndefined();
        });
    });

    describe('getAllComponents', () => {
        it('should return all components', () => {
            const allComponents = getAllComponents();
            expect(allComponents.length).toBeGreaterThan(0);

            // Verify we have components of each type
            const types = new Set(allComponents.map(c => c.type));
            expect(types.has('CPU')).toBe(true);
            expect(types.has('GPU')).toBe(true);
            expect(types.has('Motherboard')).toBe(true);
            expect(types.has('RAM')).toBe(true);
            expect(types.has('Storage')).toBe(true);
            expect(types.has('PSU')).toBe(true);
        });
    });
});
