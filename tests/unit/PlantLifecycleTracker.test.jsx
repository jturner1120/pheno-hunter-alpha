// tests/unit/PlantLifecycleTracker.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlantLifecycleTracker from '../../src/components/plants/advanced/PlantLifecycleTracker';
import { LIFECYCLE_STAGES } from '../../src/hooks/usePlantLifecycle';

// Mock the hooks and utilities
vi.mock('../../src/hooks/usePlantLifecycle', () => ({
  usePlantLifecycle: vi.fn(),
  LIFECYCLE_STAGES: {
    seedling: {
      name: 'Seedling',
      duration: { min: 7, max: 21, average: 14 },
      description: 'Initial growth phase',
      actions: ['water', 'transplant'],
      nextStage: 'vegetative',
      color: '#22c55e'
    },
    vegetative: {
      name: 'Vegetative',
      duration: { min: 28, max: 84, average: 42 },
      description: 'Active growth phase',
      actions: ['water', 'feed', 'prune'],
      nextStage: 'pre-flower',
      color: '#16a34a'
    },
    'pre-flower': {
      name: 'Pre-flower',
      duration: { min: 7, max: 14, average: 10 },
      description: 'Transition phase',
      actions: ['water', 'feed'],
      nextStage: 'flowering',
      color: '#eab308'
    }
  }
}));

const mockUsePlantLifecycle = vi.fn();
vi.doMock('../../src/hooks/usePlantLifecycle', () => ({
  usePlantLifecycle: mockUsePlantLifecycle,
  LIFECYCLE_STAGES: {
    seedling: {
      name: 'Seedling',
      duration: { min: 7, max: 21, average: 14 },
      description: 'Initial growth phase',
      actions: ['water', 'transplant'],
      nextStage: 'vegetative',
      color: '#22c55e'
    },
    vegetative: {
      name: 'Vegetative',
      duration: { min: 28, max: 84, average: 42 },
      description: 'Active growth phase',
      actions: ['water', 'feed', 'prune'],
      nextStage: 'pre-flower',
      color: '#16a34a'
    }
  }
}));

const defaultHookReturn = {
  plant: {
    id: 'plant-1',
    name: 'Test Plant',
    lifecycle: {
      currentStage: 'vegetative',
      stageHistory: [
        {
          stage: 'seedling',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-14T00:00:00Z'
        },
        {
          stage: 'vegetative',
          startDate: '2024-01-14T00:00:00Z',
          endDate: null
        }
      ]
    }
  },
  currentStage: {
    name: 'Vegetative',
    duration: { min: 28, max: 84, average: 42 },
    description: 'Active growth phase',
    actions: ['water', 'feed', 'prune'],
    nextStage: 'pre-flower',
    color: '#16a34a'
  },
  stageHistory: [
    {
      stage: 'seedling',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-14T00:00:00Z'
    },
    {
      stage: 'vegetative',
      startDate: '2024-01-14T00:00:00Z',
      endDate: null
    }
  ],
  loading: false,
  error: null,
  notifications: [],
  stageProgress: {
    daysInStage: 10,
    progress: 25,
    isOverdue: false,
    isReady: false
  },
  expectedHarvestDate: new Date('2024-05-01'),
  availableActions: ['water', 'feed', 'prune'],
  transitionToStage: vi.fn(),
  dismissNotification: vi.fn()
};

