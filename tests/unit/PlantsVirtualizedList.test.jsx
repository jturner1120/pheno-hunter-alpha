// tests/unit/PlantsVirtualizedList.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlantsVirtualizedList from '../../src/components/plants/PlantsVirtualizedList';

// Mock data
const mockPlants = Array.from({ length: 50 }, (_, i) => ({
  id: `plant-${i}`,
  name: `Test Plant ${i}`,
  strain: 'Test Strain',
  status: i % 2 === 0 ? 'vegetative' : 'flowering',
  createdAt: new Date(`2024-01-${(i % 30) + 1}`),
  isClone: i % 3 === 0,
  harvested: i % 10 === 0,
  imageUrl: i % 5 === 0 ? 'https://example.com/image.jpg' : null,
}));

const defaultProps = {
  plants: mockPlants.slice(0, 10), // Start with smaller set
  onView: vi.fn(),
  onClone: vi.fn(),
  onHarvest: vi.fn(),
  formatDate: vi.fn((date) => '2024-01-01'),
  getStatusBadge: vi.fn((plant) => ({
    label: plant.status,
    className: 'badge-green'
  })),
  onLoadMore: vi.fn(),
  hasMore: false,
  loading: false,
  height: 600,
  enableVirtualization: true,
};

describe('PlantsVirtualizedList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getBoundingClientRect for viewport calculations
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
    }));
  });

  it('should render plants in non-virtualized mode when few items', () => {
    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants.slice(0, 5)}
        enableVirtualization={false}
      />
    );

    // Should render all 5 plants
    expect(screen.getAllByText(/Test Plant/)).toHaveLength(5);
    expect(screen.getByText('Test Plant 0')).toBeInTheDocument();
    expect(screen.getByText('Test Plant 4')).toBeInTheDocument();
  });

  it('should render plants in virtualized mode for large datasets', () => {
    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants}
        enableVirtualization={true}
      />
    );

    // Should only render visible items (not all 50)
    const plantCards = screen.getAllByText(/Test Plant/);
    expect(plantCards.length).toBeLessThan(50);
    expect(plantCards.length).toBeGreaterThan(0);
  });

  it('should call onView when view button is clicked', () => {
    render(<PlantsVirtualizedList {...defaultProps} />);

    const viewButton = screen.getAllByText('View Details')[0];
    fireEvent.click(viewButton);

    expect(defaultProps.onView).toHaveBeenCalledWith('plant-0');
  });

  it('should call onClone when clone button is clicked', () => {
    render(<PlantsVirtualizedList {...defaultProps} />);

    const cloneButton = screen.getAllByText('Clone')[0];
    fireEvent.click(cloneButton);

    expect(defaultProps.onClone).toHaveBeenCalledWith(mockPlants[0]);
  });

  it('should call onHarvest when harvest button is clicked', () => {
    render(<PlantsVirtualizedList {...defaultProps} />);

    const harvestButton = screen.getAllByText('Harvest')[0];
    fireEvent.click(harvestButton);

    expect(defaultProps.onHarvest).toHaveBeenCalledWith(mockPlants[0]);
  });

  it('should not show clone/harvest buttons for harvested plants', () => {
    const harvestedPlant = {
      ...mockPlants[0],
      id: 'harvested-plant',
      harvested: true,
      status: 'harvested'
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[harvestedPlant]}
      />
    );

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.queryByText('Clone')).not.toBeInTheDocument();
    expect(screen.queryByText('Harvest')).not.toBeInTheDocument();
  });

  it('should display plant information correctly', () => {
    const testPlant = {
      ...mockPlants[0],
      name: 'Special Plant',
      strain: 'Special Strain',
      uid: 'UID-123',
      origin: 'Seed',
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[testPlant]}
      />
    );

    expect(screen.getByText('Special Plant')).toBeInTheDocument();
    expect(screen.getByText('Special Strain')).toBeInTheDocument();
    expect(screen.getByText('UID-123')).toBeInTheDocument();
    expect(screen.getByText('Seed')).toBeInTheDocument();
  });

  it('should show plant image when available', () => {
    const plantWithImage = {
      ...mockPlants[0],
      imageUrl: 'https://example.com/plant.jpg',
      name: 'Plant With Image'
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[plantWithImage]}
      />
    );

    const image = screen.getByAltText('Plant With Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/plant.jpg');
  });

  it('should show placeholder when no image available', () => {
    const plantWithoutImage = {
      ...mockPlants[0],
      imageUrl: null,
      image: null,
      name: 'Plant Without Image'
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[plantWithoutImage]}
      />
    );

    // Should show plant emoji placeholder
    expect(screen.getByText('🌱')).toBeInTheDocument();
  });

  it('should handle scroll events in virtualized mode', async () => {
    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants}
        hasMore={true}
      />
    );

    const scrollContainer = screen.getByRole('region', { hidden: true }) || 
                          document.querySelector('[style*="overflow-auto"]');
    
    if (scrollContainer) {
      // Simulate scroll to bottom
      fireEvent.scroll(scrollContainer, { 
        target: { 
          scrollTop: 1000,
          scrollHeight: 2000,
          clientHeight: 600 
        } 
      });

      await waitFor(() => {
        expect(defaultProps.onLoadMore).toHaveBeenCalled();
      });
    }
  });

  it('should show loading indicator when loading more', () => {
    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        loading={true}
        hasMore={true}
      />
    );

    expect(screen.getByText('Loading more plants...')).toBeInTheDocument();
  });

  it('should show load more button in non-virtualized mode', () => {
    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants.slice(0, 5)}
        enableVirtualization={false}
        hasMore={true}
      />
    );

    const loadMoreButton = screen.getByText('Load More Plants');
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);
    expect(defaultProps.onLoadMore).toHaveBeenCalled();
  });

  it('should disable load more button when loading', () => {
    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants.slice(0, 5)}
        enableVirtualization={false}
        hasMore={true}
        loading={true}
      />
    );

    const loadMoreButton = screen.getByRole('button', { name: /loading/i });
    expect(loadMoreButton).toBeDisabled();
  });

  it('should call formatDate for displaying dates', () => {
    render(<PlantsVirtualizedList {...defaultProps} />);

    expect(defaultProps.formatDate).toHaveBeenCalled();
  });

  it('should call getStatusBadge for displaying status', () => {
    render(<PlantsVirtualizedList {...defaultProps} />);

    expect(defaultProps.getStatusBadge).toHaveBeenCalled();
  });

  it('should handle clone origin display correctly', () => {
    const clonePlant = {
      ...mockPlants[0],
      isClone: true,
      origin: undefined // Should fallback to 'Clone'
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[clonePlant]}
      />
    );

    expect(screen.getByText('Clone')).toBeInTheDocument();
  });

  it('should handle seed origin display correctly', () => {
    const seedPlant = {
      ...mockPlants[0],
      isClone: false,
      origin: undefined // Should fallback to 'Seed'
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[seedPlant]}
      />
    );

    expect(screen.getByText('Seed')).toBeInTheDocument();
  });

  it('should apply lazy loading to images', () => {
    const plantWithImage = {
      ...mockPlants[0],
      imageUrl: 'https://example.com/plant.jpg',
    };

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[plantWithImage]}
      />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should handle resize events for virtualization', () => {
    const { rerender } = render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants}
        height={400}
      />
    );

    // Simulate height change
    rerender(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={mockPlants}
        height={800}
      />
    );

    // Component should handle the height change gracefully
    expect(screen.getAllByText(/Test Plant/).length).toBeGreaterThan(0);
  });

  it('should show correct status badges', () => {
    const plantWithStatus = {
      ...mockPlants[0],
      status: 'flowering'
    };

    defaultProps.getStatusBadge.mockReturnValue({
      label: 'Flowering',
      className: 'bg-yellow-100 text-yellow-800'
    });

    render(
      <PlantsVirtualizedList 
        {...defaultProps}
        plants={[plantWithStatus]}
      />
    );

    expect(screen.getByText('Flowering')).toBeInTheDocument();
  });
});
