import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlantsEmptyState from '../../src/components/plants/PlantsEmptyState';

describe('PlantsEmptyState', () => {
  const mockOnAddPlant = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default empty state for no plants', () => {
    render(
      <PlantsEmptyState 
        activeFilter="all"
        onAddPlant={mockOnAddPlant}
      />
    );

    expect(screen.getByText('No plants yet!')).toBeInTheDocument();
    expect(screen.getByText("Billy's excited to help you start your growing journey! Add your first plant to get started.")).toBeInTheDocument();
    expect(screen.getByText('Add Your First Plant')).toBeInTheDocument();
  });

  it('renders harvested filter empty state', () => {
    render(
      <PlantsEmptyState 
        activeFilter="harvested"
        onAddPlant={mockOnAddPlant}
      />
    );

    expect(screen.getByText('No harvested plants found')).toBeInTheDocument();
    expect(screen.getByText("You haven't harvested any plants yet. Keep growing and you'll have harvest data here!")).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders clones filter empty state', () => {
    render(
      <PlantsEmptyState 
        activeFilter="clones"
        onAddPlant={mockOnAddPlant}
      />
    );

    expect(screen.getByText('No clones found')).toBeInTheDocument();
    expect(screen.getByText("You haven't created any clones yet. Clone your favorite plants to preserve genetics!")).toBeInTheDocument();
    expect(screen.getByText('Add a Plant')).toBeInTheDocument();
  });

  it('calls onAddPlant when add button is clicked', () => {
    render(
      <PlantsEmptyState 
        activeFilter="all"
        onAddPlant={mockOnAddPlant}
      />
    );

    const addButton = screen.getByText('Add Your First Plant');
    fireEvent.click(addButton);

    expect(mockOnAddPlant).toHaveBeenCalledTimes(1);
  });

  it('respects showAddButton prop', () => {
    render(
      <PlantsEmptyState 
        activeFilter="active"
        onAddPlant={mockOnAddPlant}
        showAddButton={false}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
