/**
 * ConversationalChat - Interactive chat interface for AI queries
 * Requirements: 7.1, 7.2
 */

import React, { useState, useRef, useEffect } from 'react';
import './ConversationalChat.css';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ConversationalChatProps {
    onQuery: (query: string) => Promise<string> | string;
    mode: 'beginner' | 'advanced';
}

/**
 * ConversationalChat provides a text-based interface for asking the AI questions
 * Requirements: 7.1, 7.2
 */
export const ConversationalChat: React.FC<ConversationalChatProps> = ({
    onQuery,
    mode,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '0',
            role: 'assistant',
            content: mode === 'beginner'
                ? "Hi! I'm here to help you build your PC. Ask me anything about components, compatibility, or your build!"
                : "AI Assistant ready. Ask about component compatibility, upgrade paths, trade-offs, or build analysis.",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const query = inputValue.trim();
        if (!query || isProcessing) {
            return;
        }

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsProcessing(true);

        try {
            // Get AI response
            const response = await onQuery(query);

            // Add assistant message
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            // Add error message
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
            // Focus input for next query
            inputRef.current?.focus();
        }
    };

    const handleClearHistory = () => {
        setMessages([
            {
                id: '0',
                role: 'assistant',
                content: mode === 'beginner'
                    ? "Hi! I'm here to help you build your PC. Ask me anything about components, compatibility, or your build!"
                    : "AI Assistant ready. Ask about component compatibility, upgrade paths, trade-offs, or build analysis.",
                timestamp: new Date(),
            },
        ]);
    };

    return (
        <div className="conversational-chat">
            <div className="chat-header">
                <div className="header-content">
                    <span className="chat-icon">💬</span>
                    <h3>Ask the AI</h3>
                </div>
                {messages.length > 1 && (
                    <button
                        className="clear-button"
                        onClick={handleClearHistory}
                        title="Clear conversation"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="chat-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.role}`}
                    >
                        <div className="message-avatar">
                            {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                            <div className="message-text">
                                {formatMessageContent(message.content)}
                            </div>
                            <div className="message-timestamp">
                                {formatTimestamp(message.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder={
                        mode === 'beginner'
                            ? 'Ask a question...'
                            : 'Query: compatibility, upgrades, bottlenecks...'
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isProcessing}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={!inputValue.trim() || isProcessing}
                >
                    Send
                </button>
            </form>

            {mode === 'beginner' && messages.length === 1 && (
                <div className="chat-suggestions">
                    <p className="suggestions-label">Try asking:</p>
                    <div className="suggestion-chips">
                        <button
                            className="suggestion-chip"
                            onClick={() => setInputValue('Are my components compatible?')}
                        >
                            Are my components compatible?
                        </button>
                        <button
                            className="suggestion-chip"
                            onClick={() => setInputValue('What can I upgrade later?')}
                        >
                            What can I upgrade later?
                        </button>
                        <button
                            className="suggestion-chip"
                            onClick={() => setInputValue('How much power do I need?')}
                        >
                            How much power do I need?
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Format message content with basic markdown-like formatting
 */
function formatMessageContent(content: string): React.ReactNode {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
        if (line.trim() === '') {
            elements.push(<br key={`br-${index}`} />);
        } else if (line.startsWith('**') && line.endsWith('**')) {
            const text = line.slice(2, -2);
            elements.push(
                <strong key={`strong-${index}`} className="message-heading">
                    {text}
                </strong>
            );
        } else if (line.startsWith('- ')) {
            const text = line.slice(2);
            elements.push(
                <div key={`li-${index}`} className="message-list-item">
                    • {text}
                </div>
            );
        } else if (line.includes('**')) {
            const parts = line.split('**');
            const formatted = parts.map((part, i) =>
                i % 2 === 1 ? <strong key={`bold-${i}`}>{part}</strong> : part
            );
            elements.push(
                <div key={`p-${index}`}>
                    {formatted}
                </div>
            );
        } else {
            elements.push(<div key={`p-${index}`}>{line}</div>);
        }
    });

    return elements;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
