/**
 * PCArchitectureVisual Component
 * Requirements: 6.1, 6.2, 6.3, 6.4
 * 
 * Visual representation of PC build showing:
 * - Component boxes with labels
 * - Connection lines between related components
 * - Compatibility status indicators
 * - Dynamic updates when components are selected
 */

import React from 'react';
import { PartialBuild } from '../types/build';
import { ComponentType } from '../types/components';
import './PCArchitectureVisual.css';

export interface PCArchitectureVisualProps {
    build: PartialBuild;
    highlightCompatibility?: boolean;
    currentStep?: ComponentType;
}

/**
 * PCArchitectureVisual component
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export const PCArchitectureVisual: React.FC<PCArchitectureVisualProps> = ({
    build,
    highlightCompatibility = true,
    currentStep
}) => {
    // Component positions in the visual layout
    // Component positions in the visual layout
    const componentPositions = {
        CPU: { x: 240, y: 80 },
        Motherboard: { x: 240, y: 220 },
        RAM: { x: 440, y: 220 },
        GPU: { x: 40, y: 360 },
        Storage: { x: 240, y: 360 },
        PSU: { x: 440, y: 360 }
    };

    // Define component relationships (connections)
    const connections = [
        { from: 'CPU', to: 'Motherboard', label: 'Socket' },
        { from: 'RAM', to: 'Motherboard', label: 'Memory' },
        { from: 'GPU', to: 'Motherboard', label: 'PCIe' },
        { from: 'Storage', to: 'Motherboard', label: 'Data' },
        { from: 'PSU', to: 'Motherboard', label: 'Power' }
    ];

    /**
     * Check if a connection is compatible based on selected components
     * Requirements: 6.3, 6.4
     * 
     * This function validates component relationships:
     * - CPU-Motherboard: Socket compatibility
     * - RAM-Motherboard: Memory type compatibility
     * - GPU-PSU: Power sufficiency
     * - GPU-Motherboard: PCIe slot availability
     * - Storage-Motherboard: Interface availability
     * - PSU-Motherboard: Power delivery
     */
    const isConnectionCompatible = (from: string, to: string): boolean => {
        const fromComponent = build[from.toLowerCase() as keyof PartialBuild];
        const toComponent = build[to.toLowerCase() as keyof PartialBuild];

        // If either component is not selected, connection is neutral
        if (!fromComponent || !toComponent) {
            return true;
        }

        // Check specific compatibility rules
        // CPU-Motherboard: Socket matching (Requirement 9.1)
        if (from === 'CPU' && to === 'Motherboard') {
            const cpu = build.cpu;
            const motherboard = build.motherboard;
            if (cpu && motherboard) {
                const cpuSpecs = cpu.specifications as any;
                const mbSpecs = motherboard.specifications as any;
                return cpuSpecs.socket === mbSpecs.socket;
            }
        }

        // RAM-Motherboard: Type and speed compatibility (Requirement 9.2)
        if (from === 'RAM' && to === 'Motherboard') {
            const ram = build.ram;
            const motherboard = build.motherboard;
            if (ram && motherboard) {
                const ramSpecs = ram.specifications as any;
                const mbSpecs = motherboard.specifications as any;
                return ramSpecs.type === mbSpecs.ramType && ramSpecs.speed <= mbSpecs.maxRamSpeed;
            }
        }

        // GPU-PSU: Power sufficiency (Requirement 9.3)
        if (from === 'GPU' && to === 'PSU') {
            const gpu = build.gpu;
            const psu = build.psu;
            if (gpu && psu) {
                const gpuSpecs = gpu.specifications as any;
                const psuSpecs = psu.specifications as any;
                // PSU should have at least 20% headroom
                const totalPowerDraw = calculateTotalPowerDraw();
                return psuSpecs.wattage >= totalPowerDraw * 1.2;
            }
        }

        // GPU-Motherboard: PCIe slot availability
        if (from === 'GPU' && to === 'Motherboard') {
            const gpu = build.gpu;
            const motherboard = build.motherboard;
            if (gpu && motherboard) {
                const gpuSpecs = gpu.specifications as any;
                const mbSpecs = motherboard.specifications as any;
                return mbSpecs.pciSlots >= gpuSpecs.pciSlots;
            }
        }

        // Storage-Motherboard: Interface availability
        if (from === 'Storage' && to === 'Motherboard') {
            const storage = build.storage;
            const motherboard = build.motherboard;
            if (storage && motherboard && Array.isArray(storage)) {
                const mbSpecs = motherboard.specifications as any;
                const m2Count = storage.filter(s => {
                    const specs = s.specifications as any;
                    return specs.type.includes('M.2');
                }).length;
                const sataCount = storage.filter(s => {
                    const specs = s.specifications as any;
                    return specs.type.includes('SATA');
                }).length;
                return m2Count <= mbSpecs.m2Slots && sataCount <= mbSpecs.sataPorts;
            }
        }

        // PSU-Motherboard: Always compatible (power delivery)
        if (from === 'PSU' && to === 'Motherboard') {
            return true;
        }

        // CPU-PSU: Power sufficiency
        if (from === 'CPU' && to === 'PSU') {
            const cpu = build.cpu;
            const psu = build.psu;
            if (cpu && psu) {
                const cpuSpecs = cpu.specifications as any;
                const psuSpecs = psu.specifications as any;
                const totalPowerDraw = calculateTotalPowerDraw();
                return psuSpecs.wattage >= totalPowerDraw * 1.2;
            }
        }

        // Default to compatible if no specific rule
        return true;
    };

    /**
     * Calculate total power draw of all components
     */
    const calculateTotalPowerDraw = (): number => {
        let total = 0;

        if (build.cpu) {
            const cpuSpecs = build.cpu.specifications as any;
            total += cpuSpecs.tdp || 0;
        }

        if (build.gpu) {
            const gpuSpecs = build.gpu.specifications as any;
            total += gpuSpecs.powerDraw || 0;
        }

        // Add base power for other components (motherboard, RAM, storage)
        total += 50; // Motherboard base
        if (build.ram) total += 10; // RAM
        if (build.storage) total += build.storage.length * 10; // Storage

        return total;
    };

    /**
     * Get the status class for a connection line
     */
    const getConnectionStatus = (from: string, to: string): string => {
        if (!highlightCompatibility) {
            return 'neutral';
        }

        const fromComponent = build[from.toLowerCase() as keyof PartialBuild];
        const toComponent = build[to.toLowerCase() as keyof PartialBuild];

        // If both components are selected, check compatibility
        if (fromComponent && toComponent) {
            return isConnectionCompatible(from, to) ? 'compatible' : 'incompatible';
        }

        // If only one is selected, show as pending
        if (fromComponent || toComponent) {
            return 'pending';
        }

        // Neither selected
        return 'neutral';
    };

    /**
     * Calculate line path between two components
     */
    const getLinePath = (from: string, to: string): string => {
        const fromPos = componentPositions[from as ComponentType];
        const toPos = componentPositions[to as ComponentType];

        // Calculate center points of component boxes (boxes are 120x60)
        const fromX = fromPos.x + 60;
        const fromY = fromPos.y + 30;
        const toX = toPos.x + 60;
        const toY = toPos.y + 30;

        // Create a curved path for better visuals
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        return `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
    };

    return (
        <div className="pc-architecture-visual">
            <svg
                viewBox="0 0 600 500"
                className="architecture-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Draw connection lines first (so they appear behind components) */}
                <g className="connections">
                    {connections.map((conn, index) => {
                        const status = getConnectionStatus(conn.from, conn.to);
                        const isIncompatible = status === 'incompatible';
                        return (
                            <g key={index} className={`connection ${status}`}>
                                <path
                                    d={getLinePath(conn.from, conn.to)}
                                    className="connection-line"
                                    strokeWidth="2"
                                    fill="none"
                                />
                                {/* Add label for connection type */}
                                {status !== 'neutral' && (
                                    <text
                                        className="connection-label"
                                        textAnchor="middle"
                                    >
                                        <textPath
                                            href={`#path-${index}`}
                                            startOffset="50%"
                                        >
                                            {conn.label}
                                        </textPath>
                                    </text>
                                )}
                                {/* Hidden path for text positioning */}
                                <path
                                    id={`path-${index}`}
                                    d={getLinePath(conn.from, conn.to)}
                                    fill="none"
                                    stroke="none"
                                />
                                {/* Warning indicator for incompatible connections */}
                                {isIncompatible && (
                                    <g className="incompatible-indicator">
                                        <circle
                                            cx={(componentPositions[conn.from as ComponentType].x + componentPositions[conn.to as ComponentType].x) / 2 + 60}
                                            cy={(componentPositions[conn.from as ComponentType].y + componentPositions[conn.to as ComponentType].y) / 2 + 30}
                                            r="8"
                                            fill="#ff6b6b"
                                        />
                                        <text
                                            x={(componentPositions[conn.from as ComponentType].x + componentPositions[conn.to as ComponentType].x) / 2 + 60}
                                            y={(componentPositions[conn.from as ComponentType].y + componentPositions[conn.to as ComponentType].y) / 2 + 34}
                                            textAnchor="middle"
                                            fill="white"
                                            fontSize="12"
                                            fontWeight="bold"
                                        >
                                            !
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </g>

                {/* Draw component boxes */}
                <g className="components">
                    {Object.entries(componentPositions).map(([type, pos]) => {
                        const component = build[type.toLowerCase() as keyof PartialBuild];
                        const isSelected = !!component;
                        const isCurrent = currentStep === type;
                        const isStorage = type === 'Storage' && Array.isArray(component);
                        const storageCount = isStorage ? (component as any[]).length : 0;

                        // Component icon paths (placeholder for custom images)
                        const iconPath = `/assets/components/${type.toLowerCase()}.png`;

                        return (
                            <g
                                key={type}
                                className={`component-box ${isSelected ? 'selected' : 'empty'} ${isCurrent ? 'current' : ''}`}
                                transform={`translate(${pos.x}, ${pos.y})`}
                            >
                                {/* Component box rectangle */}
                                <rect
                                    width="120"
                                    height="60"
                                    rx="5"
                                    className="component-rect"
                                />

                                {/* Component icon (placeholder) */}
                                <image
                                    href={iconPath}
                                    x="10"
                                    y="10"
                                    width="30"
                                    height="30"
                                    className="component-icon"
                                    onError={(e) => {
                                        // Fallback to emoji if image not found
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />

                                {/* Component type label */}
                                <text
                                    x="60"
                                    y="25"
                                    textAnchor="middle"
                                    className="component-type"
                                >
                                    {type}
                                </text>

                                {/* Component name or status */}
                                <text
                                    x="60"
                                    y="45"
                                    textAnchor="middle"
                                    className="component-name"
                                >
                                    {isSelected
                                        ? isStorage
                                            ? `${storageCount} drive${storageCount !== 1 ? 's' : ''}`
                                            : (component as any).manufacturer
                                        : 'Not selected'}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Legend */}
            {highlightCompatibility && (
                <div className="visual-legend">
                    <div className="legend-item">
                        <span className="legend-indicator compatible"></span>
                        <span className="legend-label">Compatible</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-indicator pending"></span>
                        <span className="legend-label">Pending</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-indicator neutral"></span>
                        <span className="legend-label">Not selected</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PCArchitectureVisual;
