// tests/unit/DashboardStats.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DashboardStats from '../../src/components/dashboard/DashboardStats';

describe('DashboardStats', () => {
  const mockOnStatsClick = vi.fn();
  const mockStats = {
    total: 10,
    active: 6,
    clones: 3,
    harvested: 4,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(
      <DashboardStats 
        stats={mockStats} 
        loading={true} 
        hasPlants={true}
      />
    );

    expect(screen.getByText('Loading your plants...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
  });

  it('renders stats for users with plants', () => {
    render(
      <DashboardStats 
        stats={mockStats} 
        loading={false} 
        hasPlants={true}
        onStatsClick={mockOnStatsClick}
      />
    );

    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // Active plants
    expect(screen.getByText('Active Plants')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Clones
    expect(screen.getByText('Clones Made')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // Harvested
    expect(screen.getByText('Harvested')).toBeInTheDocument();
    expect(screen.getByText('Total Plants: 10')).toBeInTheDocument();
  });

  it('renders empty state for users without plants', () => {
    const emptyStats = { total: 0, active: 0, clones: 0, harvested: 0 };
    
    render(
      <DashboardStats 
        stats={emptyStats} 
        loading={false} 
        hasPlants={false}
      />
    );

    expect(screen.getByText('Your stats will appear here')).toBeInTheDocument();
    expect(screen.getByText('Add your first plant to start tracking your growing progress and statistics.')).toBeInTheDocument();
    expect(screen.queryByText('Quick Stats')).not.toBeInTheDocument();
  });

  it('handles stat card clicks when onStatsClick is provided', () => {
    render(
      <DashboardStats 
        stats={mockStats} 
        loading={false} 
        hasPlants={true}
        onStatsClick={mockOnStatsClick}
      />
    );

    const activeStatsButton = screen.getByLabelText('View active plants');
    fireEvent.click(activeStatsButton);

    expect(mockOnStatsClick).toHaveBeenCalledWith('active');
  });

  it('handles multiple stat clicks correctly', () => {
    render(
      <DashboardStats 
        stats={mockStats} 
        loading={false} 
        hasPlants={true}
        onStatsClick={mockOnStatsClick}
      />
    );

    fireEvent.click(screen.getByLabelText('View active plants'));
    fireEvent.click(screen.getByLabelText('View clones made'));
    fireEvent.click(screen.getByLabelText('View harvested'));

    expect(mockOnStatsClick).toHaveBeenCalledTimes(3);
    expect(mockOnStatsClick).toHaveBeenNthCalledWith(1, 'active');
    expect(mockOnStatsClick).toHaveBeenNthCalledWith(2, 'clones');
    expect(mockOnStatsClick).toHaveBeenNthCalledWith(3, 'harvested');
  });

  it('does not make stat cards clickable when onStatsClick is not provided', () => {
    render(
      <DashboardStats 
        stats={mockStats} 
        loading={false} 
        hasPlants={true}
      />
    );

    // Should not have clickable labels
    expect(screen.queryByLabelText('View active plants')).not.toBeInTheDocument();
    
    // Cards should still display values
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Active Plants')).toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    const zeroStats = { total: 0, active: 0, clones: 0, harvested: 0 };
    
    render(
      <DashboardStats 
        stats={zeroStats} 
        loading={false} 
        hasPlants={true}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Total Plants: 0')).toBeInTheDocument();
  });

  it('handles missing stats properties', () => {
    const partialStats = { active: 2 }; // Missing other properties
    
    render(
      <DashboardStats 
        stats={partialStats} 
        loading={false} 
        hasPlants={true}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // active
    expect(screen.getAllByText('0')).toHaveLength(2); // clones and harvested default to 0
  });

  it('applies correct color classes to stat cards', () => {
    render(
      <DashboardStats 
        stats={mockStats} 
        loading={false} 
        hasPlants={true}
      />
    );

    // Check if the stat values have the correct color classes
    const activeValue = screen.getByText('6');
    const clonesValue = screen.getByText('3');
    const harvestedValue = screen.getByText('4');

    expect(activeValue).toHaveClass('text-green-600');
    expect(clonesValue).toHaveClass('text-patriot-red');
    expect(harvestedValue).toHaveClass('text-patriot-blue');
  });
});
