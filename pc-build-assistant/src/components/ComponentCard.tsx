/**
 * ComponentCard - Displays individual component with specs and "Why Not This?" button
 * Requirements: 2.2, 4.1
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Component,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    StorageSpecifications,
    PSUSpecifications,
} from '../types/components';
import './ComponentCard.css';

export interface ComponentCardProps {
    component: Component;
    onSelect: () => void;
    mode: 'beginner' | 'advanced';
    onWhyNot?: (component: Component) => void;
    whyNotExplanation?: string;
    isLoadingWhyNot?: boolean;
}

/**
 * ComponentCard displays component details with selection and "Why Not This?" options
 * Requirements: 2.2, 4.1
 */
export const ComponentCard: React.FC<ComponentCardProps> = ({
    component,
    onSelect,
    mode,
    onWhyNot,
    whyNotExplanation,
    isLoadingWhyNot = false,
}) => {
    const [showWhyNot, setShowWhyNot] = useState(false);

    const handleWhyNotClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowWhyNot(true);
        if (onWhyNot) {
            onWhyNot(component);
        }
    };

    const handleCloseModal = () => {
        setShowWhyNot(false);
    };

    return (
        <article className="component-card" aria-label={`${component.name} by ${component.manufacturer}`}>
            <div className="card-header">
                <div className="component-type-badge" aria-label={`Component type: ${component.type}`}>
                    {component.type}
                </div>
                <div className="component-price" aria-label={`Price: $${component.price}`}>
                    ${component.price}
                </div>
            </div>

            <div className="card-body">
                <h3 className="component-name">{component.name}</h3>
                <p className="component-manufacturer">{component.manufacturer}</p>

                {/* Component image placeholder */}
                <div className="component-image" aria-hidden="true">
                    <img
                        src={getManufacturerLogo(component.manufacturer)}
                        alt={`${component.manufacturer} logo`}
                        className="manufacturer-logo"
                        onError={(e) => {
                            // Fallback to emoji icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                        }}
                    />
                    <div className="image-placeholder" style={{ display: 'none' }}>
                        {getComponentIcon(component.type)}
                    </div>
                </div>

                {/* Key specifications */}
                <div className="component-specs" role="list" aria-label="Component specifications">
                    {renderSpecs(component, mode)}
                </div>
            </div>

            <div className="card-footer">
                <button
                    className="select-button"
                    onClick={onSelect}
                    aria-label={`Select ${component.name}`}
                >
                    Select This Component
                </button>

                {/* "Why Not This?" button - Requirements 4.1 */}
                <button
                    className="why-not-button"
                    onClick={handleWhyNotClick}
                    aria-label={`Learn why ${component.name} might not be the best choice`}
                    aria-expanded={showWhyNot}
                >
                    Why Not This?
                </button>
            </div>

            {/* Why Not explanation modal - rendered via portal to avoid card context issues */}
            {showWhyNot && createPortal(
                <div
                    className="why-not-modal"
                    onClick={handleCloseModal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="why-not-title"
                >
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={handleCloseModal}
                            aria-label="Close explanation"
                        >
                            ×
                        </button>
                        <h4 id="why-not-title">Why Not {component.name}?</h4>
                        <div className="modal-body">
                            {isLoadingWhyNot ? (
                                <div className="why-not-loading">
                                    <div className="loading-spinner"></div>
                                    <p>Analyzing this component...</p>
                                </div>
                            ) : whyNotExplanation ? (
                                formatExplanation(whyNotExplanation)
                            ) : (
                                <p>
                                    This component may not be the best fit based on your preferences and budget.
                                    Consider the trade-offs shown above when making your selection.
                                </p>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </article>
    );
};

/**
 * Get icon for component type
 */
function getComponentIcon(type: string): string {
    const icons: Record<string, string> = {
        CPU: '🖥️',
        GPU: '🎮',
        Motherboard: '🔌',
        RAM: '💾',
        Storage: '💿',
        PSU: '⚡',
    };
    return icons[type] || '📦';
}

/**
 * Get manufacturer logo path
 * Place your logo images in: public/assets/logos/
 * Supported manufacturers: intel, amd, nvidia, asus, msi, gigabyte, corsair, samsung, etc.
 */
function getManufacturerLogo(manufacturer: string): string {
    const normalizedName = manufacturer.toLowerCase().replace(/\s+/g, '-');
    return `/assets/logos/${normalizedName}.png`;
}

/**
 * Format explanation text with markdown-like formatting
 */
function formatExplanation(text: string): React.ReactNode {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
        if (line.trim() === '') {
            elements.push(<br key={`br-${index}`} />);
        } else if (line.startsWith('**') && line.endsWith('**')) {
            const content = line.slice(2, -2);
            elements.push(
                <h4 key={`heading-${index}`} style={{ margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>
                    {content}
                </h4>
            );
        } else if (line.startsWith('- ')) {
            const content = line.slice(2);
            elements.push(
                <li key={`li-${index}`} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>
                    {content}
                </li>
            );
        } else if (line.includes('**')) {
            const parts = line.split('**');
            const formatted = parts.map((part, i) =>
                i % 2 === 1 ? <strong key={`bold-${i}`}>{part}</strong> : part
            );
            elements.push(
                <p key={`p-${index}`} style={{ margin: '0.5rem 0' }}>
                    {formatted}
                </p>
            );
        } else {
            elements.push(
                <p key={`p-${index}`} style={{ margin: '0.5rem 0' }}>
                    {line}
                </p>
            );
        }
    });

    return <div>{elements}</div>;
}

/**
 * Render component specifications based on type and mode
 */
function renderSpecs(component: Component, mode: 'beginner' | 'advanced'): React.ReactNode {
    switch (component.type) {
        case 'CPU':
            return renderCPUSpecs(component.specifications as CPUSpecifications, mode);
        case 'GPU':
            return renderGPUSpecs(component.specifications as GPUSpecifications, mode);
        case 'Motherboard':
            return renderMotherboardSpecs(component.specifications as MotherboardSpecifications, mode);
        case 'RAM':
            return renderRAMSpecs(component.specifications as RAMSpecifications, mode);
        case 'Storage':
            return renderStorageSpecs(component.specifications as StorageSpecifications, mode);
        case 'PSU':
            return renderPSUSpecs(component.specifications as PSUSpecifications, mode);
        default:
            return null;
    }
}

function renderCPUSpecs(specs: CPUSpecifications, mode: 'beginner' | 'advanced'): React.ReactNode {
    if (mode === 'beginner') {
        return (
            <>
                <div className="spec-item" role="listitem">
                    <span className="spec-label">Cores:</span>
                    <span className="spec-value">{specs.cores}</span>
                </div>
                <div className="spec-item" role="listitem">
                    <span className="spec-label">Speed:</span>
                    <span className="spec-value">{specs.boostClock} GHz</span>
                </div>
                <div className="spec-item" role="listitem">
                    <span className="spec-label">Power:</span>
                    <span className="spec-value">{specs.tdp}W</span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="spec-item" role="listitem">
                    <span className="spec-label">Cores/Threads:</span>
                    <span className="spec-value">{specs.cores}C/{specs.threads}T</span>
                </div>
                <div className="spec-item" role="listitem">
                    <span className="spec-label">Clock:</span>
                    <span className="spec-value">{specs.baseClock}-{specs.boostClock} GHz</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Socket:</span>
                    <span className="spec-value">{specs.socket}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">TDP:</span>
                    <span className="spec-value">{specs.tdp}W</span>
                </div>
            </>
        );
    }
}

function renderGPUSpecs(specs: GPUSpecifications, mode: 'beginner' | 'advanced'): React.ReactNode {
    if (mode === 'beginner') {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">VRAM:</span>
                    <span className="spec-value">{specs.vram}GB</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Performance:</span>
                    <span className="spec-value">{specs.performanceScore}/100</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Power:</span>
                    <span className="spec-value">{specs.powerDraw}W</span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">VRAM:</span>
                    <span className="spec-value">{specs.vram}GB</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Performance:</span>
                    <span className="spec-value">{specs.performanceScore}/100</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Power Draw:</span>
                    <span className="spec-value">{specs.powerDraw}W</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Length:</span>
                    <span className="spec-value">{specs.length}mm</span>
                </div>
            </>
        );
    }
}

function renderMotherboardSpecs(specs: MotherboardSpecifications, mode: 'beginner' | 'advanced'): React.ReactNode {
    if (mode === 'beginner') {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Size:</span>
                    <span className="spec-value">{specs.formFactor}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">RAM Type:</span>
                    <span className="spec-value">{specs.ramType}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">RAM Slots:</span>
                    <span className="spec-value">{specs.ramSlots}</span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Form Factor:</span>
                    <span className="spec-value">{specs.formFactor}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Socket:</span>
                    <span className="spec-value">{specs.socket}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">RAM:</span>
                    <span className="spec-value">{specs.ramSlots}x {specs.ramType}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Storage:</span>
                    <span className="spec-value">{specs.m2Slots}x M.2, {specs.sataPorts}x SATA</span>
                </div>
            </>
        );
    }
}

function renderRAMSpecs(specs: RAMSpecifications, mode: 'beginner' | 'advanced'): React.ReactNode {
    if (mode === 'beginner') {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Capacity:</span>
                    <span className="spec-value">{specs.capacity}GB</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Type:</span>
                    <span className="spec-value">{specs.type}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Speed:</span>
                    <span className="spec-value">{specs.speed} MHz</span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Configuration:</span>
                    <span className="spec-value">{specs.modules}x{specs.capacity / specs.modules}GB</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Type:</span>
                    <span className="spec-value">{specs.type}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Speed:</span>
                    <span className="spec-value">{specs.speed} MHz</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Latency:</span>
                    <span className="spec-value">CL{specs.latency}</span>
                </div>
            </>
        );
    }
}

function renderStorageSpecs(specs: StorageSpecifications, mode: 'beginner' | 'advanced'): React.ReactNode {
    if (mode === 'beginner') {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Capacity:</span>
                    <span className="spec-value">{specs.capacity}GB</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Type:</span>
                    <span className="spec-value">{specs.type}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Speed:</span>
                    <span className="spec-value">{specs.readSpeed} MB/s</span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Capacity:</span>
                    <span className="spec-value">{specs.capacity}GB</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Type:</span>
                    <span className="spec-value">{specs.type}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Read Speed:</span>
                    <span className="spec-value">{specs.readSpeed} MB/s</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Write Speed:</span>
                    <span className="spec-value">{specs.writeSpeed} MB/s</span>
                </div>
            </>
        );
    }
}

function renderPSUSpecs(specs: PSUSpecifications, mode: 'beginner' | 'advanced'): React.ReactNode {
    if (mode === 'beginner') {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Wattage:</span>
                    <span className="spec-value">{specs.wattage}W</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Efficiency:</span>
                    <span className="spec-value">{specs.efficiency}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Modular:</span>
                    <span className="spec-value">{specs.modular}</span>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="spec-item">
                    <span className="spec-label">Wattage:</span>
                    <span className="spec-value">{specs.wattage}W</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Efficiency:</span>
                    <span className="spec-value">{specs.efficiency}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">Modular:</span>
                    <span className="spec-value">{specs.modular}</span>
                </div>
                <div className="spec-item">
                    <span className="spec-label">PCIe Connectors:</span>
                    <span className="spec-value">{specs.connectors.pcie8pin}x 8-pin</span>
                </div>
            </>
        );
    }
}
