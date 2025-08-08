// tests/unit/usePlantsListOptimized.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies before importing the hook
vi.mock('../../src/utils/firestore', () => ({
  firestoreService: {
    subscribeToCollection: vi.fn(),
    unsubscribe: vi.fn(),
  }
}));

vi.mock('../../src/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../src/config/firebase', () => ({
  default: {},
  auth: {},
  db: {},
  storage: {}
}));

// Now import the hook after mocking
import { usePlantsListOptimized } from '../../src/hooks/usePlantsListOptimized';

// Mock data
const mockPlants = [
  {
    id: '1',
    name: 'Test Plant 1',
    strain: 'Indica',
    status: 'vegetative',
    createdAt: new Date('2024-01-01'),
    isClone: false,
    harvested: false,
  },
  {
    id: '2',
    name: 'Test Plant 2',
    strain: 'Sativa',
    status: 'flowering',
    createdAt: new Date('2024-01-02'),
    isClone: true,
    harvested: false,
  },
  {
    id: '3',
    name: 'Harvested Plant',
    strain: 'Hybrid',
    status: 'harvested',
    createdAt: new Date('2024-01-03'),
    isClone: false,
    harvested: true,
  },
];

describe('usePlantsListOptimized', () => {
  let mockFirestoreService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFirestoreService = require('../../src/utils/firestore').firestoreService;
    
    // Default mock implementation
    mockFirestoreService.subscribeToCollection.mockImplementation((collection, callback) => {
      // Simulate async data loading
      setTimeout(() => {
        callback(mockPlants, null);
      }, 100);
      return 'unsubscribe-id';
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePlantsListOptimized());

    expect(result.current.plants).toEqual([]);
    expect(result.current.filteredPlants).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.activeFilter).toBe('all');
    expect(result.current.sortBy).toBe('createdAt');
    expect(result.current.sortOrder).toBe('desc');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  it('should load plants and calculate stats correctly', async () => {
    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plants).toHaveLength(3);
    expect(result.current.stats).toEqual({
      total: 3,
      active: 2,
      harvested: 1,
      clones: 1,
    });
    expect(result.current.totalCount).toBe(3);
  });

  it('should handle search correctly with debounce', async () => {
    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test search
    act(() => {
      result.current.handleSearch('Test Plant 1');
    });

    // Wait for debounce
    await waitFor(() => {
      expect(result.current.searchTerm).toBe('Test Plant 1');
      expect(result.current.filteredPlants).toHaveLength(1);
      expect(result.current.filteredPlants[0].name).toBe('Test Plant 1');
    }, { timeout: 600 }); // Debounce is 500ms
  });

  it('should filter plants by status correctly', async () => {
    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Filter by active plants
    act(() => {
      result.current.handleFilterChange('active');
    });

    expect(result.current.activeFilter).toBe('active');
    expect(result.current.filteredPlants).toHaveLength(2);
    expect(result.current.filteredPlants.every(p => !p.harvested)).toBe(true);

    // Filter by harvested plants
    act(() => {
      result.current.handleFilterChange('harvested');
    });

    expect(result.current.filteredPlants).toHaveLength(1);
    expect(result.current.filteredPlants[0].harvested).toBe(true);

    // Filter by clones
    act(() => {
      result.current.handleFilterChange('clones');
    });

    expect(result.current.filteredPlants).toHaveLength(1);
    expect(result.current.filteredPlants[0].isClone).toBe(true);
  });

  it('should sort plants correctly', async () => {
    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Sort by name ascending
    act(() => {
      result.current.handleSortChange('name', 'asc');
    });

    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
    expect(result.current.filteredPlants[0].name).toBe('Harvested Plant');
    expect(result.current.filteredPlants[2].name).toBe('Test Plant 2');

    // Sort by name descending
    act(() => {
      result.current.handleSortChange('name', 'desc');
    });

    expect(result.current.filteredPlants[0].name).toBe('Test Plant 2');
    expect(result.current.filteredPlants[2].name).toBe('Harvested Plant');
  });

  it('should handle pagination correctly', async () => {
    // Create more plants for pagination testing
    const manyPlants = Array.from({ length: 50 }, (_, i) => ({
      id: `plant-${i}`,
      name: `Plant ${i}`,
      strain: 'Test',
      status: 'vegetative',
      createdAt: new Date(),
      isClone: false,
      harvested: false,
    }));

    mockFirestoreService.subscribeToCollection.mockImplementation((collection, callback) => {
      setTimeout(() => {
        callback(manyPlants, null);
      }, 100);
      return 'unsubscribe-id';
    });

    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check initial pagination
    expect(result.current.filteredPlants).toHaveLength(20); // First page
    expect(result.current.hasMore).toBe(true);
    expect(result.current.currentPage).toBe(1);

    // Load more
    act(() => {
      result.current.loadMore();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.filteredPlants).toHaveLength(40); // Two pages
    expect(result.current.hasMore).toBe(true);

    // Load final page
    act(() => {
      result.current.loadMore();
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.filteredPlants).toHaveLength(50); // All items
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle errors correctly', async () => {
    const testError = new Error('Firestore error');
    mockFirestoreService.subscribeToCollection.mockImplementation((collection, callback) => {
      setTimeout(() => {
        callback(null, testError);
      }, 100);
      return 'unsubscribe-id';
    });

    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(testError);
    expect(result.current.plants).toEqual([]);
  });

  it('should combine search and filters correctly', async () => {
    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Search for "Test" and filter by active
    act(() => {
      result.current.handleSearch('Test');
    });

    act(() => {
      result.current.handleFilterChange('active');
    });

    await waitFor(() => {
      expect(result.current.filteredPlants).toHaveLength(2);
      expect(result.current.filteredPlants.every(p => 
        p.name.includes('Test') && !p.harvested
      )).toBe(true);
    }, { timeout: 600 });
  });

  it('should provide navigation methods', async () => {
    const mockNavigate = vi.fn();
    vi.doMock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    const { result } = renderHook(() => usePlantsListOptimized());

    // Test navigation methods
    act(() => {
      result.current.handleView('plant-1');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/plant/plant-1');

    act(() => {
      result.current.handleAddPlant();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/plant/new');

    act(() => {
      result.current.handleBackToDashboard();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle clone and harvest actions', async () => {
    const mockNavigate = vi.fn();
    vi.doMock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    const { result } = renderHook(() => usePlantsListOptimized());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const testPlant = result.current.plants[0];

    // Test clone action
    act(() => {
      result.current.handleClone(testPlant);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/plant/new', {
      state: { cloneSource: testPlant }
    });

    // Test harvest action
    act(() => {
      result.current.handleHarvest(testPlant);
    });
    expect(mockNavigate).toHaveBeenCalledWith(`/plant/${testPlant.id}/harvest`);
  });

  it('should cleanup subscription on unmount', () => {
    const { unmount } = renderHook(() => usePlantsListOptimized());

    unmount();

    expect(mockFirestoreService.unsubscribe).toHaveBeenCalledWith('unsubscribe-id');
  });
});
