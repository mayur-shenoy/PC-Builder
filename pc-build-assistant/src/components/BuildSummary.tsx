/**
 * BuildSummary Component
 * Requirements: 8.2, 8.3, 8.4
 * 
 * Displays the final build summary with AI-generated explanations,
 * strengths, weaknesses, use-case fit, upgrade recommendations, and key trade-offs
 */

import React from 'react';
import type { CompleteBuild, BuildMetrics } from '../types/build';
import type { BuildSummary as BuildSummaryType } from '../services/aiExplainer';
import { FinalBuildVisual } from './FinalBuildVisual';
import {
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    StorageSpecifications,
    PSUSpecifications,
} from '../types/components';
import './BuildSummary.css';

export interface BuildSummaryProps {
    build: CompleteBuild;
    summary: BuildSummaryType;
    metrics: BuildMetrics;
    mode: 'beginner' | 'advanced';
    onStartNewBuild?: () => void;
}

/**
 * BuildSummary displays the final build summary
 * Requirements: 8.2, 8.3, 8.4
 */
export const BuildSummary: React.FC<BuildSummaryProps> = ({
    build,
    summary,
    metrics,
    onStartNewBuild,
}) => {
    // Calculate total cost
    const totalCost =
        build.cpu.price +
        build.gpu.price +
        build.motherboard.price +
        build.ram.price +
        build.psu.price +
        build.storage.reduce((sum, s) => sum + s.price, 0);

    // Generate and download build specifications
    const handleDownloadBuild = () => {
        const cpuSpecs = build.cpu.specifications as CPUSpecifications;
        const gpuSpecs = build.gpu.specifications as GPUSpecifications;
        const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;
        const ramSpecs = build.ram.specifications as RAMSpecifications;
        const psuSpecs = build.psu.specifications as PSUSpecifications;

        const buildDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let content = `
╔══════════════════════════════════════════════════════════════════╗
║                    PC BUILD SPECIFICATIONS                        ║
║                    Generated: ${buildDate.padEnd(24)}             ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                           BUILD OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.explanation}

TOTAL COST: $${totalCost.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         COMPONENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ CPU: ${build.cpu.name.padEnd(55)}│
├─────────────────────────────────────────────────────────────────┤
│ Manufacturer: ${build.cpu.manufacturer.padEnd(47)}│
│ Price: $${build.cpu.price.toString().padEnd(53)}│
│ Cores: ${cpuSpecs.cores.toString().padEnd(54)}│
│ Threads: ${cpuSpecs.threads.toString().padEnd(52)}│
│ Base Clock: ${cpuSpecs.baseClock} GHz${' '.repeat(47 - cpuSpecs.baseClock.toString().length)}│
│ Boost Clock: ${cpuSpecs.boostClock} GHz${' '.repeat(46 - cpuSpecs.boostClock.toString().length)}│
│ Socket: ${cpuSpecs.socket.padEnd(53)}│
│ TDP: ${cpuSpecs.tdp}W${' '.repeat(55 - cpuSpecs.tdp.toString().length)}│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GPU: ${build.gpu.name.padEnd(55)}│
├─────────────────────────────────────────────────────────────────┤
│ Manufacturer: ${build.gpu.manufacturer.padEnd(47)}│
│ Price: $${build.gpu.price.toString().padEnd(53)}│
│ VRAM: ${gpuSpecs.vram}GB${' '.repeat(54 - gpuSpecs.vram.toString().length)}│
│ Power Draw: ${gpuSpecs.powerDraw}W${' '.repeat(49 - gpuSpecs.powerDraw.toString().length)}│
│ Length: ${gpuSpecs.length}mm${' '.repeat(52 - gpuSpecs.length.toString().length)}│
│ Performance Score: ${gpuSpecs.performanceScore}/100${' '.repeat(40 - gpuSpecs.performanceScore.toString().length)}│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MOTHERBOARD: ${build.motherboard.name.padEnd(47)}│
├─────────────────────────────────────────────────────────────────┤
│ Manufacturer: ${build.motherboard.manufacturer.padEnd(47)}│
│ Price: $${build.motherboard.price.toString().padEnd(53)}│
│ Socket: ${moboSpecs.socket.padEnd(53)}│
│ Form Factor: ${moboSpecs.formFactor.padEnd(48)}│
│ RAM Type: ${moboSpecs.ramType.padEnd(51)}│
│ RAM Slots: ${moboSpecs.ramSlots.toString().padEnd(50)}│
│ M.2 Slots: ${moboSpecs.m2Slots.toString().padEnd(50)}│
│ SATA Ports: ${moboSpecs.sataPorts.toString().padEnd(49)}│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ RAM: ${build.ram.name.padEnd(55)}│
├─────────────────────────────────────────────────────────────────┤
│ Manufacturer: ${build.ram.manufacturer.padEnd(47)}│
│ Price: $${build.ram.price.toString().padEnd(53)}│
│ Capacity: ${ramSpecs.capacity}GB${' '.repeat(50 - ramSpecs.capacity.toString().length)}│
│ Type: ${ramSpecs.type.padEnd(55)}│
│ Speed: ${ramSpecs.speed} MHz${' '.repeat(50 - ramSpecs.speed.toString().length)}│
│ Modules: ${ramSpecs.modules.toString().padEnd(52)}│
│ Latency: CL${ramSpecs.latency.toString().padEnd(50)}│
└─────────────────────────────────────────────────────────────────┘

`;

        // Add storage components
        build.storage.forEach((storage, index) => {
            const storageSpecs = storage.specifications as StorageSpecifications;
            content += `┌─────────────────────────────────────────────────────────────────┐
│ STORAGE ${(index + 1).toString()}: ${storage.name.padEnd(50)}│
├─────────────────────────────────────────────────────────────────┤
│ Manufacturer: ${storage.manufacturer.padEnd(47)}│
│ Price: $${storage.price.toString().padEnd(53)}│
│ Capacity: ${storageSpecs.capacity}GB${' '.repeat(50 - storageSpecs.capacity.toString().length)}│
│ Type: ${storageSpecs.type.padEnd(55)}│
│ Read Speed: ${storageSpecs.readSpeed} MB/s${' '.repeat(44 - storageSpecs.readSpeed.toString().length)}│
│ Write Speed: ${storageSpecs.writeSpeed} MB/s${' '.repeat(43 - storageSpecs.writeSpeed.toString().length)}│
└─────────────────────────────────────────────────────────────────┘

`;
        });

        content += `┌─────────────────────────────────────────────────────────────────┐
│ PSU: ${build.psu.name.padEnd(55)}│
├─────────────────────────────────────────────────────────────────┤
│ Manufacturer: ${build.psu.manufacturer.padEnd(47)}│
│ Price: $${build.psu.price.toString().padEnd(53)}│
│ Wattage: ${psuSpecs.wattage}W${' '.repeat(51 - psuSpecs.wattage.toString().length)}│
│ Efficiency: ${psuSpecs.efficiency.padEnd(49)}│
│ Modular: ${psuSpecs.modular.padEnd(52)}│
└─────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            STRENGTHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.strengths.map(s => `  ✓ ${s}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          CONSIDERATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.weaknesses.length > 0 ? summary.weaknesses.map(w => `  ⚠ ${w}`).join('\n') : '  None identified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          USE CASE FIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.useCaseFit}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         KEY TRADE-OFFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.keyTradeOffs.map(t => `  ⚖ ${t}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      UPGRADE RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.upgradeRecommendations.length > 0
                ? summary.upgradeRecommendations.map(u => `  [${u.priority.toUpperCase()}] ${u.component}
     Reason: ${u.reason}
     Impact: ${u.impact}
`).join('\n')
                : '  No immediate upgrades recommended'}

══════════════════════════════════════════════════════════════════
                    Generated by PC Build Assistant
══════════════════════════════════════════════════════════════════
`;

        // Create and download the file
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `PC_Build_${buildDate.replace(/,?\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="build-summary">
            <div className="summary-header">
                <h1>Your PC Build is Complete!</h1>
                <div className="total-cost">
                    <span className="cost-label">Total Cost:</span>
                    <span className="cost-value">${totalCost.toLocaleString()}</span>
                </div>
            </div>

            {/* AI-Generated Build Explanation - Requirements: 8.2 */}
            <section className="summary-section explanation-section">
                <h2>Build Overview</h2>
                <p className="build-explanation">{summary.explanation}</p>
            </section>

            {/* Final Visual Representation - Requirements: 8.6, 8.7 */}
            <section className="summary-section visual-section">
                <h2>Build Architecture</h2>
                <FinalBuildVisual build={build} metrics={metrics} />
            </section>

            {/* Strengths - Requirements: 8.2 */}
            <section className="summary-section strengths-section">
                <h2>✓ Strengths</h2>
                <ul className="strengths-list">
                    {summary.strengths.map((strength, index) => (
                        <li key={index} className="strength-item">
                            <span className="strength-icon">✓</span>
                            <span className="strength-text">{strength}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Weaknesses - Requirements: 8.2 */}
            {summary.weaknesses.length > 0 && (
                <section className="summary-section weaknesses-section">
                    <h2>⚠ Considerations</h2>
                    <ul className="weaknesses-list">
                        {summary.weaknesses.map((weakness, index) => (
                            <li key={index} className="weakness-item">
                                <span className="weakness-icon">⚠</span>
                                <span className="weakness-text">{weakness}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Use-Case Fit Assessment - Requirements: 8.3 */}
            <section className="summary-section use-case-section">
                <h2>Use Case Fit</h2>
                <p className="use-case-fit">{summary.useCaseFit}</p>
            </section>

            {/* Upgrade Recommendations - Requirements: 8.3 */}
            {summary.upgradeRecommendations.length > 0 && (
                <section className="summary-section upgrades-section">
                    <h2>Future Upgrade Path</h2>
                    <div className="upgrades-list">
                        {summary.upgradeRecommendations.map((upgrade, index) => (
                            <div
                                key={index}
                                className={`upgrade-item priority-${upgrade.priority}`}
                            >
                                <div className="upgrade-header">
                                    <span className="upgrade-component">{upgrade.component}</span>
                                    <span className={`upgrade-priority priority-${upgrade.priority}`}>
                                        {upgrade.priority.toUpperCase()}
                                    </span>
                                </div>
                                <p className="upgrade-reason">{upgrade.reason}</p>
                                <p className="upgrade-impact">
                                    <strong>Impact:</strong> {upgrade.impact}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Key Trade-Offs - Requirements: 8.4 */}
            <section className="summary-section tradeoffs-section">
                <h2>Key Trade-Offs</h2>
                <ul className="tradeoffs-list">
                    {summary.keyTradeOffs.map((tradeOff, index) => (
                        <li key={index} className="tradeoff-item">
                            <span className="tradeoff-icon">⚖</span>
                            <span className="tradeoff-text">{tradeOff}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Component List */}
            <section className="summary-section components-section">
                <h2>Selected Components</h2>
                <div className="components-list">
                    <div className="component-row">
                        <span className="component-type">CPU:</span>
                        <span className="component-name">{build.cpu.name}</span>
                        <span className="component-price">${build.cpu.price}</span>
                    </div>
                    <div className="component-row">
                        <span className="component-type">GPU:</span>
                        <span className="component-name">{build.gpu.name}</span>
                        <span className="component-price">${build.gpu.price}</span>
                    </div>
                    <div className="component-row">
                        <span className="component-type">Motherboard:</span>
                        <span className="component-name">{build.motherboard.name}</span>
                        <span className="component-price">${build.motherboard.price}</span>
                    </div>
                    <div className="component-row">
                        <span className="component-type">RAM:</span>
                        <span className="component-name">{build.ram.name}</span>
                        <span className="component-price">${build.ram.price}</span>
                    </div>
                    {build.storage.map((storage, index) => (
                        <div key={index} className="component-row">
                            <span className="component-type">Storage:</span>
                            <span className="component-name">{storage.name}</span>
                            <span className="component-price">${storage.price}</span>
                        </div>
                    ))}
                    <div className="component-row">
                        <span className="component-type">PSU:</span>
                        <span className="component-name">{build.psu.name}</span>
                        <span className="component-price">${build.psu.price}</span>
                    </div>
                </div>

                {/* Purchase Links - Requirements: 8.5 (Optional) */}
                {/* Note: This is a placeholder. In production, integrate with product API */}
                <div className="purchase-links-note">
                    <p className="api-note">
                        💡 <strong>Ready to purchase?</strong> In a production environment,
                        direct purchase links would be displayed here for each component.
                    </p>
                </div>
            </section>

            {/* Actions */}
            <div className="summary-actions">
                <button
                    className="action-button download-button"
                    onClick={handleDownloadBuild}
                >
                    📥 Download Build Specs
                </button>
                {onStartNewBuild && (
                    <button
                        className="action-button new-build-button"
                        onClick={onStartNewBuild}
                    >
                        Start New Build
                    </button>
                )}
            </div>
        </div>
    );
};
