// tests/unit/BulkEditModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BulkEditModal from '../../src/components/plants/bulk/BulkEditModal';
import { MultiSelectProvider } from '../../src/components/plants/bulk/MultiSelectProvider';

const MockMultiSelectProvider = ({ children, mockConfig = {} }) => {
  const defaultConfig = {
    update_stage: {
      label: 'Update Stage',
      icon: '🌱',
      description: 'Update growth stage for selected plants',
      requiresInput: true,
      inputType: 'select',
      inputOptions: ['seedling', 'vegetative', 'flowering', 'harvested'],
      estimatedTime: 2000,
      destructive: false
    },
    delete_plants: {
      label: 'Delete Plants',
      icon: '🗑️',
      description: 'Permanently delete selected plants',
      requiresInput: false,
      estimatedTime: 1000,
      destructive: true
    },
    record_metrics: {
      label: 'Record Metrics',
      icon: '📏',
      description: 'Record growth measurements',
      requiresInput: true,
      inputType: 'metrics',
      estimatedTime: 3000,
      destructive: false
    }
  };

  const mockValue = {
    OPERATION_CONFIGS: { ...defaultConfig, ...mockConfig },
    selectedPlants: [],
    togglePlant: vi.fn(),
    selectMode: false
  };

  return (
    <div data-testid="mock-provider">
      {React.cloneElement(children, { useMultiSelect: () => mockValue })}
    </div>
  );
};

describe('BulkEditModal', () => {
  const mockSelectedPlants = [
    { id: '1', name: 'Plant 1', strain: 'Strain A' },
    { id: '2', name: 'Plant 2', strain: 'Strain B' },
    { id: '3', name: 'Plant 3', strain: 'Strain C' }
  ];

  const defaultProps = {
    isOpen: true,
    operation: 'update_stage',
    selectedPlants: mockSelectedPlants,
    onSubmit: vi.fn(),
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} isOpen={false} />
      </MockMultiSelectProvider>
    );

    expect(screen.queryByText('Update Stage')).not.toBeInTheDocument();
  });

  it('should render modal with correct title and description', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    expect(screen.getByText('Update Stage')).toBeInTheDocument();
    expect(screen.getByText('Update growth stage for selected plants')).toBeInTheDocument();
    expect(screen.getByText('3 plants selected')).toBeInTheDocument();
  });

  it('should display selected plants list', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    expect(screen.getByText('Plant 1')).toBeInTheDocument();
    expect(screen.getByText('Plant 2')).toBeInTheDocument();
    expect(screen.getByText('Plant 3')).toBeInTheDocument();
    expect(screen.getByText('Strain A')).toBeInTheDocument();
    expect(screen.getByText('Strain B')).toBeInTheDocument();
    expect(screen.getByText('Strain C')).toBeInTheDocument();
  });

  it('should show truncated list for many plants', () => {
    const manyPlants = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Plant ${i + 1}`,
      strain: `Strain ${i + 1}`
    }));

    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} selectedPlants={manyPlants} />
      </MockMultiSelectProvider>
    );

    expect(screen.getByText('Plant 1')).toBeInTheDocument();
    expect(screen.getByText('Plant 10')).toBeInTheDocument();
    expect(screen.getByText('...and 5 more plants')).toBeInTheDocument();
  });

  it('should render select input for stage update', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
    
    fireEvent.click(select);
    expect(screen.getByText('Seedling')).toBeInTheDocument();
    expect(screen.getByText('Vegetative')).toBeInTheDocument();
    expect(screen.getByText('Flowering')).toBeInTheDocument();
  });

  it('should render metrics input correctly', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} operation="record_metrics" />
      </MockMultiSelectProvider>
    );

    expect(screen.getByText('Height (cm)')).toBeInTheDocument();
    expect(screen.getByText('Width (cm)')).toBeInTheDocument();
    expect(screen.getByText('Node Count')).toBeInTheDocument();
    expect(screen.getByText('Branch Count')).toBeInTheDocument();
  });

  it('should show warning for destructive operations', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} operation="delete_plants" />
      </MockMultiSelectProvider>
    );

    expect(screen.getByText('Warning: Destructive Action')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('should disable submit button when input is required but empty', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    const submitButton = screen.getByRole('button', { name: /Update Stage/ });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when valid input is provided', async () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'flowering' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Update Stage/ });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should call onSubmit with correct data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue();

    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} onSubmit={mockOnSubmit} />
      </MockMultiSelectProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'flowering' } });

    const submitButton = screen.getByRole('button', { name: /Update Stage/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('update_stage', { stage: 'flowering' });
    });
  });

  it('should show validation error for invalid input', async () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    const submitButton = screen.getByRole('button', { name: /Update Stage/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in the required fields')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const mockOnSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} onSubmit={mockOnSubmit} />
      </MockMultiSelectProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'flowering' } });

    const submitButton = screen.getByRole('button', { name: /Update Stage/ });
    fireEvent.click(submitButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();

    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} onClose={mockOnClose} />
      </MockMultiSelectProvider>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();

    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} onClose={mockOnClose} />
      </MockMultiSelectProvider>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should calculate and display estimated time', () => {
    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} />
      </MockMultiSelectProvider>
    );

    // 3 plants * 2000ms = 6000ms = 6 seconds
    expect(screen.getByText('Est. time: 6 seconds')).toBeInTheDocument();
  });

  it('should reset form when modal opens/closes', () => {
    const { rerender } = render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} isOpen={false} />
      </MockMultiSelectProvider>
    );

    rerender(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} isOpen={true} />
      </MockMultiSelectProvider>
    );

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('');
  });

  it('should handle submission errors', async () => {
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));

    render(
      <MockMultiSelectProvider>
        <BulkEditModal {...defaultProps} onSubmit={mockOnSubmit} />
      </MockMultiSelectProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'flowering' } });

    const submitButton = screen.getByRole('button', { name: /Update Stage/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });
});
