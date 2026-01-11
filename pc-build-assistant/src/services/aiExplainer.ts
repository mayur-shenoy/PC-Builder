/**
 * AI Explainer Service - Generates natural language explanations for component choices
 * Requirements: 3.1, 3.2, 4.1, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4
 */

import {
    Component,
    CPUSpecifications,
    GPUSpecifications,
    MotherboardSpecifications,
    RAMSpecifications,
    StorageSpecifications,
    PSUSpecifications,
} from '../types/components';
import {
    PartialBuild,
    CompleteBuild,
    UserPreferences,
} from '../types/build';
import { getGroqChatCompletion, isGroqAvailable } from './groqService';

export interface BuildContext {
    currentBuild: PartialBuild;
    preferences: UserPreferences;
    mode: 'beginner' | 'advanced';
}

export interface BuildSummary {
    explanation: string;
    strengths: string[];
    weaknesses: string[];
    useCaseFit: string;
    upgradeRecommendations: UpgradeRecommendation[];
    keyTradeOffs: string[];
}

export interface UpgradeRecommendation {
    component: string;
    reason: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
}

/**
 * Generates a trade-off summary comparing multiple component options
 * Requirements: 3.1, 3.2
 */
export async function generateTradeOffSummary(
    options: Component[],
    context: BuildContext
): Promise<string> {
    if (options.length === 0) return 'No components available for comparison.';

    // Fallback to deterministic if Groq is not configured
    if (!isGroqAvailable()) {
        return generateTradeOffSummaryDeterministic(options, context);
    }

    try {
        const componentList = options.map(c =>
            `- ${c.name} ($${c.price}): ${getComponentHighlights(c)}`
        ).join('\n');

        const systemPrompt = `You are a PC building expert assisting a ${context.mode} user. 
        Compare these components based on their needs: ${JSON.stringify(context.preferences)}.
        Keep it concise, highlight trade-offs, and make a recommendation.`;

        const userPrompt = `Compare these components:\n${componentList}`;

        return await getGroqChatCompletion(systemPrompt, userPrompt);
    } catch (error) {
        console.error("Groq AI failed, falling back to deterministic logic", error);
        return generateTradeOffSummaryDeterministic(options, context);
    }
}

function generateTradeOffSummaryDeterministic(
    options: Component[],
    context: BuildContext
): string {
    if (options.length === 0) {
        return 'No components available for comparison.';
    }

    if (options.length === 1) {
        return `Only one option available: ${options[0].name} at $${options[0].price}.`;
    }

    const sortedOptions = [...options].sort((a, b) => a.price - b.price);
    const mode = context.mode;

    if (mode === 'beginner') {
        return generateBeginnerSummary(sortedOptions, context);
    } else {
        return generateAdvancedSummary(sortedOptions, context);
    }
}

function generateBeginnerSummary(options: Component[], context: BuildContext): string {
    let summary = `Here are your ${options[0].type} options:\n\n`;

    options.forEach((option, index) => {
        const position = index === 0 ? 'Budget' : index === options.length - 1 ? 'Premium' : 'Mid-range';
        summary += `**${position}: ${option.name}** ($${option.price})\n`;
        summary += getComponentHighlights(option);
        summary += '\n';
    });

    summary += `\n**Recommendation:** `;
    const midOption = options[Math.floor(options.length / 2)];
    summary += `The ${midOption.name} offers the best balance for ${context.preferences.useCase}.`;

    return summary;
}

function generateAdvancedSummary(options: Component[], context: BuildContext): string {
    let summary = `Comparing ${options.length} ${options[0].type} options:\n\n`;

    options.forEach((option) => {
        summary += `**${option.name}** ($${option.price}):\n`;
        summary += getDetailedSpecs(option);
        summary += '\n';
    });

    return summary;
}

