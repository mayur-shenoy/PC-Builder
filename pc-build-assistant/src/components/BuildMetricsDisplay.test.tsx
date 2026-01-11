/**
 * BuildMetricsDisplay Component Tests
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BuildMetricsDisplay } from './BuildMetricsDisplay';
import { BuildMetrics } from '../types/build';

describe('BuildMetricsDisplay', () => {
    const mockMetrics: BuildMetrics = {
        strategy: 'GPU-heavy',
        budgetDistribution: {
            CPU: 20,
            GPU: 45,
            Motherboard: 15,
            RAM: 10,
            Storage: 5,
            PSU: 5,
        },
        bottleneckPercentage: 15,
        upgradeFlexibility: 75,
    };

    describe('Empty State', () => {
        it('should display empty message in beginner mode when metrics are null', () => {
            render(<BuildMetricsDisplay metrics={null} mode="beginner" />);
            expect(screen.getByText(/Start selecting components/i)).toBeInTheDocument();
        });

        it('should display empty message in advanced mode when metrics are null', () => {
            render(<BuildMetricsDisplay metrics={null} mode="advanced" />);
            expect(screen.getByText(/No metrics available/i)).toBeInTheDocument();
        });
    });

    describe('Strategy Display', () => {
        it('should display the build strategy tag', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('GPU-heavy')).toBeInTheDocument();
        });

        it('should display strategy description in beginner mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText(/Great for gaming and graphics work/i)).toBeInTheDocument();
        });

        it('should not display strategy description in advanced mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="advanced" />);
            expect(screen.queryByText(/Great for gaming and graphics work/i)).not.toBeInTheDocument();
        });
    });

    describe('Budget Distribution', () => {
        it('should display all component budget percentages', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('CPU')).toBeInTheDocument();
            expect(screen.getByText('GPU')).toBeInTheDocument();
            expect(screen.getByText('Motherboard')).toBeInTheDocument();
            expect(screen.getByText('RAM')).toBeInTheDocument();
            expect(screen.getByText('Storage')).toBeInTheDocument();
            expect(screen.getByText('PSU')).toBeInTheDocument();
        });

        it('should display rounded percentages in beginner mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('45%')).toBeInTheDocument(); // GPU
            expect(screen.getByText('20%')).toBeInTheDocument(); // CPU
        });

        it('should display decimal percentages in advanced mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="advanced" />);
            expect(screen.getByText('45.0%')).toBeInTheDocument(); // GPU
            expect(screen.getByText('20.0%')).toBeInTheDocument(); // CPU
        });
    });

    describe('Bottleneck Indicator', () => {
        it('should display bottleneck status', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('Good')).toBeInTheDocument();
        });

        it('should display bottleneck explanation in beginner mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText(/Good balance between CPU and GPU/i)).toBeInTheDocument();
        });

        it('should display bottleneck percentage in advanced mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="advanced" />);
            const bottleneckValue = screen.getByText(/15\.0%/, { selector: '.bottleneck-value' });
            expect(bottleneckValue).toBeInTheDocument();
        });
    });

    describe('Upgrade Flexibility', () => {
        it('should display flexibility score', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('75')).toBeInTheDocument();
        });

        it('should display flexibility rating', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('Excellent')).toBeInTheDocument();
        });

        it('should display flexibility explanation in beginner mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText(/Lots of room to upgrade in the future/i)).toBeInTheDocument();
        });

        it('should display /100 in advanced mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="advanced" />);
            expect(screen.getByText('/100')).toBeInTheDocument();
        });
    });

    describe('Mode-Specific Titles', () => {
        it('should display beginner-friendly titles in beginner mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="beginner" />);
            expect(screen.getByText('Your Build Strategy')).toBeInTheDocument();
            expect(screen.getByText('Where Your Money Goes')).toBeInTheDocument();
            expect(screen.getByText('Performance Balance')).toBeInTheDocument();
            expect(screen.getByText('Future Upgrade Potential')).toBeInTheDocument();
        });

        it('should display technical titles in advanced mode', () => {
            render(<BuildMetricsDisplay metrics={mockMetrics} mode="advanced" />);
            expect(screen.getByText('Build Metrics Analysis')).toBeInTheDocument();
            expect(screen.getByText('Budget Distribution')).toBeInTheDocument();
            expect(screen.getByText('Bottleneck Analysis')).toBeInTheDocument();
            expect(screen.getByText('Upgrade Flexibility Score')).toBeInTheDocument();
        });
    });

    describe('Different Strategy Tags', () => {
        it('should display CPU-heavy strategy correctly', () => {
            const cpuHeavyMetrics = { ...mockMetrics, strategy: 'CPU-heavy' as const };
            render(<BuildMetricsDisplay metrics={cpuHeavyMetrics} mode="beginner" />);
            expect(screen.getByText('CPU-heavy')).toBeInTheDocument();
            expect(screen.getByText(/Perfect for productivity and multitasking/i)).toBeInTheDocument();
        });

        it('should display Balanced strategy correctly', () => {
            const balancedMetrics = { ...mockMetrics, strategy: 'Balanced' as const };
            render(<BuildMetricsDisplay metrics={balancedMetrics} mode="beginner" />);
            expect(screen.getByText('Balanced')).toBeInTheDocument();
            expect(screen.getByText(/well-rounded build/i)).toBeInTheDocument();
        });

        it('should display Power-efficient strategy correctly', () => {
            const powerEfficientMetrics = { ...mockMetrics, strategy: 'Power-efficient' as const };
            render(<BuildMetricsDisplay metrics={powerEfficientMetrics} mode="beginner" />);
            expect(screen.getByText('Power-efficient')).toBeInTheDocument();
            expect(screen.getByText(/Energy-conscious build/i)).toBeInTheDocument();
        });
    });
});
