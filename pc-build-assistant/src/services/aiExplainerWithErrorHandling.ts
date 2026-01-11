/**
 * AI Explainer Service with Error Handling
 * Wraps AI explainer functions with error handling, timeouts, and fallbacks
 * Requirements: 3.1, 4.1, 7.1, 8.2
 */

import {
    Component,
} from '../types/components';
import {
    PartialBuild,
    CompleteBuild,
    UserPreferences,
} from '../types/build';
import {
    generateTradeOffSummary as originalGenerateTradeOffSummary,
    generateWhyNotExplanation as originalGenerateWhyNotExplanation,
    answerQuery as originalAnswerQuery,
    generateFinalSummary as originalGenerateFinalSummary,
    BuildContext,
    BuildSummary,
} from './aiExplainer';

// Timeout duration for AI operations (10 seconds for Groq)
const AI_TIMEOUT_MS = 10000;

/**
 * Wraps a function with timeout and error handling
 */
function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    fallback: T
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('AI operation timed out')), timeoutMs)
        ),
    ]).catch((error) => {
        console.error('AI operation failed:', error);
        return fallback;
    });
}

/**
 * Generates fallback trade-off summary
 */
function getFallbackTradeOffSummary(
    options: Component[],
    mode: 'beginner' | 'advanced'
): string {
    if (options.length === 0) {
        return 'No components available for comparison.';
    }

    if (options.length === 1) {
        return `Only one option available: ${options[0].name} at $${options[0].price}.`;
    }

    const sortedOptions = [...options].sort((a, b) => a.price - b.price);

    if (mode === 'beginner') {
        return `You have ${options.length} options ranging from $${sortedOptions[0].price} to $${sortedOptions[sortedOptions.length - 1].price}. Compare the specifications to find the best fit for your needs.`;
    } else {
        return `${options.length} ${options[0].type} options available. Price range: $${sortedOptions[0].price} - $${sortedOptions[sortedOptions.length - 1].price}. Review detailed specifications below.`;
    }
}

/**
 * Generates fallback "Why Not" explanation
 */
function getFallbackWhyNotExplanation(
    component: Component,
    mode: 'beginner' | 'advanced'
): string {
    if (mode === 'beginner') {
        return `The ${component.name} is a valid option, but other components may offer better value or performance for your specific needs. Consider your budget and use case when making your selection.`;
    } else {
        return `${component.name} ($${component.price}) - Review specifications and compare with other options to determine if this component aligns with your build requirements and budget constraints.`;
    }
}

/**
 * Generates fallback query response
 */
function getFallbackQueryResponse(query: string): string {
    return `I'm having trouble processing your question right now. Please try:\n- Asking about component compatibility\n- Requesting upgrade recommendations\n- Inquiring about power requirements\n- Checking budget allocation`;
}

/**
 * Generates fallback build summary
 */
function getFallbackBuildSummary(build: CompleteBuild): BuildSummary {
    const totalCost = [
        build.cpu,
        build.gpu,
        build.motherboard,
        build.ram,
        build.psu,
        ...build.storage,
    ].reduce((sum, component) => sum + component.price, 0);

    return {
        explanation: `Your build includes ${build.cpu.name}, ${build.gpu.name}, and ${build.motherboard.name} with a total cost of $${totalCost}. This configuration should provide solid performance for your intended use case.`,
        strengths: [
            'All components are compatible',
            'Build meets basic requirements',
        ],
        weaknesses: [],
        useCaseFit: 'This build should handle general computing tasks effectively.',
        upgradeRecommendations: [],
        keyTradeOffs: [
            'Component selection balanced cost and performance',
        ],
    };
}

/**
 * Generates trade-off summary with error handling and timeout
 * Requirements: 3.1
 */
export async function generateTradeOffSummary(
    options: Component[],
    context: BuildContext
): Promise<string> {
    try {
        const result = await withTimeout(
            originalGenerateTradeOffSummary(options, context),
            AI_TIMEOUT_MS,
            getFallbackTradeOffSummary(options, context.mode)
        );
        return result;
    } catch (error) {
        console.error('Error generating trade-off summary:', error);
        return getFallbackTradeOffSummary(options, context.mode);
    }
}

/**
 * Generates "Why Not" explanation with error handling
 * Requirements: 4.1
 */
export async function generateWhyNotExplanation(
    component: Component,
    selectedComponent: Component | undefined,
    context: BuildContext
): Promise<string> {
    try {
        return await withTimeout(
            originalGenerateWhyNotExplanation(component, selectedComponent, context),
            AI_TIMEOUT_MS,
            getFallbackWhyNotExplanation(component, context.mode)
        );
    } catch (error) {
        console.error('Error generating Why Not explanation:', error);
        return getFallbackWhyNotExplanation(component, context.mode);
    }
}

/**
 * Answers conversational queries with error handling
 * Requirements: 7.1
 */
export async function answerQuery(
    query: string,
    build: PartialBuild,
    preferences: UserPreferences
): Promise<string> {
    try {
        return await withTimeout(
            originalAnswerQuery(query, build, preferences),
            AI_TIMEOUT_MS,
            getFallbackQueryResponse(query)
        );
    } catch (error) {
        console.error('Error answering query:', error);
        return getFallbackQueryResponse(query);
    }
}

/**
 * Generates final build summary with error handling
 * Requirements: 8.2
 */
export async function generateFinalSummary(build: CompleteBuild): Promise<BuildSummary> {
    try {
        return await withTimeout(
            originalGenerateFinalSummary(build),
            AI_TIMEOUT_MS,
            getFallbackBuildSummary(build)
        );
    } catch (error) {
        console.error('Error generating final summary:', error);
        return getFallbackBuildSummary(build);
    }
}

// Re-export types for convenience
export type { BuildContext, BuildSummary };