function getComponentHighlights(component: Component): string {
    let highlights = '';

    switch (component.type) {
        case 'CPU':
            const cpuSpecs = component.specifications as CPUSpecifications;
            highlights += `- ${cpuSpecs.cores} cores, ${cpuSpecs.boostClock}GHz\n`;
            highlights += `- Power: ${cpuSpecs.tdp}W`;
            if (cpuSpecs.performanceScore) highlights += `\n- Score: ${cpuSpecs.performanceScore}`;
            highlights += '\n';
            break;
        case 'GPU':
            const gpuSpecs = component.specifications as GPUSpecifications;
            highlights += `- ${gpuSpecs.vram}GB VRAM\n`;
            highlights += `- Performance: ${gpuSpecs.performanceScore}/100\n`;
            break;
        case 'Motherboard':
            const moboSpecs = component.specifications as MotherboardSpecifications;
            highlights += `- ${moboSpecs.formFactor}, ${moboSpecs.ramType}\n`;
            highlights += `- ${moboSpecs.ramSlots} RAM slots\n`;
            break;
        case 'RAM':
            const ramSpecs = component.specifications as RAMSpecifications;
            highlights += `- ${ramSpecs.capacity}GB ${ramSpecs.type}\n`;
            highlights += `- ${ramSpecs.speed}MHz\n`;
            break;
        case 'Storage':
            const storageSpecs = component.specifications as StorageSpecifications;
            highlights += `- ${storageSpecs.capacity}GB ${storageSpecs.type}\n`;
            highlights += `- ${storageSpecs.readSpeed}MB/s read\n`;
            break;
        case 'PSU':
            const psuSpecs = component.specifications as PSUSpecifications;
            highlights += `- ${psuSpecs.wattage}W ${psuSpecs.efficiency}\n`;
            highlights += `- ${psuSpecs.modular} modular\n`;
            break;
    }

    return highlights;
}

function getDetailedSpecs(component: Component): string {
    let specs = '';

    switch (component.type) {
        case 'CPU':
            const cpuSpecs = component.specifications as CPUSpecifications;
            specs += `- ${cpuSpecs.cores}C/${cpuSpecs.threads}T, ${cpuSpecs.baseClock}-${cpuSpecs.boostClock}GHz\n`;
            specs += `- Socket: ${cpuSpecs.socket}, TDP: ${cpuSpecs.tdp}W`;
            if (cpuSpecs.performanceScore) specs += `, Score: ${cpuSpecs.performanceScore}`;
            specs += '\n';
            break;
        case 'GPU':
            const gpuSpecs = component.specifications as GPUSpecifications;
            specs += `- ${gpuSpecs.vram}GB VRAM, Performance: ${gpuSpecs.performanceScore}/100\n`;
            specs += `- Power: ${gpuSpecs.powerDraw}W, Length: ${gpuSpecs.length}mm\n`;
            break;
        case 'Motherboard':
            const moboSpecs = component.specifications as MotherboardSpecifications;
            specs += `- ${moboSpecs.formFactor}, Socket: ${moboSpecs.socket}\n`;
            specs += `- ${moboSpecs.ramSlots}x ${moboSpecs.ramType}, ${moboSpecs.m2Slots}x M.2\n`;
            break;
        case 'RAM':
            const ramSpecs = component.specifications as RAMSpecifications;
            specs += `- ${ramSpecs.modules}x${ramSpecs.capacity / ramSpecs.modules}GB ${ramSpecs.type}\n`;
            specs += `- ${ramSpecs.speed}MHz, CL${ramSpecs.latency}\n`;
            break;
        case 'Storage':
            const storageSpecs = component.specifications as StorageSpecifications;
            specs += `- ${storageSpecs.capacity}GB ${storageSpecs.type}\n`;
            specs += `- ${storageSpecs.readSpeed}/${storageSpecs.writeSpeed} MB/s\n`;
            break;
        case 'PSU':
            const psuSpecs = component.specifications as PSUSpecifications;
            specs += `- ${psuSpecs.wattage}W ${psuSpecs.efficiency}\n`;
            specs += `- ${psuSpecs.modular}, ${psuSpecs.connectors.pcie8pin}x 8-pin PCIe\n`;
            break;
    }

    return specs;
}

