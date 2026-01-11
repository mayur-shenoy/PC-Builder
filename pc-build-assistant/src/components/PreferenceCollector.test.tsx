/**
 * Integration tests for PreferenceCollector
 * Requirements: 1.5
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreferenceCollector } from './PreferenceCollector';
import { useBuildStore } from '../store/buildStore';

describe('PreferenceCollector Integration Tests', () => {
    beforeEach(() => {
        // Reset store before each test
        const store = useBuildStore.getState();
        store.resetBuild();
        store.setMode('beginner');
    });

    test('should connect to build store and save preferences on submit', async () => {
        const onComplete = jest.fn();
        render(<PreferenceCollector onComplete={onComplete} />);

        // Fill in the form
        const budgetMinInput = screen.getByLabelText(/Minimum/i);
        const budgetMaxInput = screen.getByLabelText(/Maximum/i);

        fireEvent.change(budgetMinInput, { target: { value: '1000' } });
        fireEvent.change(budgetMaxInput, { target: { value: '2000' } });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /Start Building/i });
        fireEvent.click(submitButton);

        // Wait for the form to be processed
        await waitFor(() => {
            // Check that preferences were saved to the store
            const { preferences } = useBuildStore.getState();
            expect(preferences).not.toBeNull();
            expect(preferences?.budgetMin).toBe(1000);
            expect(preferences?.budgetMax).toBe(2000);
        });

        // Check that onComplete was called
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('should toggle between beginner and advanced modes', () => {
        render(<PreferenceCollector />);

        // Initially should be in beginner mode
        expect(useBuildStore.getState().mode).toBe('beginner');

        // Find and click the mode toggle
        const modeToggle = screen.getByRole('checkbox');
        fireEvent.click(modeToggle);

        // Should now be in advanced mode
        expect(useBuildStore.getState().mode).toBe('advanced');

        // Advanced mode fields should be visible
        expect(screen.getByText(/Preferred Brands/i)).toBeTruthy();
        expect(screen.getByText(/Maximum Power Draw/i)).toBeTruthy();
    });

    test('should show simplified language in beginner mode', () => {
        render(<PreferenceCollector />);

        // Check for beginner-friendly text
        expect(screen.getByText(/Tell us about your PC needs/i)).toBeTruthy();
        expect(screen.getByRole('button', { name: /Start Building/i })).toBeTruthy();
    });

    test('should show technical language in advanced mode', () => {
        // Set to advanced mode first
        useBuildStore.getState().setMode('advanced');

        render(<PreferenceCollector />);

        // Check for advanced text
        expect(screen.getByText(/Configure Your Build Preferences/i)).toBeTruthy();
        expect(screen.getByRole('button', { name: /Continue to Component Selection/i })).toBeTruthy();
    });

    test('should validate form before saving to store', async () => {
        const onComplete = jest.fn();
        render(<PreferenceCollector onComplete={onComplete} />);

        // Try to submit without filling in required fields
        const submitButton = screen.getByRole('button', { name: /Start Building/i });
        fireEvent.click(submitButton);

        // Wait a bit
        await waitFor(() => {
            // Error messages should be displayed
            expect(screen.getByText(/Please enter a valid minimum budget/i)).toBeTruthy();
        });

        // Preferences should not be saved
        const { preferences } = useBuildStore.getState();
        expect(preferences).toBeNull();

        // onComplete should not be called
        expect(onComplete).not.toHaveBeenCalled();
    });
});
