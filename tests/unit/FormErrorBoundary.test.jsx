// tests/unit/FormErrorBoundary.test.jsx
import { render, screen } from '@testing-library/react';
import FormErrorBoundary from '../../src/components/FormErrorBoundary';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Mock console.error to prevent test output noise
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Form validation error');
  }
  return <form><input placeholder="test input" /></form>;
};

describe('FormErrorBoundary', () => {
  it('renders form children when there is no error', () => {
    render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={false} />
      </FormErrorBoundary>
    );

    expect(screen.getByPlaceholderText('test input')).toBeInTheDocument();
  });

  it('renders form-specific error UI when there is an error', () => {
    render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong with the form/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('shows retry functionality', () => {
    const { rerender } = render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    );

    // Should show error state
    expect(screen.getByText(/Something went wrong with the form/)).toBeInTheDocument();
    
    // Click retry
    const retryButton = screen.getByText('Try Again');
    retryButton.click();

    // Re-render with no error
    rerender(
      <FormErrorBoundary>
        <ThrowError shouldThrow={false} />
      </FormErrorBoundary>
    );

    expect(screen.getByPlaceholderText('test input')).toBeInTheDocument();
  });

  it('calls onError callback when provided', () => {
    const onErrorMock = vi.fn();
    
    render(
      <FormErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('logs error details when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <FormErrorBoundary>
        <ThrowError shouldThrow={true} />
      </FormErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith('FormErrorBoundary caught an error:', expect.any(Error), expect.any(Object));
    
    consoleSpy.mockRestore();
  });
});
