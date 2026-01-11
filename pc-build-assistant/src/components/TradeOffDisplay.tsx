/**
 * TradeOffDisplay - Visualizes trade-off metrics for component comparison
 * Requirements: 3.2
 */

import React from 'react';
import { Component, CPUSpecifications, GPUSpecifications, PSUSpecifications, RAMSpecifications, StorageSpecifications } from '../types/components';
import './TradeOffDisplay.css';

export interface TradeOffDisplayProps {
    components: Component[];
    mode: 'beginner' | 'advanced';
}

interface TradeOffMetrics {
    componentId: string;
    componentName: string;
    componentType: string;
    cost: number;
    performance: number;
    power: number;
    specsValue: number;
    specsLabel: string;
}

// Component types that have meaningful performance scores
const PERFORMANCE_TYPES = ['CPU', 'GPU'];

/**
 * TradeOffDisplay shows comparison indicators for cost and relevant specs
 * Requirements: 3.2
 */
export const TradeOffDisplay: React.FC<TradeOffDisplayProps> = ({ components, mode }) => {
    if (components.length === 0) {
        return null;
    }

    const componentType = components[0]?.type || '';
    const showPerformance = PERFORMANCE_TYPES.includes(componentType);
    const showPower = ['CPU', 'GPU', 'PSU'].includes(componentType);

    const metrics = components.map(component => calculateMetrics(component));
    const normalized = normalizeMetrics(metrics);

    const getBarClass = (value: number, allValues: number[], isInverse: boolean = false) => {
        const max = Math.max(...allValues);
        const min = Math.min(...allValues);
        if (max - min < 5) return 'neutral';
        if (isInverse) {
            if (value >= 90) return 'bad';
            if (value <= min + 10) return 'good';
            return 'bad';
        } else {
            if (value >= 90) return 'good';
            return 'bad';
        }
    };

    const renderScale = () => (
        <div className="scale-container">
            <div className="scale-line"></div>
            <div className="scale-markers">
                <span>0</span>
                <span>50</span>
                <span>100</span>
            </div>
        </div>
    );

    const getSecondMetricLabel = (): { icon: string; label: string } => {
        switch (componentType) {
            case 'CPU':
            case 'GPU':
                return { icon: '⚡', label: 'Performance' };
            case 'RAM':
                return { icon: '💾', label: 'Capacity & Speed' };
            case 'Storage':
                return { icon: '📊', label: 'Speed' };
            case 'PSU':
                return { icon: '⚡', label: 'Wattage' };
            case 'Motherboard':
                return { icon: '🔌', label: 'Features' };
            default:
                return { icon: '📊', label: 'Specs' };
        }
    };

    const secondMetric = getSecondMetricLabel();

    return (
        <div className="tradeoff-display">
            <h3>{mode === 'beginner' ? 'Compare Your Options' : 'Trade-Off Analysis'}</h3>

            <div className="tradeoff-grid">
                {/* Cost comparison */}
                <div className="tradeoff-category">
                    <div className="category-header">
                        <span className="category-icon">💰</span>
                        <span className="category-label">Cost</span>
                    </div>
                    <div className="category-bars">
                        {normalized.map((metric, index) => {
                            const allCosts = normalized.map(m => m.cost);
                            const barClass = getBarClass(metric.cost, allCosts, true);
                            const price = components[index].price;
                            return (
                                <div key={metric.componentId} className="metric-bar-container">
                                    <span className="component-label">{getShortName(metric.componentName)}</span>
                                    <div className="metric-bar-wrapper">
                                        <div
                                            className={`metric-bar ${barClass}`}
                                            style={{ width: `${metric.cost}%` }}
                                            data-tooltip={`$${price}`}
                                        />
                                        {mode === 'advanced' && (
                                            <span className="metric-value">${price}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {renderScale()}
                    </div>
                </div>

                {/* Performance/Specs - contextual based on component type */}
                <div className="tradeoff-category">
                    <div className="category-header">
                        <span className="category-icon">{secondMetric.icon}</span>
                        <span className="category-label">{secondMetric.label}</span>
                    </div>
                    <div className="category-bars">
                        {normalized.map((metric) => {
                            const value = showPerformance ? metric.performance : metric.specsValue;
                            const allValues = normalized.map(m => showPerformance ? m.performance : m.specsValue);
                            const barClass = getBarClass(value, allValues, false);
                            const rawMetric = metrics.find(m => m.componentId === metric.componentId);
                            const tooltipValue = showPerformance
                                ? `${metric.performance.toFixed(0)}%`
                                : rawMetric?.specsLabel || '';
                            return (
                                <div key={metric.componentId} className="metric-bar-container">
                                    <span className="component-label">{getShortName(metric.componentName)}</span>
                                    <div className="metric-bar-wrapper">
                                        <div
                                            className={`metric-bar ${barClass}`}
                                            style={{ width: `${value}%` }}
                                            data-tooltip={tooltipValue}
                                        />
                                        {mode === 'advanced' && (
                                            <span className="metric-value">
                                                {showPerformance ? `${value.toFixed(0)}` : rawMetric?.specsLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {renderScale()}
                    </div>
                </div>

                {/* Power - only for CPU, GPU, PSU */}
                {showPower && (
                    <div className="tradeoff-category">
                        <div className="category-header">
                            <span className="category-icon">🔋</span>
                            <span className="category-label">Power</span>
                        </div>
                        <div className="category-bars">
                            {normalized.map((metric, index) => {
                                const allPower = normalized.map(m => m.power);
                                const barClass = getBarClass(metric.power, allPower, true);
                                const powerVal = getPowerValue(components[index]);
                                return (
                                    <div key={metric.componentId} className="metric-bar-container">
                                        <span className="component-label">{getShortName(metric.componentName)}</span>
                                        <div className="metric-bar-wrapper">
                                            <div
                                                className={`metric-bar ${barClass}`}
                                                style={{ width: `${metric.power}%` }}
                                                data-tooltip={`${powerVal}W`}
                                            />
                                            {mode === 'advanced' && (
                                                <span className="metric-value">{powerVal}W</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {renderScale()}
                        </div>
                    </div>
                )}
            </div>

            {mode === 'beginner' && (
                <div className="tradeoff-hint">
                    <p>💡 Green bars mean better value. Red bars mean less optimal.</p>
                </div>
            )}
        </div>
    );
};

function calculateMetrics(component: Component): TradeOffMetrics {
    let performance = 50;
    let power = 0;
    let specsValue = 50;
    let specsLabel = '';

    switch (component.type) {
        case 'CPU':
            const cpuSpecs = component.specifications as CPUSpecifications;
            performance = cpuSpecs.performanceScore || (cpuSpecs.cores * cpuSpecs.boostClock);
            power = cpuSpecs.tdp;
            specsValue = performance;
            specsLabel = `${performance}`;
            break;
        case 'GPU':
            const gpuSpecs = component.specifications as GPUSpecifications;
            performance = gpuSpecs.performanceScore;
            power = gpuSpecs.powerDraw;
            specsValue = performance;
            specsLabel = `${performance}`;
            break;
        case 'RAM':
            const ramSpecs = component.specifications as RAMSpecifications;
            // Combine capacity and speed for comparison (weighted score)
            specsValue = ramSpecs.capacity + (ramSpecs.speed / 100);
            specsLabel = `${ramSpecs.capacity}GB @ ${ramSpecs.speed}MHz`;
            power = 0;
            break;
        case 'Storage':
            const storageSpecs = component.specifications as StorageSpecifications;
            specsValue = storageSpecs.readSpeed;
            specsLabel = `${storageSpecs.readSpeed} MB/s`;
            power = 0;
            break;
        case 'PSU':
            const psuSpecs = component.specifications as PSUSpecifications;
            specsValue = psuSpecs.wattage;
            specsLabel = `${psuSpecs.wattage}W`;
            power = psuSpecs.wattage;
            break;
        case 'Motherboard':
            specsValue = component.price / 5;
            specsLabel = 'Standard';
            power = 0;
            break;
        default:
            specsValue = 50;
            specsLabel = '-';
            power = 0;
    }

    return {
        componentId: component.id,
        componentName: component.name,
        componentType: component.type,
        cost: component.price,
        performance,
        power,
        specsValue,
        specsLabel,
    };
}

function normalizeMetrics(metrics: TradeOffMetrics[]): TradeOffMetrics[] {
    if (metrics.length === 0) return [];

    const maxCost = Math.max(...metrics.map(m => m.cost));
    const maxPerformance = Math.max(...metrics.map(m => m.performance));
    const maxPower = Math.max(...metrics.map(m => m.power));
    const maxSpecs = Math.max(...metrics.map(m => m.specsValue));

    return metrics.map(metric => ({
        ...metric,
        cost: maxCost > 0 ? (metric.cost / maxCost) * 100 : 0,
        performance: maxPerformance > 0 ? (metric.performance / maxPerformance) * 100 : 0,
        power: maxPower > 0 ? (metric.power / maxPower) * 100 : 0,
        specsValue: maxSpecs > 0 ? (metric.specsValue / maxSpecs) * 100 : 0,
    }));
}

function getShortName(name: string): string {
    if (name.length > 20) {
        return name.substring(0, 17) + '...';
    }
    return name;
}

function getPowerValue(component: Component): number {
    switch (component.type) {
        case 'CPU':
            return (component.specifications as CPUSpecifications).tdp;
        case 'GPU':
            return (component.specifications as GPUSpecifications).powerDraw;
        case 'PSU':
            return (component.specifications as PSUSpecifications).wattage;
        default:
            return 0;
    }
}
