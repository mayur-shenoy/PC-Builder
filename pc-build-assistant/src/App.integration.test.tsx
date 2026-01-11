/**
 * Integration Test: Complete Build Flow End-to-End
 * Feature: pc-build-assistant, Task 20.1
 * Tests the complete user journey from preferences to final summary
 * Requirements: All
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { useBuildStore } from './store/buildStore';

describe('Complete Build Flow - End-to-End Integration', () => {
    beforeEach(() => {
        // Clear localStorage and reset store before each test
        localStorage.clear();
        useBuildStore.getState().resetBuild();
    });

    describe('Beginner Mode Flow', () => {
        it('should complete full build flow in beginner mode', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Step 1: Verify we start at preferences screen
            expect(screen.getByText(/PC Build Assistant/i)).toBeInTheDocument();
            expect(screen.getByText(/Build your perfect PC/i)).toBeInTheDocument();

            // Step 2: Fill out preferences form in beginner mode
            // Find and fill budget inputs
            const budgetMinInput = screen.getByLabelText(/minimum \(\$\)/i);
            const budgetMaxInput = screen.getByLabelText(/maximum \(\$\)/i);
            await user.clear(budgetMinInput);
            await user.type(budgetMinInput, '1000');
            await user.clear(budgetMaxInput);
            await user.type(budgetMaxInput, '1500');

            // Select use case
            const useCaseSelect = screen.getByLabelText(/use case/i);
            await user.selectOptions(useCaseSelect, 'gaming');

            // Select performance focus
            const performanceSelect = screen.getByLabelText(/priority/i);
            await user.selectOptions(performanceSelect, 'GPU-heavy');

            // Select storage requirements
            const storageSelect = screen.getByLabelText(/storage needs/i);
            await user.selectOptions(storageSelect, 'moderate');

            // Select upgrade horizon
            const upgradeSelect = screen.getByLabelText(/expected lifespan/i);
            await user.selectOptions(upgradeSelect, '3-year');

            // Submit preferences
            const submitButton = screen.getByRole('button', { name: /start building/i });
            await user.click(submitButton);

            // Step 3: Verify we're now in the build wizard
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 4: Select CPU (first available option)
            const cpuOptions = await screen.findAllByRole('button', { name: /select/i });
            expect(cpuOptions.length).toBeGreaterThan(0);
            await user.click(cpuOptions[0]);

            // Step 5: Select GPU
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });
            const gpuOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(gpuOptions[0]);

            // Step 6: Select Motherboard
            await waitFor(() => {
                expect(screen.getByText(/select.*motherboard/i)).toBeInTheDocument();
            });
            const moboOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(moboOptions[0]);

            // Step 7: Select RAM
            await waitFor(() => {
                expect(screen.getByText(/select.*ram/i)).toBeInTheDocument();
            });
            const ramOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(ramOptions[0]);

            // Step 8: Select Storage
            await waitFor(() => {
                expect(screen.getByText(/select.*storage/i)).toBeInTheDocument();
            });
            const storageOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(storageOptions[0]);

            // Step 9: Select PSU
            await waitFor(() => {
                expect(screen.getByText(/select.*psu/i)).toBeInTheDocument();
            });
            const psuOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(psuOptions[0]);

            // Step 10: Verify we reach the final summary
            await waitFor(() => {
                expect(screen.getByText(/build summary/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify summary contains expected sections
            expect(screen.getByText(/strengths/i)).toBeInTheDocument();
            expect(screen.getByText(/weaknesses/i)).toBeInTheDocument();
        });
    });

    describe('Advanced Mode Flow', () => {
        it('should complete full build flow in advanced mode', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Step 1: Switch to advanced mode
            const advancedToggle = screen.getByLabelText(/advanced mode/i);
            await user.click(advancedToggle);

            // Step 2: Fill out preferences with advanced options
            const budgetMinInput = screen.getByLabelText(/minimum budget \(\$\)/i);
            const budgetMaxInput = screen.getByLabelText(/maximum budget \(\$\)/i);
            await user.clear(budgetMinInput);
            await user.type(budgetMinInput, '2000');
            await user.clear(budgetMaxInput);
            await user.type(budgetMaxInput, '3000');

            const useCaseSelect = screen.getByLabelText(/use case/i);
            await user.selectOptions(useCaseSelect, 'content-creation');

            const performanceSelect = screen.getByLabelText(/performance priority/i);
            await user.selectOptions(performanceSelect, 'balanced');

            const storageSelect = screen.getByLabelText(/storage needs/i);
            await user.selectOptions(storageSelect, 'extensive');

            const upgradeSelect = screen.getByLabelText(/upgrade timeline/i);
            await user.selectOptions(upgradeSelect, '5-year');

            // Advanced mode specific: power constraints
            const powerInput = screen.getByLabelText(/maximum power draw/i);
            await user.clear(powerInput);
            await user.type(powerInput, '750');

            // Submit preferences
            const submitButton = screen.getByRole('button', { name: /start building/i });
            await user.click(submitButton);

            // Step 3: Navigate through component selection
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });

            // Select all components (CPU -> GPU -> Motherboard -> RAM -> Storage -> PSU)
            for (let i = 0; i < 6; i++) {
                const selectButtons = await screen.findAllByRole('button', { name: /select/i });
                await user.click(selectButtons[0]);
                await waitFor(() => {
                    // Wait for next step or summary
                }, { timeout: 2000 });
            }

            // Step 4: Verify final summary with advanced mode details
            await waitFor(() => {
                expect(screen.getByText(/build summary/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Advanced mode should show detailed metrics
            expect(screen.getByText(/strengths/i)).toBeInTheDocument();
            expect(screen.getByText(/weaknesses/i)).toBeInTheDocument();
        });
    });
});
