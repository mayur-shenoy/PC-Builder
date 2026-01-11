/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly error messages
 * Requirements: All
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error details for debugging
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <h2>Oops! Something went wrong</h2>
                        <p className="error-message">
                            We encountered an unexpected error. Don't worry, your build progress is saved.
                        </p>

                        {this.state.error && (
                            <details className="error-details">
                                <summary>Error Details</summary>
                                <pre className="error-stack">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="error-actions">
                            <button
                                className="error-button primary"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="error-button secondary"
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
