/**
 * Build Metrics Computation Service
 * Requirements: 5.1, 5.2, 5.5
 */

import {
    PartialBuild,
    BuildMetrics,
} from '../types/build';
import {
    Component,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    PSUSpecifications,
} from '../types/components';

/**
 * Classifies build strategy based on component price ratios and specifications
 * Requirements: 5.1, 5.2
 * @param build - The current build state
 * @returns Build strategy tag: 'GPU-heavy', 'CPU-heavy', 'Balanced', or 'Power-efficient'
 */
export function classifyBuildStrategy(
    build: PartialBuild
): 'GPU-heavy' | 'CPU-heavy' | 'Balanced' | 'Power-efficient' {
    // Calculate total build cost
    const totalCost = calculateTotalCost(build);

    if (totalCost === 0) {
        return 'Balanced'; // Default for empty builds
    }

    // Calculate component cost percentages
    const gpuCostPercent = build.gpu ? (build.gpu.price / totalCost) * 100 : 0;
    const cpuCostPercent = build.cpu ? (build.cpu.price / totalCost) * 100 : 0;

    // Calculate total power draw
    let totalPowerDraw = 0;
    if (build.cpu) {
        const cpuSpecs = build.cpu.specifications as CPUSpecifications;
        totalPowerDraw += cpuSpecs.tdp;
    }
    if (build.gpu) {
        const gpuSpecs = build.gpu.specifications as GPUSpecifications;
        totalPowerDraw += gpuSpecs.powerDraw;
    }
    if (build.motherboard) {
        totalPowerDraw += 80; // Motherboard base power
    }
    if (build.ram) {
        const ramSpecs = build.ram.specifications as RAMSpecifications;
        totalPowerDraw += ramSpecs.modules * 3;
    }
    if (build.storage) {
        totalPowerDraw += build.storage.length * 5;
    }

    // Power-efficient: Low total power draw (< 200W)
    if (totalPowerDraw > 0 && totalPowerDraw < 200) {
        return 'Power-efficient';
    }

    // GPU-heavy: GPU cost is > 40% of total budget
    if (gpuCostPercent > 40) {
        return 'GPU-heavy';
    }

    // CPU-heavy: CPU cost is > 30% of total budget and GPU cost is < 25%
    if (cpuCostPercent > 30 && gpuCostPercent < 25) {
        return 'CPU-heavy';
    }

    // Balanced: Everything else
    return 'Balanced';
}

/**
 * Helper function to calculate total build cost
 * @param build - The current build state
 * @returns Total cost of all selected components
 */
function calculateTotalCost(build: PartialBuild): number {
    let total = 0;

    if (build.cpu) total += build.cpu.price;
    if (build.gpu) total += build.gpu.price;
    if (build.motherboard) total += build.motherboard.price;
    if (build.ram) total += build.ram.price;
    if (build.psu) total += build.psu.price;
    if (build.storage) {
        total += build.storage.reduce((sum, storage) => sum + storage.price, 0);
    }

    return total;
}

/**
 * Calculates budget distribution across component types
 * Requirements: 5.1
 * @param build - The current build state
 * @returns Record mapping component types to percentage of total budget
 */
export function calculateBudgetDistribution(
    build: PartialBuild
): Record<string, number> {
    const totalCost = calculateTotalCost(build);

    if (totalCost === 0) {
        return {};
    }

    const distribution: Record<string, number> = {};

    if (build.cpu) {
        distribution['CPU'] = (build.cpu.price / totalCost) * 100;
    }
    if (build.gpu) {
        distribution['GPU'] = (build.gpu.price / totalCost) * 100;
    }
    if (build.motherboard) {
        distribution['Motherboard'] = (build.motherboard.price / totalCost) * 100;
    }
    if (build.ram) {
        distribution['RAM'] = (build.ram.price / totalCost) * 100;
    }
    if (build.psu) {
        distribution['PSU'] = (build.psu.price / totalCost) * 100;
    }
    if (build.storage && build.storage.length > 0) {
        const storageCost = build.storage.reduce((sum, storage) => sum + storage.price, 0);
        distribution['Storage'] = (storageCost / totalCost) * 100;
    }

    return distribution;
}

/**
 * Estimates CPU/GPU bottleneck percentage using simple heuristics
 * Requirements: 5.1
 * @param build - The current build state
 * @returns Bottleneck percentage (0-100, where 0 = perfectly balanced, 100 = severe bottleneck)
 */
