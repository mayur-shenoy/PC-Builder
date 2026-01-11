/**
 * Compatibility Engine - Validates component combinations
 * Requirements: 9.1, 9.2, 9.3, 9.4, 2.1, 2.4, 2.5
 */

import {
    Component,
    ComponentType,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    PSUSpecifications,
} from '../types/components';
import { PartialBuild, CompatibilityConstraints, UserPreferences } from '../types/build';

export interface CompatibilityResult {
    isCompatible: boolean;
    violations: CompatibilityViolation[];
}

export interface CompatibilityViolation {
    rule: string;
    message: string;
    conflictingComponent?: Component;
}

/**
 * Validates CPU-Motherboard socket compatibility
 * Requirements: 9.1
 * @param cpu - The CPU component to validate
 * @param motherboard - The motherboard component to validate against
 * @returns CompatibilityResult indicating if the CPU socket matches the motherboard socket
 */
export function validateCPUMotherboard(
    cpu: Component,
    motherboard: Component
): CompatibilityResult {
    const cpuSpecs = cpu.specifications as CPUSpecifications;
    const moboSpecs = motherboard.specifications as MotherboardSpecifications;

    const isCompatible = cpuSpecs.socket === moboSpecs.socket;

    return {
        isCompatible,
        violations: isCompatible
            ? []
            : [
                {
                    rule: 'CPU_MOTHERBOARD_SOCKET',
                    message: `CPU socket ${cpuSpecs.socket} does not match motherboard socket ${moboSpecs.socket}`,
                    conflictingComponent: motherboard,
                },
            ],
    };
}

/**
 * Validates RAM-Motherboard type and speed compatibility
 * Requirements: 9.2
 * @param ram - The RAM component to validate
 * @param motherboard - The motherboard component to validate against
 * @returns CompatibilityResult indicating if RAM type and speed are compatible
 */
export function validateRAMMotherboard(
    ram: Component,
    motherboard: Component
): CompatibilityResult {
    const ramSpecs = ram.specifications as RAMSpecifications;
    const moboSpecs = motherboard.specifications as MotherboardSpecifications;

    const violations: CompatibilityViolation[] = [];

    // Check RAM type compatibility
    if (ramSpecs.type !== moboSpecs.ramType) {
        violations.push({
            rule: 'RAM_TYPE_COMPATIBILITY',
            message: `RAM type ${ramSpecs.type} does not match motherboard supported type ${moboSpecs.ramType}`,
            conflictingComponent: motherboard,
        });
    }

    // Check RAM speed compatibility
    if (ramSpecs.speed > moboSpecs.maxRamSpeed) {
        violations.push({
            rule: 'RAM_SPEED_COMPATIBILITY',
            message: `RAM speed ${ramSpecs.speed}MHz exceeds motherboard maximum ${moboSpecs.maxRamSpeed}MHz`,
            conflictingComponent: motherboard,
        });
    }

    return {
        isCompatible: violations.length === 0,
        violations,
    };
}

/**
 * Validates PSU wattage sufficiency for all components
 * Requirements: 9.3
 * @param psu - The PSU component to validate
 * @param build - The current build state with selected components
 * @returns CompatibilityResult indicating if PSU wattage is sufficient
 */
export function validatePSUWattage(
    psu: Component,
    build: PartialBuild
): CompatibilityResult {
    const psuSpecs = psu.specifications as PSUSpecifications;

    // Calculate total power draw
    let totalPowerDraw = 0;

    // Add CPU power draw
    if (build.cpu) {
        const cpuSpecs = build.cpu.specifications as CPUSpecifications;
        totalPowerDraw += cpuSpecs.tdp;
    }

    // Add GPU power draw
    if (build.gpu) {
        const gpuSpecs = build.gpu.specifications as GPUSpecifications;
        totalPowerDraw += gpuSpecs.powerDraw;
    }

    // Add motherboard base power (estimated at 80W)
    if (build.motherboard) {
        totalPowerDraw += 80;
    }

    // Add RAM power (estimated at 3W per module)
    if (build.ram) {
        const ramSpecs = build.ram.specifications as RAMSpecifications;
        totalPowerDraw += ramSpecs.modules * 3;
    }

    // Add storage power (estimated at 5W per drive)
    if (build.storage) {
        totalPowerDraw += build.storage.length * 5;
    }

    // Calculate required wattage with 20% headroom
    const requiredWattage = totalPowerDraw * 1.2;

    const isCompatible = psuSpecs.wattage >= requiredWattage;

    return {
        isCompatible,
        violations: isCompatible
            ? []
            : [
                {
                    rule: 'PSU_WATTAGE_SUFFICIENCY',
                    message: `PSU wattage ${psuSpecs.wattage}W is insufficient. Required: ${Math.ceil(requiredWattage)}W (${totalPowerDraw}W + 20% headroom)`,
                },
            ],
    };
}

