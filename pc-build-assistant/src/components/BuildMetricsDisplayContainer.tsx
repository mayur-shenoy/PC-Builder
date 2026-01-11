/**
 * BuildMetricsDisplayContainer Component
 * Requirements: 5.5
 * 
 * Container component that connects BuildMetricsDisplay to the build store
 * Subscribes to metrics updates and re-renders when metrics change
 */

import React from 'react';
import { useBuildStore } from '../store/buildStore';
import { BuildMetricsDisplay } from './BuildMetricsDisplay';

/**
 * Container component that connects to the build store
 * Requirements: 5.5
 */
export const BuildMetricsDisplayContainer: React.FC = () => {
    // Subscribe to metrics and mode from the build store
    // Requirements: 5.5 - Re-render when metrics change
    const metrics = useBuildStore((state) => state.metrics);
    const mode = useBuildStore((state) => state.mode);

    return <BuildMetricsDisplay metrics={metrics} mode={mode} />;
};

export default BuildMetricsDisplayContainer;
