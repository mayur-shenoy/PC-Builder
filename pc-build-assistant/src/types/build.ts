/**
 * Build and preference type definitions for PC Build Assistant
 * Validates: Requirements 1.1, 5.1, 10.3
 */

import { Component } from './components';

export interface UserPreferences {
    budgetMin: number;
    budgetMax: number;
    useCase: 'gaming' | 'productivity' | 'mixed' | 'content-creation';
    performanceFocus: 'GPU-heavy' | 'CPU-heavy' | 'balanced';
    storageRequirements: 'minimal' | 'moderate' | 'extensive';
    upgradeHorizon: '1-year' | '3-year' | '5-year';
    brandPreferences?: string[];
    powerConstraints?: number;
    // Advanced constraints
    preferredRamType?: 'DDR4' | 'DDR5';
    preferredFormFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
    minimumCores?: number;
    minimumVRAM?: number;
    requireIntegratedGraphics?: boolean;
    psuEfficiencyRating?: '80+ Bronze' | '80+ Gold' | '80+ Platinum';
}

export interface PartialBuild {
    cpu?: Component;
    gpu?: Component;
    motherboard?: Component;
    ram?: Component;
    storage?: Component[];
    psu?: Component;
}

export interface CompleteBuild extends PartialBuild {
    cpu: Component;
    gpu: Component;
    motherboard: Component;
    ram: Component;
    storage: Component[];
    psu: Component;
}

export interface BuildMetrics {
    strategy: 'GPU-heavy' | 'CPU-heavy' | 'Balanced' | 'Power-efficient';
    budgetDistribution: Record<string, number>;
    bottleneckPercentage: number;
    upgradeFlexibility: number;
}

export interface CompatibilityConstraints {
    requiredSocket?: string;
    requiredRamType?: 'DDR4' | 'DDR5';
    maxRamSpeed?: number;
    requiredFormFactor?: string;
    minimumPSUWattage?: number;
    requiredPowerConnectors?: string[];
    availableM2Slots?: number;
    availableSATAPorts?: number;
}