/**
 * Validates physical form factor compatibility
 * Requirements: 9.4
 * @param component - The component to validate
 * @param build - The current build state with selected components
 * @returns CompatibilityResult indicating if form factors are compatible
 */
export function validateFormFactors(
    component: Component,
    build: PartialBuild
): CompatibilityResult {
    const violations: CompatibilityViolation[] = [];

    // Validate GPU length if component is a GPU and motherboard is selected
    if (component.type === 'GPU' && build.motherboard) {
        const gpuSpecs = component.specifications as GPUSpecifications;
        const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;

        // Check if GPU requires more PCI slots than available
        if (gpuSpecs.pciSlots > moboSpecs.pciSlots) {
            violations.push({
                rule: 'GPU_PCI_SLOTS',
                message: `GPU requires ${gpuSpecs.pciSlots} PCI slots but motherboard only has ${moboSpecs.pciSlots}`,
                conflictingComponent: build.motherboard,
            });
        }
    }

    // Validate motherboard form factor constraints
    if (component.type === 'Motherboard') {
        const moboSpecs = component.specifications as MotherboardSpecifications;

        // Check if GPU fits with this motherboard form factor
        if (build.gpu) {
            const gpuSpecs = build.gpu.specifications as GPUSpecifications;

            // Mini-ITX has stricter GPU length constraints (typically 210mm)
            if (moboSpecs.formFactor === 'Mini-ITX' && gpuSpecs.length > 210) {
                violations.push({
                    rule: 'FORM_FACTOR_GPU_LENGTH',
                    message: `GPU length ${gpuSpecs.length}mm may not fit in Mini-ITX form factor (typical max: 210mm)`,
                    conflictingComponent: build.gpu,
                });
            }
        }
    }

    return {
        isCompatible: violations.length === 0,
        violations,
    };
}

/**
 * Filters components to only return compatible options
 * Requirements: 2.1, 2.4, 2.5
 * @param componentType - The type of component to filter
 * @param currentBuild - The current build state
 * @param allComponents - All available components of the specified type
 * @param brandPreferences - Optional array of preferred brand names
 * @param userPreferences - Optional user preferences for advanced filtering
 * @returns Array of compatible components
 */