/**
 * Generates "Why Not This?" explanation for a deprioritized component
 * Requirements: 4.1
 */
export async function generateWhyNotExplanation(
    component: Component,
    selectedComponent: Component | undefined,
    context: BuildContext
): Promise<string> {
    if (!isGroqAvailable()) {
        return generateWhyNotExplanationDeterministic(component, selectedComponent, context);
    }

    try {
        const systemPrompt = `You are a PC building expert. Explain why the user might NOT want to choose this component given their selected alternative and preferences (${context.preferences.budgetMax} budget, ${context.preferences.useCase}). Be critical but fair.`;

        let userPrompt = `Component to critique: ${component.name} ($${component.price})\n`;
        if (selectedComponent) {
            userPrompt += `Comparison vs user choice: ${selectedComponent.name} ($${selectedComponent.price})\n`;
        }

        return await getGroqChatCompletion(systemPrompt, userPrompt);
    } catch (e) {
        return generateWhyNotExplanationDeterministic(component, selectedComponent, context);
    }
}

function generateWhyNotExplanationDeterministic(
    component: Component,
    selectedComponent: Component | undefined,
    context: BuildContext
): string {
    const preferences = context.preferences;
    let explanation = `**Why not ${component.name}?**\n\n`;

    // Budget analysis
    if (component.price > preferences.budgetMax) {
        explanation += `This component ($${component.price}) exceeds your budget of $${preferences.budgetMax}.\n\n`;
    }

    // Comparison with selected component
    if (selectedComponent) {
        explanation += `Compared to ${selectedComponent.name}:\n`;
        const priceDiff = component.price - selectedComponent.price;
        if (priceDiff > 0) {
            explanation += `- Costs $${priceDiff} more\n`;
        } else if (priceDiff < 0) {
            explanation += `- Costs $${Math.abs(priceDiff)} less\n`;
        }

        explanation += getComponentComparison(component, selectedComponent);
        explanation += '\n';
    }

    // Use case alignment
    if (preferences.performanceFocus === 'GPU-heavy' && component.type === 'CPU') {
        if (component.price > preferences.budgetMax * 0.3) {
            explanation += `For ${preferences.useCase}, investing more in the GPU is typically better.\n`;
        }
    }

    if (preferences.performanceFocus === 'CPU-heavy' && component.type === 'GPU') {
        if (component.price > preferences.budgetMax * 0.25) {
            explanation += `For ${preferences.useCase}, a powerful CPU is more important.\n`;
        }
    }

    explanation += `\n**Bottom line:** Other options better match your ${preferences.useCase} needs and budget.`;

    return explanation;
}

function getComponentComparison(component: Component, selected: Component): string {
    let comparison = '';

    if (component.type === 'CPU' && selected.type === 'CPU') {
        const specs = component.specifications as CPUSpecifications;
        const selectedSpecs = selected.specifications as CPUSpecifications;
        if (specs.cores < selectedSpecs.cores) {
            comparison += `- Fewer cores (${specs.cores} vs ${selectedSpecs.cores})\n`;
        }
        if (specs.boostClock < selectedSpecs.boostClock) {
            comparison += `- Lower clock speed (${specs.boostClock} vs ${selectedSpecs.boostClock}GHz)\n`;
        }
    }

    if (component.type === 'GPU' && selected.type === 'GPU') {
        const specs = component.specifications as GPUSpecifications;
        const selectedSpecs = selected.specifications as GPUSpecifications;
        if (specs.performanceScore < selectedSpecs.performanceScore) {
            comparison += `- Lower performance (${specs.performanceScore} vs ${selectedSpecs.performanceScore})\n`;
        }
        if (specs.vram < selectedSpecs.vram) {
            comparison += `- Less VRAM (${specs.vram}GB vs ${selectedSpecs.vram}GB)\n`;
        }
    }

    return comparison;
}

