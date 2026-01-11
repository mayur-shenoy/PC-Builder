/**
 * BuildMetricsDisplay Component
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * Displays build metrics including:
 * - Build strategy tag
 * - Budget distribution chart
 * - Bottleneck percentage
 * - Upgrade flexibility score
 * 
 * Supports beginner and advanced modes with different visualization levels
 */

import React from 'react';
import { BuildMetrics } from '../types/build';
import './BuildMetricsDisplay.css';

export interface BuildMetricsDisplayProps {
    metrics: BuildMetrics | null;
    mode: 'beginner' | 'advanced';
}

/**
 * BuildMetricsDisplay component
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const BuildMetricsDisplay: React.FC<BuildMetricsDisplayProps> = ({ metrics, mode }) => {
    if (!metrics) {
        return (
            <div className="build-metrics-display empty">
                <p className="empty-message">
                    {mode === 'beginner'
                        ? 'Start selecting components to see your build strategy!'
                        : 'No metrics available. Select components to compute build metrics.'}
                </p>
            </div>
        );
    }

    return (
        <div className={`build-metrics-display ${mode}`}>
            <h3 className="metrics-title">
                {mode === 'beginner' ? 'Your Build Strategy' : 'Build Metrics Analysis'}
            </h3>

            <div className="metrics-content-wrapper">
                <div className="metrics-left-panel">
                    {/* Build Strategy Tag */}
                    <div className="strategy-section">
                        <div className={`strategy-tag ${metrics.strategy.toLowerCase().replace('-', '')}`}>
                            {metrics.strategy}
                        </div>
                        {mode === 'beginner' && (
                            <p className="strategy-description">
                                {getStrategyDescription(metrics.strategy)}
                            </p>
                        )}
                    </div>

                    {/* Budget Distribution */}
                    <div className="metric-section budget-section">
                        <h4 className="metric-label">
                            {mode === 'beginner' ? 'Where Your Money Goes' : 'Budget Distribution'}
                        </h4>
                        <BudgetDistributionChart
                            distribution={metrics.budgetDistribution}
                            mode={mode}
                        />
                    </div>
                </div>

                <div className="metrics-right-panel">
                    {/* Bottleneck Percentage */}
                    <div className="metric-section">
                        <h4 className="metric-label">
                            {mode === 'beginner' ? 'Performance Balance' : 'Bottleneck Analysis'}
                        </h4>
                        <BottleneckIndicator
                            percentage={metrics.bottleneckPercentage}
                            mode={mode}
                        />
                    </div>

                    {/* Upgrade Flexibility */}
                    <div className="metric-section">
                        <h4 className="metric-label">
                            {mode === 'beginner' ? 'Future Upgrade Potential' : 'Upgrade Flexibility Score'}
                        </h4>
                        <UpgradeFlexibilityScore
                            score={metrics.upgradeFlexibility}
                            mode={mode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Helper function to get beginner-friendly strategy descriptions
 */
function getStrategyDescription(strategy: string): string {
    switch (strategy) {
        case 'GPU-heavy':
            return 'Great for gaming and graphics work! Your GPU is the star of the show.';
        case 'CPU-heavy':
            return 'Perfect for productivity and multitasking! Your CPU handles heavy workloads.';
        case 'Balanced':
            return 'A well-rounded build! Great for a mix of gaming, work, and everyday tasks.';
        case 'Power-efficient':
            return 'Energy-conscious build! Lower power consumption means lower electricity bills.';
        default:
            return 'Your build strategy is being calculated...';
    }
}

/**
 * Budget Distribution Chart Component
 */
interface BudgetDistributionChartProps {
    distribution: Record<string, number>;
    mode: 'beginner' | 'advanced';
}

const BudgetDistributionChart: React.FC<BudgetDistributionChartProps> = ({ distribution, mode }) => {
    const entries = Object.entries(distribution);

    if (entries.length === 0) {
        return <p className="no-data">No budget data available yet</p>;
    }

    return (
        <div className="budget-chart">
            {entries.map(([component, percentage]) => (
                <div key={component} className="budget-bar-container">
                    <div className="budget-bar-label">
                        <span className="component-name">{component}</span>
                        <span className="component-percentage">
                            {mode === 'advanced' ? `${percentage.toFixed(1)}%` : `${Math.round(percentage)}%`}
                        </span>
                    </div>
                    <div
                        className="budget-bar-track"
                        data-tooltip={`${component}: ${percentage.toFixed(1)}% of budget`}
                    >
                        <div
                            className={`budget-bar-fill ${component.toLowerCase()}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Bottleneck Indicator Component
 */
interface BottleneckIndicatorProps {
    percentage: number;
    mode: 'beginner' | 'advanced';
}

const BottleneckIndicator: React.FC<BottleneckIndicatorProps> = ({ percentage, mode }) => {
    const getBottleneckStatus = (pct: number): { label: string; color: string } => {
        if (pct < 10) return { label: 'Excellent', color: 'excellent' };
        if (pct < 20) return { label: 'Good', color: 'good' };
        if (pct < 35) return { label: 'Moderate', color: 'moderate' };
        return { label: 'High', color: 'high' };
    };

    const status = getBottleneckStatus(percentage);

    return (
        <div className="bottleneck-indicator">
            <div
                className="bottleneck-gauge"
                data-tooltip={`Bottleneck: ${percentage.toFixed(1)}% - ${status.label}`}
            >
                <div className="gauge-track">
                    <div
                        className={`gauge-fill ${status.color}`}
                        style={{ width: `${Math.min(100, percentage * 2)}%` }}
                    />
                </div>
                <div className="gauge-marker" style={{ left: `${Math.min(100, percentage * 2)}%` }} />
            </div>
            <div className="bottleneck-info">
                <span className={`bottleneck-status ${status.color}`}>{status.label}</span>
                {mode === 'advanced' && (
                    <span className="bottleneck-value">{percentage.toFixed(1)}%</span>
                )}
            </div>
            {mode === 'beginner' && (
                <p className="bottleneck-explanation">
                    {percentage < 10
                        ? 'Your CPU and GPU are well-matched!'
                        : percentage < 20
                            ? 'Good balance between CPU and GPU.'
                            : percentage < 35
                                ? 'Some imbalance, but still workable.'
                                : 'Consider balancing your CPU and GPU better.'}
                </p>
            )}
        </div>
    );
};

/**
 * Upgrade Flexibility Score Component
 */
interface UpgradeFlexibilityScoreProps {
    score: number;
    mode: 'beginner' | 'advanced';
}

const UpgradeFlexibilityScore: React.FC<UpgradeFlexibilityScoreProps> = ({ score, mode }) => {
    const getFlexibilityRating = (score: number): { label: string; color: string } => {
        if (score >= 75) return { label: 'Excellent', color: 'excellent' };
        if (score >= 50) return { label: 'Good', color: 'good' };
        if (score >= 25) return { label: 'Limited', color: 'moderate' };
        return { label: 'Minimal', color: 'low' };
    };

    const rating = getFlexibilityRating(score);

    return (
        <div className="upgrade-flexibility">
            <div className="flexibility-score-container">
                <div
                    className="score-circle"
                    data-tooltip={`Upgrade Flexibility: ${Math.round(score)}/100 - ${rating.label}`}
                >
                    <svg viewBox="0 0 100 100" className="score-svg">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            className="score-bg"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            className={`score-progress ${rating.color}`}
                            style={{
                                strokeDasharray: `${score * 2.827} 282.7`,
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%'
                            }}
                        />
                    </svg>
                    <div className="score-text">
                        <span className="score-number">{Math.round(score)}</span>
                        {mode === 'advanced' && <span className="score-max">/100</span>}
                    </div>
                </div>
                <div className="flexibility-info">
                    <span className={`flexibility-rating ${rating.color}`}>{rating.label}</span>
                    {mode === 'beginner' && (
                        <p className="flexibility-explanation">
                            {score >= 75
                                ? 'Lots of room to upgrade in the future!'
                                : score >= 50
                                    ? 'Good upgrade options available.'
                                    : score >= 25
                                        ? 'Some upgrade paths, but limited.'
                                        : 'Limited upgrade potential.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuildMetricsDisplay;
