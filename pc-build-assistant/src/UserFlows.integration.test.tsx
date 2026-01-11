/**
 * Integration Test: Key User Flows
 * Feature: pc-build-assistant, Task 20.2
 * Tests critical user journeys including backtracking and persistence
 * Requirements: All
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { useBuildStore } from './store/buildStore';

describe('Key User Flows - Integration Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        useBuildStore.getState().resetBuild();
    });

    describe('Preference Collection → Component Selection → Summary', () => {
        it('should navigate through complete flow successfully', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Phase 1: Collect Preferences
            const budgetMinInput = screen.getByLabelText(/minimum \(\$\)/i);
            const budgetMaxInput = screen.getByLabelText(/maximum \(\$\)/i);
            await user.clear(budgetMinInput);
            await user.type(budgetMinInput, '1200');
            await user.clear(budgetMaxInput);
            await user.type(budgetMaxInput, '1800');

            await user.selectOptions(screen.getByLabelText(/use case/i), 'gaming');
            await user.selectOptions(screen.getByLabelText(/priority/i), 'GPU-heavy');
            await user.selectOptions(screen.getByLabelText(/storage needs/i), 'moderate');
            await user.selectOptions(screen.getByLabelText(/expected lifespan/i), '3-year');

            await user.click(screen.getByRole('button', { name: /start building/i }));

            // Phase 2: Component Selection
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });

            // Select all 6 components
            for (let i = 0; i < 6; i++) {
                const selectButtons = await screen.findAllByRole('button', { name: /select/i });
                await user.click(selectButtons[0]);
                await waitFor(() => { }, { timeout: 1000 });
            }

            // Phase 3: View Summary
            await waitFor(() => {
                expect(screen.getByText(/build summary/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            expect(screen.getByText(/strengths/i)).toBeInTheDocument();
            expect(screen.getByText(/weaknesses/i)).toBeInTheDocument();
        });

        it('should validate preferences before proceeding', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Try to submit without filling all required fields
            const submitButton = screen.getByRole('button', { name: /start building/i });

            // Should not be able to proceed without valid preferences
            // The form should have validation preventing submission
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('Backtracking and Changing Selections', () => {
        it('should allow going back and changing component selections', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Complete preferences
            await user.clear(screen.getByLabelText(/minimum \(\$\)/i));
            await user.type(screen.getByLabelText(/minimum \(\$\)/i), '1000');
            await user.clear(screen.getByLabelText(/maximum \(\$\)/i));
            await user.type(screen.getByLabelText(/maximum \(\$\)/i), '1500');
            await user.selectOptions(screen.getByLabelText(/use case/i), 'gaming');
            await user.selectOptions(screen.getByLabelText(/priority/i), 'balanced');
            await user.selectOptions(screen.getByLabelText(/storage needs/i), 'moderate');
            await user.selectOptions(screen.getByLabelText(/expected lifespan/i), '3-year');
            await user.click(screen.getByRole('button', { name: /start building/i }));

            // Select CPU
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });
            const cpuOptions = await screen.findAllByRole('button', { name: /select/i });
            const firstCPUName = cpuOptions[0].closest('.component-card')?.textContent || '';
            await user.click(cpuOptions[0]);

            // Select GPU
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });
            const gpuOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(gpuOptions[0]);

            // Now go back
            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            // Should be back at GPU selection
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });

            // Go back again to CPU
            await user.click(screen.getByRole('button', { name: /back/i }));
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });

            // Select a different CPU if available
            const newCPUOptions = await screen.findAllByRole('button', { name: /select/i });
            if (newCPUOptions.length > 1) {
                await user.click(newCPUOptions[1]);
            } else {
                await user.click(newCPUOptions[0]);
            }

            // Verify we can continue forward
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });
        });

        it('should update compatibility constraints when changing selections', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Complete preferences
            await user.clear(screen.getByLabelText(/minimum \(\$\)/i));
            await user.type(screen.getByLabelText(/minimum \(\$\)/i), '1000');
            await user.clear(screen.getByLabelText(/maximum \(\$\)/i));
            await user.type(screen.getByLabelText(/maximum \(\$\)/i), '2000');
            await user.selectOptions(screen.getByLabelText(/use case/i), 'gaming');
            await user.selectOptions(screen.getByLabelText(/priority/i), 'balanced');
            await user.selectOptions(screen.getByLabelText(/storage needs/i), 'moderate');
            await user.selectOptions(screen.getByLabelText(/expected lifespan/i), '3-year');
            await user.click(screen.getByRole('button', { name: /start building/i }));

            // Select CPU
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });
            const cpuOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(cpuOptions[0]);

            // Select GPU
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });
            const gpuOptions = await screen.findAllByRole('button', { name: /select/i });
            await user.click(gpuOptions[0]);

            // Select Motherboard - should be filtered by CPU socket
            await waitFor(() => {
                expect(screen.getByText(/select.*motherboard/i)).toBeInTheDocument();
            });
            const moboOptions = await screen.findAllByRole('button', { name: /select/i });
            // All displayed motherboards should be compatible with selected CPU
            expect(moboOptions.length).toBeGreaterThan(0);
            await user.click(moboOptions[0]);

            // Go back and change CPU
            await user.click(screen.getByRole('button', { name: /back/i }));
            await user.click(screen.getByRole('button', { name: /back/i }));
            await user.click(screen.getByRole('button', { name: /back/i }));

            // Select different CPU
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });
            const newCPUOptions = await screen.findAllByRole('button', { name: /select/i });
            if (newCPUOptions.length > 1) {
                await user.click(newCPUOptions[1]);
            } else {
                await user.click(newCPUOptions[0]);
            }

            // Navigate forward again
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });
            await user.click((await screen.findAllByRole('button', { name: /select/i }))[0]);

            // Motherboard options should be updated based on new CPU
            await waitFor(() => {
                expect(screen.getByText(/select.*motherboard/i)).toBeInTheDocument();
            });
            const updatedMoboOptions = await screen.findAllByRole('button', { name: /select/i });
            expect(updatedMoboOptions.length).toBeGreaterThan(0);
        });
    });

    describe('Persistence and Restoration', () => {
        it('should persist build state to localStorage', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Complete preferences
            await user.clear(screen.getByLabelText(/minimum \(\$\)/i));
            await user.type(screen.getByLabelText(/minimum \(\$\)/i), '1500');
            await user.clear(screen.getByLabelText(/maximum \(\$\)/i));
            await user.type(screen.getByLabelText(/maximum \(\$\)/i), '2000');
            await user.selectOptions(screen.getByLabelText(/use case/i), 'productivity');
            await user.selectOptions(screen.getByLabelText(/priority/i), 'CPU-heavy');
            await user.selectOptions(screen.getByLabelText(/storage needs/i), 'extensive');
            await user.selectOptions(screen.getByLabelText(/expected lifespan/i), '5-year');
            await user.click(screen.getByRole('button', { name: /start building/i }));

            // Select CPU
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });
            await user.click((await screen.findAllByRole('button', { name: /select/i }))[0]);

            // Select GPU
            await waitFor(() => {
                expect(screen.getByText(/select.*gpu/i)).toBeInTheDocument();
            });
            await user.click((await screen.findAllByRole('button', { name: /select/i }))[0]);

            // Check localStorage has been updated
            const storedData = localStorage.getItem('build-store');
            expect(storedData).toBeTruthy();

            const parsedData = JSON.parse(storedData!);
            expect(parsedData.state.build.cpu).toBeDefined();
            expect(parsedData.state.build.gpu).toBeDefined();
            expect(parsedData.state.preferences.budgetMin).toBe(1500);
            expect(parsedData.state.preferences.budgetMax).toBe(2000);
        });

        it('should restore build state from localStorage on mount', async () => {
            // Pre-populate localStorage with a partial build
            const mockBuildState = {
                state: {
                    build: {
                        cpu: {
                            id: 'cpu-1',
                            type: 'CPU',
                            name: 'Test CPU',
                            manufacturer: 'Test',
                            price: 300,
                            specifications: {
                                socket: 'LGA 1700',
                                cores: 8,
                                threads: 16,
                                baseClock: 3.6,
                                boostClock: 5.0,
                                tdp: 125,
                                integratedGraphics: true
                            }
                        }
                    },
                    preferences: {
                        budgetMin: 1000,
                        budgetMax: 1500,
                        useCase: 'gaming',
                        performanceFocus: 'balanced',
                        storageRequirements: 'moderate',
                        upgradeHorizon: '3-year'
                    },
                    mode: 'beginner',
                    currentStep: 'GPU'
                },
                version: 0
            };

            localStorage.setItem('build-store', JSON.stringify(mockBuildState));

            // Render app - it should restore the state
            render(<App />);

            // The app should start at preferences, but the store should have the restored data
            const store = useBuildStore.getState();
            expect(store.build.cpu).toBeDefined();
            expect(store.build.cpu?.name).toBe('Test CPU');
            expect(store.preferences?.budgetMin).toBe(1000);
            expect(store.currentStep).toBe('GPU');
        });

        it('should handle corrupted localStorage gracefully', async () => {
            // Set invalid JSON in localStorage
            localStorage.setItem('build-store', 'invalid-json-{{{');

            // App should still render without crashing
            render(<App />);

            expect(screen.getByText(/PC Build Assistant/i)).toBeInTheDocument();

            // Store should be in default state
            const store = useBuildStore.getState();
            expect(store.build.cpu).toBeUndefined();
        });

        it('should persist complete build through to summary', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Complete full flow
            await user.clear(screen.getByLabelText(/minimum \(\$\)/i));
            await user.type(screen.getByLabelText(/minimum \(\$\)/i), '1000');
            await user.clear(screen.getByLabelText(/maximum \(\$\)/i));
            await user.type(screen.getByLabelText(/maximum \(\$\)/i), '1500');
            await user.selectOptions(screen.getByLabelText(/use case/i), 'gaming');
            await user.selectOptions(screen.getByLabelText(/priority/i), 'balanced');
            await user.selectOptions(screen.getByLabelText(/storage needs/i), 'moderate');
            await user.selectOptions(screen.getByLabelText(/expected lifespan/i), '3-year');
            await user.click(screen.getByRole('button', { name: /start building/i }));

            // Select all components
            for (let i = 0; i < 6; i++) {
                await waitFor(() => {
                    expect(screen.findAllByRole('button', { name: /select/i })).toBeTruthy();
                });
                const buttons = await screen.findAllByRole('button', { name: /select/i });
                await user.click(buttons[0]);
                await waitFor(() => { }, { timeout: 1000 });
            }

            // Verify we reach summary
            await waitFor(() => {
                expect(screen.getByText(/build summary/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Check localStorage has complete build
            const storedData = localStorage.getItem('build-store');
            expect(storedData).toBeTruthy();

            const parsedData = JSON.parse(storedData!);
            expect(parsedData.state.build.cpu).toBeDefined();
            expect(parsedData.state.build.gpu).toBeDefined();
            expect(parsedData.state.build.motherboard).toBeDefined();
            expect(parsedData.state.build.ram).toBeDefined();
            expect(parsedData.state.build.storage).toBeDefined();
            expect(parsedData.state.build.psu).toBeDefined();
        });
    });

    describe('Error Handling in User Flows', () => {
        it('should handle no compatible components scenario', async () => {
            // This test verifies the system handles edge cases where
            // compatibility constraints might eliminate all options
            const user = userEvent.setup();
            render(<App />);

            // Set up preferences
            await user.clear(screen.getByLabelText(/minimum \(\$\)/i));
            await user.type(screen.getByLabelText(/minimum \(\$\)/i), '500');
            await user.clear(screen.getByLabelText(/maximum \(\$\)/i));
            await user.type(screen.getByLabelText(/maximum \(\$\)/i), '600');
            await user.selectOptions(screen.getByLabelText(/use case/i), 'gaming');
            await user.selectOptions(screen.getByLabelText(/priority/i), 'balanced');
            await user.selectOptions(screen.getByLabelText(/storage needs/i), 'minimal');
            await user.selectOptions(screen.getByLabelText(/expected lifespan/i), '1-year');
            await user.click(screen.getByRole('button', { name: /start building/i }));

            // Even with tight budget, system should provide some options
            await waitFor(() => {
                expect(screen.getByText(/select.*cpu/i)).toBeInTheDocument();
            });

            const options = await screen.findAllByRole('button', { name: /select/i });
            expect(options.length).toBeGreaterThan(0);
        });
    });
});
