/**
 * Property-Based Tests for Preference Validation
 * Feature: pc-build-assistant, Property 1: Preference Validation Completeness
 * Validates: Requirements 1.4
 */

import * as fc from 'fast-check';
import { validatePreferences, hasAllRequiredFields } from './preferenceValidation';
import { UserPreferences } from '../types/build';

describe('Preference Validation Property Tests', () => {
    // Arbitraries for generating test data
    const useCaseArbitrary = fc.constantFrom('gaming', 'productivity', 'mixed', 'content-creation');
    const performanceFocusArbitrary = fc.constantFrom('GPU-heavy', 'CPU-heavy', 'balanced');
    const storageRequirementsArbitrary = fc.constantFrom('minimal', 'moderate', 'extensive');
    const upgradeHorizonArbitrary = fc.constantFrom('1-year', '3-year', '5-year');

    const validPreferencesArbitrary = fc.record({
        budgetMin: fc.integer({ min: 100, max: 5000 }),
        budgetMax: fc.integer({ min: 5001, max: 20000 }),
        useCase: useCaseArbitrary,
        performanceFocus: performanceFocusArbitrary,
        storageRequirements: storageRequirementsArbitrary,
        upgradeHorizon: upgradeHorizonArbitrary,
        brandPreferences: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 5 }), { nil: undefined }),
        powerConstraints: fc.option(fc.integer({ min: 300, max: 2000 }), { nil: undefined }),
    });

    // Arbitrary for preferences with missing fields
    const incompletePreferencesArbitrary = fc.record(
        {
            budgetMin: fc.option(fc.integer({ min: 100, max: 5000 }), { nil: undefined }),
            budgetMax: fc.option(fc.integer({ min: 5001, max: 20000 }), { nil: undefined }),
            useCase: fc.option(useCaseArbitrary, { nil: undefined }),
            performanceFocus: fc.option(performanceFocusArbitrary, { nil: undefined }),
            storageRequirements: fc.option(storageRequirementsArbitrary, { nil: undefined }),
            upgradeHorizon: fc.option(upgradeHorizonArbitrary, { nil: undefined }),
        },
        { requiredKeys: [] }
    ).filter((prefs) => !hasAllRequiredFields(prefs));

    /**
     * Property 1: Preference Validation Completeness
     * For any user preference object with one or more missing required fields,
     * the validation function should reject it and prevent proceeding to component selection.
     * Validates: Requirements 1.4
     */
    test('Property 1: Incomplete preferences should be rejected', () => {
        fc.assert(
            fc.property(incompletePreferencesArbitrary, (preferences) => {
                const result = validatePreferences(preferences);

                // The validation should fail
                expect(result.isValid).toBe(false);

                // There should be at least one error
                expect(Object.keys(result.errors).length).toBeGreaterThan(0);

                // If a required field is missing, there should be an error for it
                if (preferences.budgetMin === undefined || preferences.budgetMin === null) {
                    expect(result.errors.budgetMin).toBeDefined();
                }
                if (preferences.budgetMax === undefined || preferences.budgetMax === null) {
                    expect(result.errors.budgetMax).toBeDefined();
                }
                if (!preferences.useCase) {
                    expect(result.errors.useCase).toBeDefined();
                }
                if (!preferences.performanceFocus) {
                    expect(result.errors.performanceFocus).toBeDefined();
                }
                if (!preferences.storageRequirements) {
                    expect(result.errors.storageRequirements).toBeDefined();
                }
                if (!preferences.upgradeHorizon) {
                    expect(result.errors.upgradeHorizon).toBeDefined();
                }
            }),
            { numRuns: 100 }
        );
    });

    /**
     * Property 1 (Inverse): Complete and valid preferences should be accepted
     * For any user preference object with all required fields present and valid,
     * the validation function should accept it.
     * Validates: Requirements 1.4
     */
    test('Property 1 (Inverse): Complete and valid preferences should be accepted', () => {
        fc.assert(
            fc.property(validPreferencesArbitrary, (preferences) => {
                const result = validatePreferences(preferences);

                // The validation should succeed
                expect(result.isValid).toBe(true);

                // There should be no errors
                expect(Object.keys(result.errors).length).toBe(0);
            }),
            { numRuns: 100 }
        );
    });

    /**
     * Property 1 (Edge Case): Invalid budget ranges should be rejected
     * For any preferences where budgetMin >= budgetMax, validation should fail
     * Validates: Requirements 1.4
     */
    test('Property 1 (Edge Case): Invalid budget ranges should be rejected', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1000, max: 10000 }),
                useCaseArbitrary,
                performanceFocusArbitrary,
                storageRequirementsArbitrary,
                upgradeHorizonArbitrary,
                (budget, useCase, performanceFocus, storageRequirements, upgradeHorizon) => {
                    const preferences: Partial<UserPreferences> = {
                        budgetMin: budget,
                        budgetMax: budget - 1, // Invalid: max < min
                        useCase,
                        performanceFocus,
                        storageRequirements,
                        upgradeHorizon,
                    };

                    const result = validatePreferences(preferences);

                    // The validation should fail
                    expect(result.isValid).toBe(false);

                    // There should be an error about the budget
                    expect(result.errors.budgetMax).toBeDefined();
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property 1 (Edge Case): Zero or negative budgets should be rejected
     * For any preferences with budgetMin or budgetMax <= 0, validation should fail
     * Validates: Requirements 1.4
     */
    test('Property 1 (Edge Case): Zero or negative budgets should be rejected', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: -1000, max: 0 }),
                useCaseArbitrary,
                performanceFocusArbitrary,
                storageRequirementsArbitrary,
                upgradeHorizonArbitrary,
                (invalidBudget, useCase, performanceFocus, storageRequirements, upgradeHorizon) => {
                    const preferences: Partial<UserPreferences> = {
                        budgetMin: invalidBudget,
                        budgetMax: 2000,
                        useCase,
                        performanceFocus,
                        storageRequirements,
                        upgradeHorizon,
                    };

                    const result = validatePreferences(preferences);

                    // The validation should fail
                    expect(result.isValid).toBe(false);

                    // There should be an error about budgetMin
                    expect(result.errors.budgetMin).toBeDefined();
                }
            ),
            { numRuns: 100 }
        );
    });
});
