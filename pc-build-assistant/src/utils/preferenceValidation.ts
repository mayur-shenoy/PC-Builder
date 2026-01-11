/**
 * Preference Validation Utilities
 * Requirements: 1.4
 */

import { UserPreferences } from '../types/build';

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

/**
 * Validates user preferences for completeness and correctness
 * Requirements: 1.4
 */
export function validatePreferences(preferences: Partial<UserPreferences>): ValidationResult {
    const errors: Record<string, string> = {};

    // Check required fields
    if (preferences.budgetMin === undefined || preferences.budgetMin === null) {
        errors.budgetMin = 'Minimum budget is required';
    } else if (preferences.budgetMin <= 0) {
        errors.budgetMin = 'Minimum budget must be greater than 0';
    }

    if (preferences.budgetMax === undefined || preferences.budgetMax === null) {
        errors.budgetMax = 'Maximum budget is required';
    } else if (preferences.budgetMax <= 0) {
        errors.budgetMax = 'Maximum budget must be greater than 0';
    }

    if (preferences.budgetMin !== undefined && preferences.budgetMax !== undefined) {
        if (preferences.budgetMin >= preferences.budgetMax) {
            errors.budgetMax = 'Maximum budget must be greater than minimum budget';
        }
    }

    if (!preferences.useCase) {
        errors.useCase = 'Use case is required';
    } else if (!['gaming', 'productivity', 'mixed', 'content-creation'].includes(preferences.useCase)) {
        errors.useCase = 'Invalid use case';
    }

    if (!preferences.performanceFocus) {
        errors.performanceFocus = 'Performance focus is required';
    } else if (!['GPU-heavy', 'CPU-heavy', 'balanced'].includes(preferences.performanceFocus)) {
        errors.performanceFocus = 'Invalid performance focus';
    }

    if (!preferences.storageRequirements) {
        errors.storageRequirements = 'Storage requirements are required';
    } else if (!['minimal', 'moderate', 'extensive'].includes(preferences.storageRequirements)) {
        errors.storageRequirements = 'Invalid storage requirements';
    }

    if (!preferences.upgradeHorizon) {
        errors.upgradeHorizon = 'Upgrade horizon is required';
    } else if (!['1-year', '3-year', '5-year'].includes(preferences.upgradeHorizon)) {
        errors.upgradeHorizon = 'Invalid upgrade horizon';
    }

    // Optional fields validation
    if (preferences.powerConstraints !== undefined && preferences.powerConstraints <= 0) {
        errors.powerConstraints = 'Power constraints must be greater than 0';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Checks if preferences object has all required fields
 * Requirements: 1.4
 */
export function hasAllRequiredFields(preferences: Partial<UserPreferences>): boolean {
    return (
        preferences.budgetMin !== undefined &&
        preferences.budgetMax !== undefined &&
        preferences.useCase !== undefined &&
        preferences.performanceFocus !== undefined &&
        preferences.storageRequirements !== undefined &&
        preferences.upgradeHorizon !== undefined
    );
}
