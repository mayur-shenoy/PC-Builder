/**
 * ConversationalChat tests
 * Requirements: 7.1, 7.2
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationalChat } from './ConversationalChat';

describe('ConversationalChat', () => {
    it('renders with initial greeting in beginner mode', () => {
        const mockOnQuery = jest.fn(() => 'Response');

        render(
            <ConversationalChat
                onQuery={mockOnQuery}
                mode="beginner"
            />
        );

        expect(screen.getByText(/Ask the AI/i)).toBeInTheDocument();
        expect(screen.getByText(/I'm here to help you build your PC/i)).toBeInTheDocument();
    });

    it('renders with initial greeting in advanced mode', () => {
        const mockOnQuery = jest.fn(() => 'Response');

        render(
            <ConversationalChat
                onQuery={mockOnQuery}
                mode="advanced"
            />
        );

        expect(screen.getByText(/AI Assistant ready/i)).toBeInTheDocument();
    });

    it('handles user query submission', async () => {
        const mockOnQuery = jest.fn(() => 'AI Response');

        render(
            <ConversationalChat
                onQuery={mockOnQuery}
                mode="beginner"
            />
        );

        const input = screen.getByPlaceholderText(/Ask a question/i);
        const sendButton = screen.getByText(/Send/i);

        fireEvent.change(input, { target: { value: 'Test query' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(mockOnQuery).toHaveBeenCalledWith('Test query');
        });

        await waitFor(() => {
            expect(screen.getByText('Test query')).toBeInTheDocument();
            expect(screen.getByText('AI Response')).toBeInTheDocument();
        });
    });

    it('shows suggestion chips in beginner mode', () => {
        const mockOnQuery = jest.fn(() => 'Response');

        render(
            <ConversationalChat
                onQuery={mockOnQuery}
                mode="beginner"
            />
        );

        expect(screen.getByText(/Are my components compatible/i)).toBeInTheDocument();
        expect(screen.getByText(/What can I upgrade later/i)).toBeInTheDocument();
    });

    it('clears conversation history', async () => {
        const mockOnQuery = jest.fn(() => 'Response');

        render(
            <ConversationalChat
                onQuery={mockOnQuery}
                mode="beginner"
            />
        );

        // Send a message first
        const input = screen.getByPlaceholderText(/Ask a question/i);
        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.click(screen.getByText(/Send/i));

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        // Clear history
        const clearButton = screen.getByText(/Clear/i);
        fireEvent.click(clearButton);

        // Original greeting should still be there, but not the test message
        expect(screen.getByText(/I'm here to help you build your PC/i)).toBeInTheDocument();
    });
});