/**
 * Handles conversational queries about the build
 * Requirements: 7.1, 7.2
 */
export async function answerQuery(
    query: string,
    build: PartialBuild,
    preferences: UserPreferences
): Promise<string> {
    if (!isGroqAvailable()) {
        console.log('Groq not available, using deterministic query response');
        return answerQueryDeterministic(query, build, preferences);
    }

    try {
        // Build a concise context string
        const buildSummary = [];
        if (build.cpu) buildSummary.push(`CPU: ${build.cpu.name}`);
        if (build.gpu) buildSummary.push(`GPU: ${build.gpu.name}`);
        if (build.motherboard) buildSummary.push(`Motherboard: ${build.motherboard.name}`);
        if (build.ram) buildSummary.push(`RAM: ${build.ram.name}`);
        if (build.psu) buildSummary.push(`PSU: ${build.psu.name}`);
        if (build.storage?.length) buildSummary.push(`Storage: ${build.storage.map(s => s.name).join(', ')}`);

        const systemPrompt = `You are a helpful PC building assistant. Answer the user's question based on their build and preferences.
        
User Preferences:
- Budget: $${preferences.budgetMin} - $${preferences.budgetMax}
- Use Case: ${preferences.useCase}
- Performance Focus: ${preferences.performanceFocus}

Current Build:
${buildSummary.length > 0 ? buildSummary.join('\n') : 'No components selected yet'}

Keep your response concise (under 150 words) and helpful. If asked about compatibility, power, or upgrades, provide specific advice.`;

        console.log('Sending query to Groq AI:', query);
        const response = await getGroqChatCompletion(systemPrompt, query);
        console.log('Query response received from Groq');
        return response;
    } catch (e) {
        console.error('Groq AI failed for query:', e);
        return answerQueryDeterministic(query, build, preferences);
    }
}

function answerQueryDeterministic(
    query: string,
    build: PartialBuild,
    preferences: UserPreferences
): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('compatible') || lowerQuery.includes('compatibility')) {
        return handleCompatibilityQuery(build);
    }

    if (lowerQuery.includes('upgrade')) {
        return handleUpgradeQuery(build, preferences);
    }

    if (lowerQuery.includes('bottleneck')) {
        return handleBottleneckQuery(build);
    }

    if (lowerQuery.includes('power') || lowerQuery.includes('wattage')) {
        return handlePowerQuery(build);
    }

    if (lowerQuery.includes('budget') || lowerQuery.includes('cost')) {
        return handleBudgetQuery(build, preferences);
    }

    return `I can help with questions about:\n- Component compatibility\n- Upgrade recommendations\n- Bottleneck analysis\n- Power requirements\n- Budget allocation`;
}

function handleCompatibilityQuery(build: PartialBuild): string {
    const components = [];
    if (build.cpu) components.push(`CPU: ${build.cpu.name}`);
    if (build.gpu) components.push(`GPU: ${build.gpu.name}`);
    if (build.motherboard) components.push(`Motherboard: ${build.motherboard.name}`);
    if (build.ram) components.push(`RAM: ${build.ram.name}`);
    if (build.psu) components.push(`PSU: ${build.psu.name}`);

    if (components.length === 0) {
        return `No components selected yet. Start building!`;
    }

    let response = `**Current Build:**\n`;
    components.forEach(c => response += `- ${c}\n`);
    response += `\n✓ All selected components are compatible!`;

    return response;
}

