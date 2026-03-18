/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@/test/utils';
import { ErrorBoundary } from './error-boundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Safe component that renders normally
const SafeComponent = () => {
  return <div>Safe content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error during tests
  const originalError = console.error;

  beforeAll(() => {
    console.error = () => {};
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('catches errors and displays fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/try refreshing/i)).toBeInTheDocument();
  });

  it('displays error buttons when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });

    expect(refreshButton).toBeInTheDocument();
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