describe('PlantLifecycleTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlantLifecycle.mockReturnValue(defaultHookReturn);
  });

  it('should render loading state', () => {
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      loading: true
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      loading: false,
      error: new Error('Failed to load')
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Failed to load lifecycle data')).toBeInTheDocument();
  });

  it('should render current stage information', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Current Stage')).toBeInTheDocument();
    expect(screen.getByText('Vegetative')).toBeInTheDocument();
    expect(screen.getByText('Active growth phase')).toBeInTheDocument();
    expect(screen.getByText('water, feed, prune')).toBeInTheDocument();
  });

  it('should show stage progress correctly', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Vegetative Stage Progress')).toBeInTheDocument();
    expect(screen.getByText('Day 10')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('should show expected harvest date', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText(/Expected harvest:/)).toBeInTheDocument();
    expect(screen.getByText(/5\/1\/2024/)).toBeInTheDocument();
  });

  it('should render lifecycle timeline', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Lifecycle Timeline')).toBeInTheDocument();
    
    // Should show completed seedling stage
    expect(screen.getByText('Seedling')).toBeInTheDocument();
    expect(screen.getByText('14 days')).toBeInTheDocument();
    
    // Should show current vegetative stage
    expect(screen.getByText('Day 10')).toBeInTheDocument();
  });

  it('should show advance to next stage button', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    const advanceButton = screen.getByText('Advance to Pre-flower');
    expect(advanceButton).toBeInTheDocument();
  });

  it('should open transition modal when advance button is clicked', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    const advanceButton = screen.getByText('Advance to Pre-flower');
    fireEvent.click(advanceButton);

    expect(screen.getByText('Transition to Pre-flower')).toBeInTheDocument();
    expect(screen.getByText(/You're about to transition from/)).toBeInTheDocument();
  });

  it('should handle stage transition', async () => {
    const mockTransition = vi.fn().mockResolvedValue();
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      transitionToStage: mockTransition
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    // Open modal
    const advanceButton = screen.getByText('Advance to Pre-flower');
    fireEvent.click(advanceButton);

    // Add notes
    const notesInput = screen.getByPlaceholderText(/Record any observations/);
    fireEvent.change(notesInput, { target: { value: 'Plant looks ready' } });

    // Confirm transition
    const confirmButton = screen.getByText('Confirm Transition');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockTransition).toHaveBeenCalledWith('pre-flower', {
        notes: 'Plant looks ready',
        triggeredBy: 'manual'
      });
    });
  });

  it('should display notifications', () => {
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      notifications: [
        {
          type: 'stage-ready',
          stage: 'pre-flower',
          message: 'Plant may be ready for next stage',
          severity: 'info',
          actions: ['transition', 'dismiss']
        }
      ]
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Plant may be ready for next stage')).toBeInTheDocument();
    expect(screen.getByText('Transition')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('should handle notification dismissal', () => {
    const mockDismiss = vi.fn();
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      notifications: [
        {
          type: 'stage-ready',
          message: 'Plant may be ready for next stage',
          severity: 'info',
          actions: ['dismiss']
        }
      ],
      dismissNotification: mockDismiss
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(mockDismiss).toHaveBeenCalledWith(0);
  });

  it('should show overdue stage warning', () => {
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      stageProgress: {
        daysInStage: 90,
        progress: 120,
        isOverdue: true,
        isReady: true
      }
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('should show ready for next stage indicator', () => {
    mockUsePlantLifecycle.mockReturnValue({
      ...defaultHookReturn,
      stageProgress: {
        daysInStage: 30,
        progress: 75,
        isOverdue: false,
        isReady: true
      }
    });

    render(<PlantLifecycleTracker plantId="plant-1" />);

    expect(screen.getByText('Ready for next stage')).toBeInTheDocument();
  });

  it('should handle modal cancellation', () => {
    render(<PlantLifecycleTracker plantId="plant-1" />);

    // Open modal
    const advanceButton = screen.getByText('Advance to Pre-flower');
    fireEvent.click(advanceButton);

    // Cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Modal should be closed
    expect(screen.queryByText('Transition to Pre-flower')).not.toBeInTheDocument();
  });

  it('should pass plantId to hook', () => {
    render(<PlantLifecycleTracker plantId="test-plant-id" />);

    expect(mockUsePlantLifecycle).toHaveBeenCalledWith('test-plant-id');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PlantLifecycleTracker plantId="plant-1" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