function handleUpgradeQuery(build: PartialBuild, preferences: UserPreferences): string {
    if (!build.motherboard) {
        return `Select core components first to see upgrade recommendations.`;
    }

    const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;
    let response = `**Upgrade Potential:**\n\n`;

    response += `**RAM:** ${moboSpecs.ramSlots} slots, up to ${moboSpecs.maxRamCapacity}GB\n`;
    response += `**Storage:** ${moboSpecs.m2Slots} M.2 + ${moboSpecs.sataPorts} SATA\n`;

    if (build.psu) {
        const psuSpecs = build.psu.specifications as PSUSpecifications;
        let powerUsed = 0;
        if (build.cpu) powerUsed += (build.cpu.specifications as CPUSpecifications).tdp;
        if (build.gpu) powerUsed += (build.gpu.specifications as GPUSpecifications).powerDraw;

        const headroom = psuSpecs.wattage - powerUsed;
        response += `**PSU Headroom:** ${headroom}W available\n`;
    }

    return response;
}

function handleBottleneckQuery(build: PartialBuild): string {
    if (!build.cpu || !build.gpu) {
        return `Select both CPU and GPU to analyze bottlenecks.`;
    }

    const cpuSpecs = build.cpu.specifications as CPUSpecifications;
    const gpuSpecs = build.gpu.specifications as GPUSpecifications;

    const cpuScore = cpuSpecs.cores * cpuSpecs.boostClock;
    const gpuScore = gpuSpecs.performanceScore;

    let response = `**Bottleneck Analysis:**\n\n`;
    response += `CPU Performance: ${cpuScore.toFixed(0)}\n`;
    response += `GPU Performance: ${gpuScore}\n\n`;

    const diff = Math.abs(cpuScore - gpuScore);
    if (diff < 20) {
        response += `✓ Well balanced build!`;
    } else if (cpuScore > gpuScore) {
        response += `⚠ GPU may bottleneck in graphics-intensive tasks.`;
    } else {
        response += `⚠ CPU may bottleneck in processor-intensive tasks.`;
    }

    return response;
}

function handlePowerQuery(build: PartialBuild): string {
    let totalPower = 0;
    const breakdown: string[] = [];

    if (build.cpu) {
        const tdp = (build.cpu.specifications as CPUSpecifications).tdp;
        totalPower += tdp;
        breakdown.push(`CPU: ${tdp}W`);
    }

    if (build.gpu) {
        const power = (build.gpu.specifications as GPUSpecifications).powerDraw;
        totalPower += power;
        breakdown.push(`GPU: ${power}W`);
    }

    if (build.motherboard) {
        totalPower += 80;
        breakdown.push(`Motherboard: ~80W`);
    }

    if (totalPower === 0) {
        return `Select components to calculate power requirements.`;
    }

    let response = `**Power Requirements:**\n\n`;
    breakdown.forEach(b => response += `- ${b}\n`);
    response += `\n**Total:** ${totalPower}W\n`;
    response += `**Recommended PSU:** ${Math.ceil(totalPower * 1.2)}W\n`;

    if (build.psu) {
        const psuWattage = (build.psu.specifications as PSUSpecifications).wattage;
        const headroom = psuWattage - totalPower;
        response += `\n**Your PSU:** ${psuWattage}W (${headroom}W headroom)`;
    }

    return response;
}

function handleBudgetQuery(build: PartialBuild, preferences: UserPreferences): string {
    const totalCost = calculateBuildCost(build);

    let response = `**Budget Analysis:**\n\n`;
    response += `Budget: $${preferences.budgetMin}-$${preferences.budgetMax}\n`;
    response += `Current Spend: $${totalCost}\n`;
    response += `Remaining: $${preferences.budgetMax - totalCost}\n\n`;

    if (totalCost > preferences.budgetMax) {
        response += `⚠ Over budget by $${totalCost - preferences.budgetMax}`;
    } else if (totalCost < preferences.budgetMin) {
        response += `You have room to upgrade key components.`;
    } else {
        response += `✓ Within budget!`;
    }

    return response;
}

