/**
 * Property-based tests for Compatibility Engine
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import {
    validateCPUMotherboard,
    validateRAMMotherboard,
    validatePSUWattage,
    validateFormFactors,
    filterCompatibleComponents,
    getCompatibilityConstraints,
    validateCompatibility,
} from './compatibilityEngine';
import {
    Component,
    CPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    GPUSpecifications,
    PSUSpecifications,
} from '../types/components';
import { PartialBuild } from '../types/build';

// Custom arbitraries for generating test data

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
        performanceScore: fc.integer({ min: 1000, max: 10000 }),
    }) as fc.Arbitrary<GPUSpecifications>,
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

describe('Compatibility Engine - Property Tests', () => {
    // Feature: pc-build-assistant, Property 19: CPU-Motherboard Socket Compatibility
    // Validates: Requirements 9.1
    describe('Property 19: CPU-Motherboard Socket Compatibility', () => {
        test('For any CPU and Motherboard with different sockets, they should be marked as incompatible', () => {
            fc.assert(
                fc.property(cpuArbitrary, motherboardArbitrary, (cpu, motherboard) => {
                    const cpuSpecs = cpu.specifications as CPUSpecifications;
                    const moboSpecs = motherboard.specifications as MotherboardSpecifications;

                    const result = validateCPUMotherboard(cpu, motherboard);

                    if (cpuSpecs.socket !== moboSpecs.socket) {
                        expect(result.isCompatible).toBe(false);
                        expect(result.violations.length).toBeGreaterThan(0);
                        expect(result.violations[0].rule).toBe('CPU_MOTHERBOARD_SOCKET');
                    } else {
                        expect(result.isCompatible).toBe(true);
                        expect(result.violations.length).toBe(0);
                    }
                }),
                { numRuns: 100 }
            );
        });

        test('For any CPU and Motherboard with matching sockets, they should be marked as compatible', () => {
            fc.assert(
                fc.property(socketArbitrary, (socket) => {
                    // Create CPU and motherboard with the same socket
                    const cpu: Component = {
                        id: 'test-cpu',
                        type: 'CPU',
                        name: 'Test CPU',
                        manufacturer: 'Intel',
                        price: 300,
                        specifications: {
                            socket,
                            cores: 8,
                            threads: 16,
                            baseClock: 3.0,
                            boostClock: 4.5,
                            tdp: 125,
                            integratedGraphics: false,
                        } as CPUSpecifications,
                    };

                    const motherboard: Component = {
                        id: 'test-mobo',
                        type: 'Motherboard',
                        name: 'Test Motherboard',
                        manufacturer: 'ASUS',
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
                        } as MotherboardSpecifications,
                    };

                    const result = validateCPUMotherboard(cpu, motherboard);

                    expect(result.isCompatible).toBe(true);
                    expect(result.violations.length).toBe(0);
                }),
                { numRuns: 100 }
            );
        });
    });

    // Feature: pc-build-assistant, Property 20: RAM-Motherboard Type Compatibility
    // Validates: Requirements 9.2
    describe('Property 20: RAM-Motherboard Type Compatibility', () => {
        test('For any RAM and Motherboard, if RAM type does not match motherboard type, they should be incompatible', () => {
            fc.assert(
                fc.property(ramArbitrary, motherboardArbitrary, (ram, motherboard) => {
                    const ramSpecs = ram.specifications as RAMSpecifications;
                    const moboSpecs = motherboard.specifications as MotherboardSpecifications;

                    const result = validateRAMMotherboard(ram, motherboard);

                    if (ramSpecs.type !== moboSpecs.ramType) {
                        expect(result.isCompatible).toBe(false);
                        expect(result.violations.length).toBeGreaterThan(0);
                        expect(result.violations.some(v => v.rule === 'RAM_TYPE_COMPATIBILITY')).toBe(true);
                    }
                }),
                { numRuns: 100 }
            );
        });

        test('For any RAM and Motherboard, if RAM speed exceeds motherboard max speed, they should be incompatible', () => {
            fc.assert(
                fc.property(ramArbitrary, motherboardArbitrary, (ram, motherboard) => {
                    const ramSpecs = ram.specifications as RAMSpecifications;
                    const moboSpecs = motherboard.specifications as MotherboardSpecifications;

                    const result = validateRAMMotherboard(ram, motherboard);

                    if (ramSpecs.speed > moboSpecs.maxRamSpeed) {
                        expect(result.isCompatible).toBe(false);
                        expect(result.violations.length).toBeGreaterThan(0);
                        expect(result.violations.some(v => v.rule === 'RAM_SPEED_COMPATIBILITY')).toBe(true);
                    }
                }),
                { numRuns: 100 }
            );
        });

        test('For any RAM and Motherboard with matching type and compatible speed, they should be compatible', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('DDR4', 'DDR5'),
                    fc.integer({ min: 2400, max: 6400 }),
                    (ramType, maxSpeed) => {
                        const ram: Component = {
                            id: 'test-ram',
                            type: 'RAM',
                            name: 'Test RAM',
                            manufacturer: 'Corsair',
                            price: 100,
                            specifications: {
                                type: ramType,
                                speed: maxSpeed - 400, // Speed below max
                                capacity: 16,
                                modules: 2,
                                latency: 'CL16',
                            } as RAMSpecifications,
                        };

                        const motherboard: Component = {
                            id: 'test-mobo',
                            type: 'Motherboard',
                            name: 'Test Motherboard',
                            manufacturer: 'ASUS',
                            price: 200,
                            specifications: {
                                socket: 'LGA 1700',
                                formFactor: 'ATX',
                                ramType: ramType,
                                ramSlots: 4,
                                maxRamCapacity: 128,
                                maxRamSpeed: maxSpeed,
                                m2Slots: 2,
                                sataPorts: 6,
                                pciSlots: 3,
                            } as MotherboardSpecifications,
                        };

                        const result = validateRAMMotherboard(ram, motherboard);

                        expect(result.isCompatible).toBe(true);
                        expect(result.violations.length).toBe(0);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: pc-build-assistant, Property 21: PSU Wattage Sufficiency
    // Validates: Requirements 9.3
    describe('Property 21: PSU Wattage Sufficiency', () => {
        test('For any build state, if PSU wattage is less than total power draw + 20% headroom, it should be incompatible', () => {
            fc.assert(
                fc.property(
                    cpuArbitrary,
                    gpuArbitrary,
                    motherboardArbitrary,
                    ramArbitrary,
                    psuArbitrary,
                    (cpu, gpu, motherboard, ram, psu) => {
                        const build: PartialBuild = {
                            cpu,
                            gpu,
                            motherboard,
                            ram,
                            storage: [],
                        };

                        const cpuSpecs = cpu.specifications as CPUSpecifications;
                        const gpuSpecs = gpu.specifications as GPUSpecifications;
                        const ramSpecs = ram.specifications as RAMSpecifications;
                        const psuSpecs = psu.specifications as PSUSpecifications;

                        // Calculate expected power draw
                        const totalPowerDraw =
                            cpuSpecs.tdp +
                            gpuSpecs.powerDraw +
                            80 + // Motherboard
                            ramSpecs.modules * 3;

                        const requiredWattage = totalPowerDraw * 1.2;

                        const result = validatePSUWattage(psu, build);

                        if (psuSpecs.wattage < requiredWattage) {
                            expect(result.isCompatible).toBe(false);
                            expect(result.violations.length).toBeGreaterThan(0);
                            expect(result.violations[0].rule).toBe('PSU_WATTAGE_SUFFICIENCY');
                        } else {
                            expect(result.isCompatible).toBe(true);
                            expect(result.violations.length).toBe(0);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For any build with sufficient PSU wattage, PSU should be compatible', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 65, max: 250 }),
                    fc.integer({ min: 100, max: 450 }),
                    fc.integer({ min: 1, max: 4 }),
                    (cpuTdp, gpuPowerDraw, ramModules) => {
                        const totalPowerDraw = cpuTdp + gpuPowerDraw + 80 + ramModules * 3;
                        const requiredWattage = Math.ceil(totalPowerDraw * 1.2);
                        const sufficientWattage = requiredWattage + 50; // Add buffer

                        const cpu: Component = {
                            id: 'test-cpu',
                            type: 'CPU',
                            name: 'Test CPU',
                            manufacturer: 'Intel',
                            price: 300,
                            specifications: {
                                socket: 'LGA 1700',
                                cores: 8,
                                threads: 16,
                                baseClock: 3.0,
                                boostClock: 4.5,
                                tdp: cpuTdp,
                                integratedGraphics: false,
                            } as CPUSpecifications,
                        };

                        const gpu: Component = {
                            id: 'test-gpu',
                            type: 'GPU',
                            name: 'Test GPU',
                            manufacturer: 'NVIDIA',
                            price: 500,
                            specifications: {
                                vram: 8,
                                powerDraw: gpuPowerDraw,
                                length: 280,
                                pciSlots: 2,
                                powerConnectors: ['8-pin'],
                                performanceScore: 5000,
                            } as GPUSpecifications,
                        };

                        const motherboard: Component = {
                            id: 'test-mobo',
                            type: 'Motherboard',
                            name: 'Test Motherboard',
                            manufacturer: 'ASUS',
                            price: 200,
                            specifications: {
                                socket: 'LGA 1700',
                                formFactor: 'ATX',
                                ramType: 'DDR4',
                                ramSlots: 4,
                                maxRamCapacity: 128,
                                maxRamSpeed: 3200,
                                m2Slots: 2,
                                sataPorts: 6,
                                pciSlots: 3,
                            } as MotherboardSpecifications,
                        };

                        const ram: Component = {
                            id: 'test-ram',
                            type: 'RAM',
                            name: 'Test RAM',
                            manufacturer: 'Corsair',
                            price: 100,
                            specifications: {
                                type: 'DDR4',
                                speed: 3200,
                                capacity: 16,
                                modules: ramModules,
                                latency: 'CL16',
                            } as RAMSpecifications,
                        };

                        const psu: Component = {
                            id: 'test-psu',
                            type: 'PSU',
                            name: 'Test PSU',
                            manufacturer: 'Corsair',
                            price: 150,
                            specifications: {
                                wattage: sufficientWattage,
                                efficiency: '80+ Gold',
                                modular: 'Full',
                                connectors: {
                                    pcie6pin: 2,
                                    pcie8pin: 2,
                                    sata: 8,
                                    molex: 4,
                                },
                            } as PSUSpecifications,
                        };

                        const build: PartialBuild = {
                            cpu,
                            gpu,
                            motherboard,
                            ram,
                            storage: [],
                        };

                        const result = validatePSUWattage(psu, build);

                        expect(result.isCompatible).toBe(true);
                        expect(result.violations.length).toBe(0);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: pc-build-assistant, Property 22: Form Factor Compatibility
    // Validates: Requirements 9.4
    describe('Property 22: Form Factor Compatibility', () => {
        test('For any GPU requiring more PCI slots than motherboard has, they should be incompatible', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 4 }),
                    fc.integer({ min: 2, max: 4 }),
                    (gpuPciSlots, moboPciSlots) => {
                        const gpu: Component = {
                            id: 'test-gpu',
                            type: 'GPU',
                            name: 'Test GPU',
                            manufacturer: 'NVIDIA',
                            price: 500,
                            specifications: {
                                vram: 8,
                                powerDraw: 250,
                                length: 280,
                                pciSlots: gpuPciSlots,
                                powerConnectors: ['8-pin'],
                                performanceScore: 5000,
                            } as GPUSpecifications,
                        };

                        const motherboard: Component = {
                            id: 'test-mobo',
                            type: 'Motherboard',
                            name: 'Test Motherboard',
                            manufacturer: 'ASUS',
                            price: 200,
                            specifications: {
                                socket: 'LGA 1700',
                                formFactor: 'ATX',
                                ramType: 'DDR4',
                                ramSlots: 4,
                                maxRamCapacity: 128,
                                maxRamSpeed: 3200,
                                m2Slots: 2,
                                sataPorts: 6,
                                pciSlots: moboPciSlots,
                            } as MotherboardSpecifications,
                        };

                        const build: PartialBuild = { motherboard };
                        const result = validateFormFactors(gpu, build);

                        if (gpuPciSlots > moboPciSlots) {
                            expect(result.isCompatible).toBe(false);
                            expect(result.violations.length).toBeGreaterThan(0);
                            expect(result.violations[0].rule).toBe('GPU_PCI_SLOTS');
                        } else {
                            expect(result.isCompatible).toBe(true);
                            expect(result.violations.length).toBe(0);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For any Mini-ITX motherboard with GPU longer than 210mm, they should be incompatible', () => {
            fc.assert(
                fc.property(fc.integer({ min: 180, max: 350 }), (gpuLength) => {
                    const gpu: Component = {
                        id: 'test-gpu',
                        type: 'GPU',
                        name: 'Test GPU',
                        manufacturer: 'NVIDIA',
                        price: 500,
                        specifications: {
                            vram: 8,
                            powerDraw: 250,
                            length: gpuLength,
                            pciSlots: 2,
                            powerConnectors: ['8-pin'],
                            performanceScore: 5000,
                        } as GPUSpecifications,
                    };

                    const motherboard: Component = {
                        id: 'test-mobo',
                        type: 'Motherboard',
                        name: 'Test Mini-ITX Motherboard',
                        manufacturer: 'ASUS',
                        price: 200,
                        specifications: {
                            socket: 'LGA 1700',
                            formFactor: 'Mini-ITX',
                            ramType: 'DDR4',
                            ramSlots: 2,
                            maxRamCapacity: 64,
                            maxRamSpeed: 3200,
                            m2Slots: 2,
                            sataPorts: 4,
                            pciSlots: 2,
                        } as MotherboardSpecifications,
                    };

                    const build: PartialBuild = { gpu };
                    const result = validateFormFactors(motherboard, build);

                    if (gpuLength > 210) {
                        expect(result.isCompatible).toBe(false);
                        expect(result.violations.length).toBeGreaterThan(0);
                        expect(result.violations[0].rule).toBe('FORM_FACTOR_GPU_LENGTH');
                    } else {
                        expect(result.isCompatible).toBe(true);
                        expect(result.violations.length).toBe(0);
                    }
                }),
                { numRuns: 100 }
            );
        });

        test('For any ATX or Micro-ATX motherboard with compatible GPU, they should be compatible', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('ATX', 'Micro-ATX'),
                    fc.integer({ min: 180, max: 350 }),
                    (formFactor, gpuLength) => {
                        const gpu: Component = {
                            id: 'test-gpu',
                            type: 'GPU',
                            name: 'Test GPU',
                            manufacturer: 'NVIDIA',
                            price: 500,
                            specifications: {
                                vram: 8,
                                powerDraw: 250,
                                length: gpuLength,
                                pciSlots: 2,
                                powerConnectors: ['8-pin'],
                                performanceScore: 5000,
                            } as GPUSpecifications,
                        };

                        const motherboard: Component = {
                            id: 'test-mobo',
                            type: 'Motherboard',
                            name: 'Test Motherboard',
                            manufacturer: 'ASUS',
                            price: 200,
                            specifications: {
                                socket: 'LGA 1700',
                                formFactor: formFactor as 'ATX' | 'Micro-ATX',
                                ramType: 'DDR4',
                                ramSlots: 4,
                                maxRamCapacity: 128,
                                maxRamSpeed: 3200,
                                m2Slots: 2,
                                sataPorts: 6,
                                pciSlots: 3,
                            } as MotherboardSpecifications,
                        };

                        const build: PartialBuild = { gpu };
                        const result = validateFormFactors(motherboard, build);

                        // ATX and Micro-ATX don't have GPU length restrictions in our implementation
                        expect(result.isCompatible).toBe(true);
                        expect(result.violations.length).toBe(0);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: pc-build-assistant, Property 3: Compatibility Filtering Correctness
    // Validates: Requirements 2.1, 9.5
    describe('Property 3: Compatibility Filtering Correctness', () => {
        test('For any build state and component type, all filtered components must be compatible with all selected components', () => {
            fc.assert(
                fc.property(
                    fc.option(cpuArbitrary, { nil: undefined }),
                    fc.option(motherboardArbitrary, { nil: undefined }),
                    fc.option(ramArbitrary, { nil: undefined }),
                    fc.option(gpuArbitrary, { nil: undefined }),
                    fc.array(cpuArbitrary, { minLength: 5, maxLength: 10 }),
                    (cpu, motherboard, ram, gpu, cpuPool) => {
                        const build: PartialBuild = {
                            cpu,
                            motherboard,
                            ram,
                            gpu,
                        };

                        const filteredCPUs = filterCompatibleComponents('CPU', build, cpuPool);

                        // All filtered CPUs must be compatible with the current build
                        filteredCPUs.forEach((filteredCpu) => {
                            const result = validateCompatibility(filteredCpu, build);
                            expect(result.isCompatible).toBe(true);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For any build with motherboard, filtered CPUs must have matching socket', () => {
            fc.assert(
                fc.property(
                    motherboardArbitrary,
                    fc.array(cpuArbitrary, { minLength: 5, maxLength: 10 }),
                    (motherboard, cpuPool) => {
                        const moboSpecs = motherboard.specifications as MotherboardSpecifications;
                        const build: PartialBuild = { motherboard };

                        const filteredCPUs = filterCompatibleComponents('CPU', build, cpuPool);

                        // All filtered CPUs must have matching socket
                        filteredCPUs.forEach((cpu) => {
                            const cpuSpecs = cpu.specifications as CPUSpecifications;
                            expect(cpuSpecs.socket).toBe(moboSpecs.socket);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For any build with motherboard, filtered RAM must have matching type and compatible speed', () => {
            fc.assert(
                fc.property(
                    motherboardArbitrary,
                    fc.array(ramArbitrary, { minLength: 5, maxLength: 10 }),
                    (motherboard, ramPool) => {
                        const moboSpecs = motherboard.specifications as MotherboardSpecifications;
                        const build: PartialBuild = { motherboard };

                        const filteredRAM = filterCompatibleComponents('RAM', build, ramPool);

                        // All filtered RAM must have matching type and compatible speed
                        filteredRAM.forEach((ram) => {
                            const ramSpecs = ram.specifications as RAMSpecifications;
                            expect(ramSpecs.type).toBe(moboSpecs.ramType);
                            expect(ramSpecs.speed).toBeLessThanOrEqual(moboSpecs.maxRamSpeed);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('For any build with components, filtered PSUs must have sufficient wattage', () => {
            fc.assert(
                fc.property(
                    cpuArbitrary,
                    gpuArbitrary,
                    motherboardArbitrary,
                    ramArbitrary,
                    fc.array(psuArbitrary, { minLength: 5, maxLength: 10 }),
                    (cpu, gpu, motherboard, ram, psuPool) => {
                        const build: PartialBuild = {
                            cpu,
                            gpu,
                            motherboard,
                            ram,
                            storage: [],
                        };

                        const cpuSpecs = cpu.specifications as CPUSpecifications;
                        const gpuSpecs = gpu.specifications as GPUSpecifications;
                        const ramSpecs = ram.specifications as RAMSpecifications;

                        const totalPowerDraw =
                            cpuSpecs.tdp + gpuSpecs.powerDraw + 80 + ramSpecs.modules * 3;
                        const requiredWattage = totalPowerDraw * 1.2;

                        const filteredPSUs = filterCompatibleComponents('PSU', build, psuPool);

                        // All filtered PSUs must have sufficient wattage
                        filteredPSUs.forEach((psu) => {
                            const psuSpecs = psu.specifications as PSUSpecifications;
                            expect(psuSpecs.wattage).toBeGreaterThanOrEqual(requiredWattage);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: pc-build-assistant, Property 6: Component Selection Updates Constraints
    // Validates: Requirements 2.5
    describe('Property 6: Component Selection Updates Constraints', () => {
        test('For any build state and newly selected component with constraints, constraints should differ after selection', () => {
            fc.assert(
                fc.property(motherboardArbitrary, (motherboard) => {
                    const emptyBuild: PartialBuild = {};
                    const buildWithMotherboard: PartialBuild = { motherboard };

                    const constraintsBefore = getCompatibilityConstraints(emptyBuild);
                    const constraintsAfter = getCompatibilityConstraints(buildWithMotherboard);

                    // Motherboard introduces socket, RAM type, and other constraints
                    expect(constraintsAfter.requiredSocket).toBeDefined();
                    expect(constraintsAfter.requiredRamType).toBeDefined();
                    expect(constraintsAfter.maxRamSpeed).toBeDefined();

                    // Constraints should be different
                    expect(constraintsAfter).not.toEqual(constraintsBefore);
                }),
                { numRuns: 100 }
            );
        });

        test('For any build, adding CPU should introduce socket constraint', () => {
            fc.assert(
                fc.property(cpuArbitrary, (cpu) => {
                    const emptyBuild: PartialBuild = {};
                    const buildWithCPU: PartialBuild = { cpu };

                    const constraintsBefore = getCompatibilityConstraints(emptyBuild);
                    const constraintsAfter = getCompatibilityConstraints(buildWithCPU);

                    const cpuSpecs = cpu.specifications as CPUSpecifications;

                    expect(constraintsBefore.requiredSocket).toBeUndefined();
                    expect(constraintsAfter.requiredSocket).toBe(cpuSpecs.socket);
                }),
                { numRuns: 100 }
            );
        });

        test('For any build, adding GPU should introduce minimum PSU wattage constraint', () => {
            fc.assert(
                fc.property(gpuArbitrary, (gpu) => {
                    const buildWithoutGPU: PartialBuild = {};
                    const buildWithGPU: PartialBuild = { gpu };

                    const constraintsBefore = getCompatibilityConstraints(buildWithoutGPU);
                    const constraintsAfter = getCompatibilityConstraints(buildWithGPU);

                    // GPU introduces power requirements
                    expect(constraintsAfter.minimumPSUWattage).toBeDefined();
                    expect(constraintsAfter.minimumPSUWattage).toBeGreaterThan(0);

                    // Should also introduce power connector requirements
                    expect(constraintsAfter.requiredPowerConnectors).toBeDefined();
                }),
                { numRuns: 100 }
            );
        });
    });
});