export function filterCompatibleComponents(
    componentType: ComponentType,
    currentBuild: PartialBuild,
    allComponents: Component[],
    brandPreferences?: string[],
    userPreferences?: UserPreferences
): Component[] {
    // First filter by compatibility
    let filtered = allComponents.filter((component) => {
        const result = validateCompatibility(component, currentBuild);
        return result.isCompatible;
    });

    console.log(`[Brand Filter] Component type: ${componentType}`);
    console.log(`[Brand Filter] Brand preferences:`, brandPreferences);
    console.log(`[Brand Filter] Compatible components before brand filter:`, filtered.length);

    // Apply brand filtering if preferences are set
    if (brandPreferences && brandPreferences.length > 0) {
        // Normalize brand names for comparison (lowercase, trimmed)
        const normalizedPrefs = brandPreferences.map(b => b.toLowerCase().trim());
        console.log(`[Brand Filter] Normalized preferences:`, normalizedPrefs);

        // Filter by brand - check manufacturer field
        const brandFiltered = filtered.filter((component) => {
            const manufacturer = (component.manufacturer || '').toLowerCase().trim();
            console.log(`[Brand Filter] Checking ${component.name}, manufacturer: "${manufacturer}"`);

            // Check if any preference matches the manufacturer
            const matches = normalizedPrefs.some(pref => {
                const isMatch = manufacturer === pref ||
                    manufacturer.includes(pref) ||
                    pref.includes(manufacturer);
                if (isMatch) {
                    console.log(`[Brand Filter] Match found: "${manufacturer}" matches "${pref}"`);
                }
                return isMatch;
            });

            return matches;
        });

        console.log(`[Brand Filter] Components after brand filter:`, brandFiltered.length);
        console.log(`[Brand Filter] Filtered components:`, brandFiltered.map(c => c.name));

        // If brand filtering results in components, use them
        // Otherwise fall back to all compatible components
        if (brandFiltered.length > 0) {
            filtered = brandFiltered;
        } else {
            console.log(`[Brand Filter] No matches found, falling back to all compatible components`);
        }
    }

    // Apply advanced user preference filters
    if (userPreferences) {
        filtered = applyAdvancedFilters(filtered, componentType, userPreferences);
    }

    return filtered;
}

/**
 * Applies advanced user preference filters to components
 */
function applyAdvancedFilters(
    components: Component[],
    componentType: ComponentType,
    prefs: UserPreferences
): Component[] {
    let filtered = components;

    // Filter CPUs by minimum cores and integrated graphics requirement
    if (componentType === 'CPU') {
        if (prefs.minimumCores) {
            const coreFiltered = filtered.filter(c => {
                const specs = c.specifications as CPUSpecifications;
                return specs.cores >= prefs.minimumCores!;
            });
            if (coreFiltered.length > 0) filtered = coreFiltered;
        }
        if (prefs.requireIntegratedGraphics) {
            const igpuFiltered = filtered.filter(c => {
                const specs = c.specifications as CPUSpecifications;
                return specs.integratedGraphics === true;
            });
            if (igpuFiltered.length > 0) filtered = igpuFiltered;
        }
    }

    // Filter GPUs by minimum VRAM
    if (componentType === 'GPU' && prefs.minimumVRAM) {
        const vramFiltered = filtered.filter(c => {
            const specs = c.specifications as GPUSpecifications;
            return specs.vram >= prefs.minimumVRAM!;
        });
        if (vramFiltered.length > 0) filtered = vramFiltered;
    }

    // Filter Motherboards by form factor and RAM type
    if (componentType === 'Motherboard') {
        if (prefs.preferredFormFactor) {
            const formFactorFiltered = filtered.filter(c => {
                const specs = c.specifications as MotherboardSpecifications;
                return specs.formFactor === prefs.preferredFormFactor;
            });
            if (formFactorFiltered.length > 0) filtered = formFactorFiltered;
        }
        if (prefs.preferredRamType) {
            const ramTypeFiltered = filtered.filter(c => {
                const specs = c.specifications as MotherboardSpecifications;
                return specs.ramType === prefs.preferredRamType;
            });
            if (ramTypeFiltered.length > 0) filtered = ramTypeFiltered;
        }
    }

    // Filter RAM by type
    if (componentType === 'RAM' && prefs.preferredRamType) {
        const ramFiltered = filtered.filter(c => {
            const specs = c.specifications as RAMSpecifications;
            return specs.type === prefs.preferredRamType;
        });
        if (ramFiltered.length > 0) filtered = ramFiltered;
    }

    // Filter PSUs by efficiency rating
    if (componentType === 'PSU' && prefs.psuEfficiencyRating) {
        const efficiencyOrder = ['80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'];
        const minIndex = efficiencyOrder.indexOf(prefs.psuEfficiencyRating);

        if (minIndex >= 0) {
            const psuFiltered = filtered.filter(c => {
                const specs = c.specifications as PSUSpecifications;
                const specIndex = efficiencyOrder.indexOf(specs.efficiency);
                return specIndex >= minIndex;
            });
            if (psuFiltered.length > 0) filtered = psuFiltered;
        }
    }

    return filtered;
}