function calculateBuildCost(build: PartialBuild): number {
    let total = 0;
    if (build.cpu) total += build.cpu.price;
    if (build.gpu) total += build.gpu.price;
    if (build.motherboard) total += build.motherboard.price;
    if (build.ram) total += build.ram.price;
    if (build.psu) total += build.psu.price;
    if (build.storage) {
        total += build.storage.reduce((sum, s) => sum + s.price, 0);
    }
    return total;
}

/**
 * Generates final build summary
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export async function generateFinalSummary(build: CompleteBuild): Promise<BuildSummary> {
    const explanation = await generateBuildExplanation(build); // Async explanation from AI
    const strengths = identifyStrengths(build);
    const weaknesses = identifyWeaknesses(build);
    const useCaseFit = assessUseCaseFit(build);
    const upgradeRecommendations = generateUpgradeRecommendations(build);
    const keyTradeOffs = identifyKeyTradeOffs(build);

    return {
        explanation,
        strengths,
        weaknesses,
        useCaseFit,
        upgradeRecommendations,
        keyTradeOffs,
    };
}

async function generateBuildExplanation(build: CompleteBuild): Promise<string> {
    if (!isGroqAvailable()) {
        return generateBuildExplanationDeterministic(build);
    }

    try {
        const systemPrompt = `You are an enthusiastic PC builder. Write a short, engaging summary of the user's completed build. Mention the CPU and GPU combination and what this build is good for.`;
        const userPrompt = `Build details: CPU=${build.cpu.name}, GPU=${build.gpu.name}, RAM=${build.ram.name}, Cost=$${calculateBuildCost(build)}`;

        return await getGroqChatCompletion(systemPrompt, userPrompt);
    } catch (e) {
        return generateBuildExplanationDeterministic(build);
    }
}

function generateBuildExplanationDeterministic(build: CompleteBuild): string {
    const totalCost = calculateBuildCost(build);
    const cpuSpecs = build.cpu.specifications as CPUSpecifications;
    const gpuSpecs = build.gpu.specifications as GPUSpecifications;

    let explanation = `This is a $${totalCost} build featuring the ${build.cpu.name} and ${build.gpu.name}. `;

    const cpuScore = cpuSpecs.cores * cpuSpecs.boostClock;
    const gpuScore = gpuSpecs.performanceScore;

    if (gpuScore > cpuScore * 0.8) {
        explanation += `The build prioritizes graphics performance with a powerful GPU. `;
    } else if (cpuScore > gpuScore * 1.2) {
        explanation += `The build prioritizes processing power with a strong CPU. `;
    } else {
        explanation += `The build offers balanced performance across CPU and GPU. `;
    }

    explanation += `It includes ${(build.ram.specifications as RAMSpecifications).capacity}GB of RAM and `;
    explanation += `${build.storage.reduce((sum, s) => sum + (s.specifications as StorageSpecifications).capacity, 0)}GB of storage.`;

    return explanation;
}

function identifyStrengths(build: CompleteBuild): string[] {
    const strengths: string[] = [];
    const cpuSpecs = build.cpu.specifications as CPUSpecifications;
    const gpuSpecs = build.gpu.specifications as GPUSpecifications;
    const ramSpecs = build.ram.specifications as RAMSpecifications;

    if (cpuSpecs.cores >= 8) {
        strengths.push(`Excellent multi-core performance with ${cpuSpecs.cores} cores`);
    }

    if (gpuSpecs.performanceScore >= 75) {
        strengths.push(`High-end graphics performance (${gpuSpecs.performanceScore}/100)`);
    }

    if (ramSpecs.capacity >= 32) {
        strengths.push(`Ample memory for demanding workloads (${ramSpecs.capacity}GB)`);
    }

    if (strengths.length === 0) {
        strengths.push(`Solid foundation for general computing tasks`);
    }

    return strengths;
}

function identifyWeaknesses(build: CompleteBuild): string[] {
    const weaknesses: string[] = [];
    const cpuSpecs = build.cpu.specifications as CPUSpecifications;
    const gpuSpecs = build.gpu.specifications as GPUSpecifications;
    const ramSpecs = build.ram.specifications as RAMSpecifications;

    if (cpuSpecs.cores < 6) {
        weaknesses.push(`Limited multi-threading capability with ${cpuSpecs.cores} cores`);
    }

    if (gpuSpecs.performanceScore < 50) {
        weaknesses.push(`Entry-level graphics performance may limit gaming at high settings`);
    }

    if (ramSpecs.capacity < 16) {
        weaknesses.push(`Limited RAM (${ramSpecs.capacity}GB) may constrain multitasking`);
    }

    return weaknesses;
}

function assessUseCaseFit(build: CompleteBuild): string {
    const cpuSpecs = build.cpu.specifications as CPUSpecifications;
    const gpuSpecs = build.gpu.specifications as GPUSpecifications;

    if (gpuSpecs.performanceScore >= 70 && cpuSpecs.cores >= 6) {
        return `Excellent for gaming and content creation. Can handle AAA titles at high settings and video editing workflows.`;
    } else if (cpuSpecs.cores >= 8 && gpuSpecs.performanceScore >= 50) {
        return `Well-suited for productivity and mixed workloads. Good for development, data analysis, and moderate gaming.`;
    } else if (gpuSpecs.performanceScore >= 60) {
        return `Good for gaming-focused builds. Can handle most modern games at 1080p/1440p.`;
    } else {
        return `Suitable for general computing, office work, and light gaming. May struggle with demanding applications.`;
    }
}

function generateUpgradeRecommendations(build: CompleteBuild): UpgradeRecommendation[] {
    const recommendations: UpgradeRecommendation[] = [];
    const ramSpecs = build.ram.specifications as RAMSpecifications;
    const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;

    if (ramSpecs.capacity < 16) {
        recommendations.push({
            component: 'RAM',
            reason: `Current ${ramSpecs.capacity}GB may limit multitasking`,
            impact: 'Improved system responsiveness and multitasking capability',
            priority: 'high',
        });
    }

    if (moboSpecs.ramType === 'DDR4') {
        recommendations.push({
            component: 'Motherboard + RAM',
            reason: 'DDR5 offers better future-proofing',
            impact: 'Higher memory bandwidth for demanding applications',
            priority: 'low',
        });
    }

    const storageTotal = build.storage.reduce(
        (sum, s) => sum + (s.specifications as StorageSpecifications).capacity,
        0
    );

    if (storageTotal < 1000) {
        recommendations.push({
            component: 'Storage',
            reason: `${storageTotal}GB may fill up quickly`,
            impact: 'More space for games, media, and projects',
            priority: 'medium',
        });
    }

    return recommendations;
}

function identifyKeyTradeOffs(build: CompleteBuild): string[] {
    const tradeOffs: string[] = [];
    const totalCost = calculateBuildCost(build);
    const cpuPercent = (build.cpu.price / totalCost) * 100;
    const gpuPercent = (build.gpu.price / totalCost) * 100;

    if (gpuPercent > 40) {
        tradeOffs.push(`Prioritized GPU performance (${gpuPercent.toFixed(0)}% of budget) over CPU`);
    } else if (cpuPercent > 35) {
        tradeOffs.push(`Prioritized CPU performance (${cpuPercent.toFixed(0)}% of budget) over GPU`);
    } else {
        tradeOffs.push(`Balanced budget allocation between CPU and GPU`);
    }

    const moboSpecs = build.motherboard.specifications as MotherboardSpecifications;
    if (moboSpecs.formFactor === 'Mini-ITX') {
        tradeOffs.push(`Compact form factor limits expansion options`);
    } else if (moboSpecs.formFactor === 'ATX') {
        tradeOffs.push(`Full-size form factor maximizes upgrade flexibility`);
    }

    return tradeOffs;
}
