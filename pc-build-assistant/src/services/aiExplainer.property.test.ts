/**
 * Property-based tests for AI Explainer Service
 * Feature: pc-build-assistant
 */

import * as fc from 'fast-check';
import {
    generateTradeOffSummary,
    generateWhyNotExplanation,
    answerQuery,
    generateFinalSummary,
    BuildContext,
} from './aiExplainer';
import {
    Component,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    StorageSpecifications,
    PSUSpecifications,
} from '../types/components';
import { PartialBuild, CompleteBuild, UserPreferences } from '../types/build';

// Custom arbitraries for generating test data

const cpuArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('CPU' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('Intel', 'AMD'),
    price: fc.integer({ min: 100, max: 1000 }),
    specifications: fc.record({
        socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
        cores: fc.integer({ min: 4, max: 32 }),
        threads: fc.integer({ min: 4, max: 64 }),
        baseClock: fc.float({ min: 2.0, max: 4.0 }),
        boostClock: fc.float({ min: 3.0, max: 6.0 }),
        tdp: fc.integer({ min: 65, max: 250 }),
        integratedGraphics: fc.boolean(),
        performanceScore: fc.integer({ min: 30, max: 100 }),
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
    manufacturer: fc.constantFrom('ASUS', 'MSI', 'Gigabyte'),
    price: fc.integer({ min: 100, max: 500 }),
    specifications: fc.record({
        socket: fc.constantFrom('LGA 1700', 'LGA 1200', 'AM4', 'AM5'),
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
    manufacturer: fc.constantFrom('Corsair', 'G.Skill', 'Kingston'),
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
    manufacturer: fc.constantFrom('Samsung', 'WD', 'Crucial'),
    price: fc.integer({ min: 50, max: 500 }),
    specifications: fc.record({
        type: fc.constantFrom('M.2 NVMe', 'M.2 SATA', 'SATA SSD', 'SATA HDD'),
        capacity: fc.integer({ min: 256, max: 4000 }),
        readSpeed: fc.integer({ min: 500, max: 7000 }),
        writeSpeed: fc.integer({ min: 400, max: 6000 }),
    }) as fc.Arbitrary<StorageSpecifications>,
});

const psuArbitrary: fc.Arbitrary<Component> = fc.record({
    id: fc.uuid(),
    type: fc.constant('PSU' as const),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    manufacturer: fc.constantFrom('Corsair', 'EVGA', 'Seasonic'),
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
    }) as fc.Arbitrary<PSUSpecifications>,
});

const userPreferencesArbitrary: fc.Arbitrary<UserPreferences> = fc.record({
    budgetMin: fc.integer({ min: 500, max: 1500 }),
    budgetMax: fc.integer({ min: 1500, max: 5000 }),
    useCase: fc.constantFrom('gaming', 'productivity', 'mixed', 'content-creation'),
    performanceFocus: fc.constantFrom('GPU-heavy', 'CPU-heavy', 'balanced'),
    storageRequirements: fc.constantFrom('minimal', 'moderate', 'extensive'),
    upgradeHorizon: fc.constantFrom('1-year', '3-year', '5-year'),
});

const partialBuildArbitrary: fc.Arbitrary<PartialBuild> = fc.record({
    cpu: fc.option(cpuArbitrary, { nil: undefined }),
    gpu: fc.option(gpuArbitrary, { nil: undefined }),
    motherboard: fc.option(motherboardArbitrary, { nil: undefined }),
    ram: fc.option(ramArbitrary, { nil: undefined }),
    storage: fc.option(fc.array(storageArbitrary, { minLength: 0, maxLength: 3 }), { nil: undefined }),
    psu: fc.option(psuArbitrary, { nil: undefined }),
});

const completeBuildArbitrary: fc.Arbitrary<CompleteBuild> = fc.record({
    cpu: cpuArbitrary,
    gpu: gpuArbitrary,
    motherboard: motherboardArbitrary,
    ram: ramArbitrary,
    storage: fc.array(storageArbitrary, { minLength: 1, maxLength: 3 }),
    psu: psuArbitrary,
});

const buildContextArbitrary: fc.Arbitrary<BuildContext> = fc.record({
    currentBuild: partialBuildArbitrary,
    preferences: userPreferencesArbitrary,
    mode: fc.constantFrom('beginner', 'advanced'),
});

// Property 7: Trade-Off Explanation Generation
// Feature: pc-build-assistant, Property 7: Trade-Off Explanation Generation
// Validates: Requirements 3.1
describe('Property 7: Trade-Off Explanation Generation', () => {
    it('should generate non-empty explanations for 2-3 component options', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(cpuArbitrary, { minLength: 2, maxLength: 3 }),
                buildContextArbitrary,
                async (options, context) => {
                    const explanation = await generateTradeOffSummary(options, context);

                    // Property: Explanation must be non-empty
                    expect(explanation).toBeTruthy();
                    expect(explanation.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    it('should generate explanations for GPU options', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(gpuArbitrary, { minLength: 2, maxLength: 3 }),
                buildContextArbitrary,
                async (options, context) => {
                    const explanation = await generateTradeOffSummary(options, context);

                    expect(explanation).toBeTruthy();
                    expect(explanation.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    it('should generate explanations for motherboard options', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(motherboardArbitrary, { minLength: 2, maxLength: 3 }),
                buildContextArbitrary,
                async (options, context) => {
                    const explanation = await generateTradeOffSummary(options, context);

                    expect(explanation).toBeTruthy();
                    expect(explanation.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });
});

// Property 9: Why Not Explanation Generation
// Feature: pc-build-assistant, Property 9: Why Not Explanation Generation
// Validates: Requirements 4.1
describe('Property 9: Why Not Explanation Generation', () => {
    it('should generate non-empty explanations for any component', async () => {
        await fc.assert(
            fc.asyncProperty(
                cpuArbitrary,
                fc.option(cpuArbitrary, { nil: undefined }),
                buildContextArbitrary,
                async (component, selectedComponent, context) => {
                    const explanation = await generateWhyNotExplanation(component, selectedComponent, context);

                    // Property: Explanation must be non-empty
                    expect(explanation).toBeTruthy();
                    expect(explanation.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    it('should generate explanations for GPU components', async () => {
        await fc.assert(
            fc.asyncProperty(
                gpuArbitrary,
                fc.option(gpuArbitrary, { nil: undefined }),
                buildContextArbitrary,
                async (component, selectedComponent, context) => {
                    const explanation = await generateWhyNotExplanation(component, selectedComponent, context);

                    expect(explanation).toBeTruthy();
                    expect(explanation.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });
});

// Property 15: Conversational Query Response Generation
// Feature: pc-build-assistant, Property 15: Conversational Query Response Generation
// Validates: Requirements 7.1
describe('Property 15: Conversational Query Response Generation', () => {
    it('should generate non-empty responses for any query', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 5, maxLength: 100 }),
                partialBuildArbitrary,
                userPreferencesArbitrary,
                async (query, build, preferences) => {
                    const response = await answerQuery(query, build, preferences);

                    // Property: Response must be non-empty
                    expect(response).toBeTruthy();
                    expect(response.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    it('should handle compatibility queries', async () => {
        await fc.assert(
            fc.asyncProperty(
                partialBuildArbitrary,
                userPreferencesArbitrary,
                async (build, preferences) => {
                    const response = await answerQuery('Is this compatible?', build, preferences);

                    expect(response).toBeTruthy();
                    expect(response.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    it('should handle upgrade queries', async () => {
        await fc.assert(
            fc.asyncProperty(
                partialBuildArbitrary,
                userPreferencesArbitrary,
                async (build, preferences) => {
                    const response = await answerQuery('What can I upgrade?', build, preferences);

                    expect(response).toBeTruthy();
                    expect(response.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    it('should handle power queries', async () => {
        await fc.assert(
            fc.asyncProperty(
                partialBuildArbitrary,
                userPreferencesArbitrary,
                async (build, preferences) => {
                    const response = await answerQuery('How much power do I need?', build, preferences);

                    expect(response).toBeTruthy();
                    expect(response.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });
});

// Property 16: Complete Build Triggers Summary
// Property 17: Build Summary Completeness
// Feature: pc-build-assistant, Property 16 & 17: Build Summary Generation
// Validates: Requirements 8.1, 8.2, 8.3, 8.4
describe('Property 16 & 17: Build Summary Generation', () => {
    it('should generate complete summary for any complete build', async () => {
        await fc.assert(
            fc.asyncProperty(completeBuildArbitrary, async (build) => {
                const summary = await generateFinalSummary(build);

                // Property 16: Complete build triggers summary
                expect(summary).toBeTruthy();

                // Property 17: Summary must contain all required sections
                expect(summary.explanation).toBeTruthy();
                expect(summary.explanation.length).toBeGreaterThan(0);

                expect(summary.strengths).toBeTruthy();
                expect(Array.isArray(summary.strengths)).toBe(true);
                expect(summary.strengths.length).toBeGreaterThan(0);

                expect(summary.weaknesses).toBeTruthy();
                expect(Array.isArray(summary.weaknesses)).toBe(true);

                expect(summary.useCaseFit).toBeTruthy();
                expect(summary.useCaseFit.length).toBeGreaterThan(0);

                expect(summary.upgradeRecommendations).toBeTruthy();
                expect(Array.isArray(summary.upgradeRecommendations)).toBe(true);

                expect(summary.keyTradeOffs).toBeTruthy();
                expect(Array.isArray(summary.keyTradeOffs)).toBe(true);
                expect(summary.keyTradeOffs.length).toBeGreaterThan(0);
            }),
            { numRuns: 10 }
        );
    });

    it('should reference build components in explanation', async () => {
        await fc.assert(
            fc.asyncProperty(completeBuildArbitrary, async (build) => {
                const summary = await generateFinalSummary(build);

                // Property: Explanation should reference key components
                expect(summary.explanation).toContain(build.cpu.name);
                expect(summary.explanation).toContain(build.gpu.name);
            }),
            { numRuns: 10 }
        );
    });
});
