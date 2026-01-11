/**
 * FinalBuildVisual Component
 * Requirements: 8.6, 8.7
 * 
 * Complete PC architecture diagram for final build summary
 * - Shows all selected components
 * - Highlights build strategy visually
 * - Displays complete component relationships
 */

import React from 'react';
import type { CompleteBuild, BuildMetrics } from '../types/build';
import type {
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    StorageSpecifications,
    PSUSpecifications,
} from '../types/components';
import './FinalBuildVisual.css';

export interface FinalBuildVisualProps {
    build: CompleteBuild;
    metrics: BuildMetrics;
}

/**
 * FinalBuildVisual displays the complete PC architecture with build strategy highlighting
 * Requirements: 8.6, 8.7
 */
export const FinalBuildVisual: React.FC<FinalBuildVisualProps> = ({ build, metrics }) => {
    // Component positions in the visual layout
    const componentPositions = {
        CPU: { x: 240, y: 80 },
        Motherboard: { x: 240, y: 220 },
        RAM: { x: 440, y: 220 },
        GPU: { x: 40, y: 360 },
        Storage: { x: 240, y: 360 },
        PSU: { x: 440, y: 360 },
    };

    // Define component relationships - only valid connections
    const connections = [
        { from: 'CPU', to: 'Motherboard' },
        { from: 'RAM', to: 'Motherboard' },
        { from: 'GPU', to: 'Motherboard' },
        { from: 'Storage', to: 'Motherboard' },
        { from: 'PSU', to: 'Motherboard' },
    ];

    /**
     * Get strategy color based on build metrics
     * Requirements: 8.7
     */
    const getStrategyColor = (): string => {
        switch (metrics.strategy) {
            case 'GPU-heavy':
                return '#e74c3c'; // Red
            case 'CPU-heavy':
                return '#3498db'; // Blue
            case 'Balanced':
                return '#27ae60'; // Green
            case 'Power-efficient':
                return '#f39c12'; // Orange
            default:
                return '#95a5a6'; // Gray
        }
    };

    /**
     * Determine if a component should be highlighted based on strategy
     * Requirements: 8.7
     */
    const isComponentHighlighted = (type: string): boolean => {
        if (metrics.strategy === 'GPU-heavy' && type === 'GPU') return true;
        if (metrics.strategy === 'CPU-heavy' && type === 'CPU') return true;
        if (metrics.strategy === 'Balanced') return type === 'CPU' || type === 'GPU';
        return false;
    };

    /**
     * Calculate line path between two components
     */
    const getLinePath = (from: string, to: string): string => {
        const fromPos = componentPositions[from as keyof typeof componentPositions];
        const toPos = componentPositions[to as keyof typeof componentPositions];

        const fromX = fromPos.x + 60;
        const fromY = fromPos.y + 30;
        const toX = toPos.x + 60;
        const toY = toPos.y + 30;

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        return `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
    };

    /**
     * Get component specifications summary
     */
    const getComponentSummary = (type: string): string => {
        switch (type) {
            case 'CPU': {
                const specs = build.cpu.specifications as CPUSpecifications;
                return `${specs.cores}C/${specs.threads}T`;
            }
            case 'GPU': {
                const specs = build.gpu.specifications as GPUSpecifications;
                return `${specs.vram}GB VRAM`;
            }
            case 'Motherboard': {
                const specs = build.motherboard.specifications as MotherboardSpecifications;
                return specs.formFactor;
            }
            case 'RAM': {
                const specs = build.ram.specifications as RAMSpecifications;
                return `${specs.capacity}GB ${specs.type}`;
            }
            case 'Storage': {
                const totalCapacity = build.storage.reduce(
                    (sum, s) => sum + (s.specifications as StorageSpecifications).capacity,
                    0
                );
                return `${totalCapacity}GB`;
            }
            case 'PSU': {
                const specs = build.psu.specifications as PSUSpecifications;
                return `${specs.wattage}W`;
            }
            default:
                return '';
        }
    };

    const strategyColor = getStrategyColor();

    return (
        <div className="final-build-visual">
            {/* Strategy Badge - Requirements: 8.7 */}
            <div className="strategy-badge" style={{ backgroundColor: strategyColor }}>
                <span className="strategy-icon">
                    {metrics.strategy === 'GPU-heavy' && '🎮'}
                    {metrics.strategy === 'CPU-heavy' && '⚡'}
                    {metrics.strategy === 'Balanced' && '⚖️'}
                    {metrics.strategy === 'Power-efficient' && '🌱'}
                </span>
                <span className="strategy-label">{metrics.strategy} Build</span>
            </div>

            {/* Architecture Diagram - Requirements: 8.6 */}
            <svg
                viewBox="0 0 600 480"
                className="final-architecture-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Draw connection lines */}
                <g className="connections">
                    {connections.map((conn, index) => {
                        const isHighlighted =
                            isComponentHighlighted(conn.from) || isComponentHighlighted(conn.to);
                        return (
                            <path
                                key={index}
                                d={getLinePath(conn.from, conn.to)}
                                className={`connection-line ${isHighlighted ? 'highlighted' : ''}`}
                                strokeWidth={isHighlighted ? '3' : '2'}
                                stroke={isHighlighted ? strategyColor : '#bdc3c7'}
                                fill="none"
                            />
                        );
                    })}
                </g>

                {/* Draw component boxes */}
                <g className="components">
                    {Object.entries(componentPositions).map(([type, pos]) => {
                        const isHighlighted = isComponentHighlighted(type);
                        const summary = getComponentSummary(type);

                        return (
                            <g
                                key={type}
                                className={`component-box ${isHighlighted ? 'highlighted' : ''}`}
                                transform={`translate(${pos.x}, ${pos.y})`}
                            >
                                {/* Highlight glow for strategy components */}
                                {isHighlighted && (
                                    <rect
                                        width="120"
                                        height="60"
                                        rx="5"
                                        className="component-glow"
                                        stroke={strategyColor}
                                        strokeWidth="3"
                                        fill="none"
                                    />
                                )}

                                {/* Component box rectangle */}
                                <rect
                                    width="120"
                                    height="60"
                                    rx="5"
                                    className="component-rect"
                                    fill={isHighlighted ? strategyColor : '#ecf0f1'}
                                />

                                {/* Component type label */}
                                <text
                                    x="60"
                                    y="22"
                                    textAnchor="middle"
                                    className="component-type"
                                    fill={isHighlighted ? '#ffffff' : '#2c3e50'}
                                    fontWeight={isHighlighted ? 'bold' : 'normal'}
                                >
                                    {type}
                                </text>

                                {/* Component summary */}
                                <text
                                    x="60"
                                    y="42"
                                    textAnchor="middle"
                                    className="component-summary"
                                    fill={isHighlighted ? '#ffffff' : '#7f8c8d'}
                                    fontSize="11"
                                >
                                    {summary}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Component Details List */}
            <div className="component-details">
                <div className="detail-item">
                    <span className="detail-label">CPU:</span>
                    <span className="detail-value">{build.cpu.name}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">GPU:</span>
                    <span className="detail-value">{build.gpu.name}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Motherboard:</span>
                    <span className="detail-value">{build.motherboard.name}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">RAM:</span>
                    <span className="detail-value">{build.ram.name}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Storage:</span>
                    <span className="detail-value">
                        {build.storage.map((s) => s.name).join(', ')}
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">PSU:</span>
                    <span className="detail-value">{build.psu.name}</span>
                </div>
            </div>
        </div>
    );
};