export function estimateBottleneck(build: PartialBuild): number {
    // If either CPU or GPU is missing, return 0 (no bottleneck can be calculated)
    if (!build.cpu || !build.gpu) {
        return 0;
    }

    const cpuSpecs = build.cpu.specifications as CPUSpecifications;
    const gpuSpecs = build.gpu.specifications as GPUSpecifications;

    // Simple heuristic: Compare CPU performance (cores * boost clock) to GPU performance score
    // Normalize both to a 0-100 scale for comparison

    // CPU performance metric (cores * GHz, typical range: 20-200)
    const cpuPerformance = cpuSpecs.cores * cpuSpecs.boostClock;

    // Handle NaN or invalid values
    if (!isFinite(cpuPerformance) || !isFinite(gpuSpecs.performanceScore)) {
        return 0;
    }

    const normalizedCPU = Math.min(100, (cpuPerformance / 200) * 100);

    // GPU performance score (already 0-100 scale in our mock data)
    const normalizedGPU = Math.min(100, gpuSpecs.performanceScore);

    // Calculate imbalance: larger difference = higher bottleneck
    const imbalance = Math.abs(normalizedCPU - normalizedGPU);

    // Convert to bottleneck percentage (0-50 scale, where 50 = maximum bottleneck)
    // We cap at 50% to represent realistic bottleneck scenarios
    return Math.min(50, imbalance / 2);
}

/**
 * Calculates upgrade flexibility score based on motherboard features, PSU headroom, and expandability
 * Requirements: 5.1
 * @param build - The current build state
 * @returns Upgrade flexibility score (0-100, where 100 = maximum flexibility)
 */
export function calculateUpgradeFlexibility(build: PartialBuild): number {
    let score = 0;
    let maxScore = 0;

    // Motherboard features (40 points max)
    if (build.motherboard) {
        maxScore += 40;
        const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;

        // RAM expansion potential (15 points)
        const ramSlotsUsed = build.ram ? (build.ram.specifications as RAMSpecifications).modules : 0;
        const ramSlotsAvailable = Math.max(0, moboSpecs.ramSlots - ramSlotsUsed);
        score += (ramSlotsAvailable / moboSpecs.ramSlots) * 15;

        // Storage expansion potential (15 points)
        const storageUsed = build.storage ? build.storage.length : 0;
        const totalStorageSlots = moboSpecs.m2Slots + moboSpecs.sataPorts;
        const storageAvailable = Math.max(0, totalStorageSlots - storageUsed);
        score += (storageAvailable / totalStorageSlots) * 15;

        // PCI slots for GPU upgrades (10 points)
        const pciSlotsUsed = build.gpu ? (build.gpu.specifications as GPUSpecifications).pciSlots : 0;
        const pciSlotsAvailable = Math.max(0, moboSpecs.pciSlots - pciSlotsUsed);
        score += (pciSlotsAvailable / moboSpecs.pciSlots) * 10;
    }

    // PSU headroom (40 points max)
    if (build.psu) {
        maxScore += 40;
        const psuSpecs = build.psu.specifications as PSUSpecifications;

        // Calculate current power usage
        let currentPowerDraw = 0;
        if (build.cpu) {
            currentPowerDraw += (build.cpu.specifications as CPUSpecifications).tdp;
        }
        if (build.gpu) {
            currentPowerDraw += (build.gpu.specifications as GPUSpecifications).powerDraw;
        }
        if (build.motherboard) {
            currentPowerDraw += 80; // Motherboard base
        }
        if (build.ram) {
            currentPowerDraw += (build.ram.specifications as RAMSpecifications).modules * 3;
        }
        if (build.storage) {
            currentPowerDraw += build.storage.length * 5;
        }

        // Calculate headroom percentage
        const headroom = Math.max(0, psuSpecs.wattage - currentPowerDraw);
        const headroomPercent = (headroom / psuSpecs.wattage) * 100;

        // Score based on headroom (more headroom = better upgrade potential)
        // 30%+ headroom = full points, 0% headroom = 0 points
        score += Math.min(40, Math.max(0, (headroomPercent / 30) * 40));
    }

    // Form factor flexibility (20 points max)
    if (build.motherboard) {
        maxScore += 20;
        const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;

        // Larger form factors = more flexibility
        if (moboSpecs.formFactor === 'ATX') {
            score += 20;
        } else if (moboSpecs.formFactor === 'Micro-ATX') {
            score += 12;
        } else if (moboSpecs.formFactor === 'Mini-ITX') {
            score += 5;
        }
    }

    // Normalize to 0-100 scale
    if (maxScore === 0) {
        return 0;
    }

    return Math.round((score / maxScore) * 100);
}

/**
 * Computes complete build metrics by combining all metric calculations
 * Requirements: 5.1, 5.2
 * @param build - The current build state
 * @returns Complete BuildMetrics object with all computed metrics
 */
export function computeBuildMetrics(build: PartialBuild): BuildMetrics {
    return {
        strategy: classifyBuildStrategy(build),
        budgetDistribution: calculateBudgetDistribution(build),
        bottleneckPercentage: estimateBottleneck(build),
        upgradeFlexibility: calculateUpgradeFlexibility(build),
    };
}
