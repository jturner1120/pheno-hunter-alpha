import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlantsStatsFilters from '../../src/components/plants/PlantsStatsFilters';

describe('PlantsStatsFilters', () => {
  const mockStats = {
    totalPlants: 10,
    activePlants: 7,
    harvestedPlants: 2,
    totalClones: 3
  };

  const mockPlants = [
    { id: '1', status: 'active' },
    { id: '2', status: 'flowering' },
    { id: '3', status: 'harvested' },
    { id: '4', isClone: true }
  ];

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter buttons with correct stats', () => {
    render(
      <PlantsStatsFilters 
        stats={mockStats}
        plants={mockPlants}
        activeFilter="active"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total Plants')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Harvested')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Clones')).toBeInTheDocument();
  });

  it('highlights the active filter correctly', () => {
    render(
      <PlantsStatsFilters 
        stats={mockStats}
        plants={mockPlants}
        activeFilter="active"
        onFilterChange={mockOnFilterChange}
      />
    );

    const activeButton = screen.getByText('Active').closest('button');
    expect(activeButton).toHaveClass('ring-2', 'ring-green-500', 'bg-green-50');
  });

  it('calls onFilterChange when filter button is clicked', () => {
    render(
      <PlantsStatsFilters 
        stats={mockStats}
        plants={mockPlants}
        activeFilter="active"
        onFilterChange={mockOnFilterChange}
      />
    );

    const harvestedButton = screen.getByText('Harvested').closest('button');
    fireEvent.click(harvestedButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('harvested');
  });

  it('falls back to calculated values when stats are missing', () => {
    render(
      <PlantsStatsFilters 
        stats={{}}
        plants={mockPlants}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('4')).toBeInTheDocument(); // total plants length
  });
});