/**
 * Validates if a component is compatible with the current build
 * @param component - The component to validate
 * @param currentBuild - The current build state
 * @returns CompatibilityResult with all violations
 */
export function validateCompatibility(
    component: Component,
    currentBuild: PartialBuild
): CompatibilityResult {
    const allViolations: CompatibilityViolation[] = [];

    // Validate CPU-Motherboard compatibility
    if (component.type === 'CPU' && currentBuild.motherboard) {
        const result = validateCPUMotherboard(component, currentBuild.motherboard);
        allViolations.push(...result.violations);
    }

    if (component.type === 'Motherboard' && currentBuild.cpu) {
        const result = validateCPUMotherboard(currentBuild.cpu, component);
        allViolations.push(...result.violations);
    }

    // Validate RAM-Motherboard compatibility
    if (component.type === 'RAM' && currentBuild.motherboard) {
        const result = validateRAMMotherboard(component, currentBuild.motherboard);
        allViolations.push(...result.violations);
    }

    if (component.type === 'Motherboard' && currentBuild.ram) {
        const result = validateRAMMotherboard(currentBuild.ram, component);
        allViolations.push(...result.violations);
    }

    // Validate PSU wattage
    if (component.type === 'PSU') {
        const result = validatePSUWattage(component, currentBuild);
        allViolations.push(...result.violations);
    }

    // Validate form factors
    const formFactorResult = validateFormFactors(component, currentBuild);
    allViolations.push(...formFactorResult.violations);

    return {
        isCompatible: allViolations.length === 0,
        violations: allViolations,
    };
}

/**
 * Computes compatibility constraints based on current build
 * Requirements: 2.5
 * @param currentBuild - The current build state
 * @returns CompatibilityConstraints object with all active constraints
 */
export function getCompatibilityConstraints(
    currentBuild: PartialBuild
): CompatibilityConstraints {
    const constraints: CompatibilityConstraints = {};

    // Extract socket constraint from CPU or Motherboard
    if (currentBuild.cpu) {
        const cpuSpecs = currentBuild.cpu.specifications as CPUSpecifications;
        constraints.requiredSocket = cpuSpecs.socket;
    }

    if (currentBuild.motherboard) {
        const moboSpecs = currentBuild.motherboard.specifications as MotherboardSpecifications;
        constraints.requiredSocket = moboSpecs.socket;
        constraints.requiredRamType = moboSpecs.ramType;
        constraints.maxRamSpeed = moboSpecs.maxRamSpeed;
        constraints.requiredFormFactor = moboSpecs.formFactor;
        constraints.availableM2Slots = moboSpecs.m2Slots;
        constraints.availableSATAPorts = moboSpecs.sataPorts;
    }

    // Calculate minimum PSU wattage
    let totalPowerDraw = 0;

    if (currentBuild.cpu) {
        const cpuSpecs = currentBuild.cpu.specifications as CPUSpecifications;
        totalPowerDraw += cpuSpecs.tdp;
    }

    if (currentBuild.gpu) {
        const gpuSpecs = currentBuild.gpu.specifications as GPUSpecifications;
        totalPowerDraw += gpuSpecs.powerDraw;
    }

    if (currentBuild.motherboard) {
        totalPowerDraw += 80; // Motherboard base power
    }

    if (currentBuild.ram) {
        const ramSpecs = currentBuild.ram.specifications as RAMSpecifications;
        totalPowerDraw += ramSpecs.modules * 3;
    }

    if (currentBuild.storage) {
        totalPowerDraw += currentBuild.storage.length * 5;
    }

    if (totalPowerDraw > 0) {
        constraints.minimumPSUWattage = Math.ceil(totalPowerDraw * 1.2);
    }

    // Extract required power connectors from GPU
    if (currentBuild.gpu) {
        const gpuSpecs = currentBuild.gpu.specifications as GPUSpecifications;
        constraints.requiredPowerConnectors = gpuSpecs.powerConnectors;
    }

    return constraints;
}
