// tests/unit/useDashboard.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import useDashboard from '../../src/hooks/useDashboard';

// Mock the dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ 
    user: { id: 'test-user-123', name: 'Test User' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../src/utils/firestore', () => ({
  getUserPlants: vi.fn(),
  getPlantStats: vi.fn(),
}));

vi.mock('../../src/utils/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

import { getUserPlants, getPlantStats } from '../../src/utils/firestore';
import { logInfo, logError } from '../../src/utils/logger';

const mockPlants = [
  {
    id: '1',
    name: 'Blue Dream',
    strain: 'Blue Dream',
    status: 'vegetative',
    createdAt: new Date(),
    isClone: false,
  },
  {
    id: '2',
    name: 'Clone 1',
    strain: 'Blue Dream',
    status: 'flowering',
    createdAt: new Date(),
    isClone: true,
  },
  {
    id: '3',
    name: 'Harvested Plant',
    strain: 'Green Crack',
    status: 'harvested',
    createdAt: new Date(),
    harvested: true,
  },
];

const mockStats = {
  total: 3,
  active: 2,
  clones: 1,
  harvested: 1,
};

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserPlants.mockResolvedValue(mockPlants);
    getPlantStats.mockResolvedValue(mockStats);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.loading).toBe(true);
    expect(result.current.plants).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('loads dashboard data successfully', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plants).toEqual(mockPlants);
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.hasPlants).toBe(true);
    expect(result.current.isFirstTime).toBe(false);
    expect(getUserPlants).toHaveBeenCalledWith('test-user-123');
    expect(getPlantStats).toHaveBeenCalledWith('test-user-123');
  });

  it('handles loading error gracefully', async () => {
    const error = new Error('Network error');
    getUserPlants.mockRejectedValue(error);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load dashboard data. Please try again.');
    expect(result.current.plants).toEqual([]);
    expect(logError).toHaveBeenCalledWith(error, { retryCount: 0 });
  });

  it('calculates recent plants correctly', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should filter out harvested plants and take the 5 most recent
    const recentPlants = result.current.recentPlants;
    expect(recentPlants).toHaveLength(2);
    expect(recentPlants.every(plant => plant.status !== 'harvested')).toBe(true);
  });

  it('handles empty plant collection', async () => {
    getUserPlants.mockResolvedValue([]);
    getPlantStats.mockResolvedValue({ total: 0, active: 0, clones: 0, harvested: 0 });

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasPlants).toBe(false);
    expect(result.current.isFirstTime).toBe(true);
    expect(result.current.recentPlants).toHaveLength(0);
  });

  it('retries loading data on network errors', async () => {
    getUserPlants
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(mockPlants);
    getPlantStats
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useDashboard());

    // Wait for initial failure and retry
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should eventually succeed after retry
    await waitFor(() => {
      expect(result.current.plants).toEqual(mockPlants);
    }, { timeout: 3000 });
  });

  it('provides retry functionality', async () => {
    const error = new Error('Test error');
    getUserPlants.mockRejectedValue(error);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Reset mock to succeed
    getUserPlants.mockResolvedValue(mockPlants);
    getPlantStats.mockResolvedValue(mockStats);

    // Call retry
    act(() => {
      result.current.retryLoadData();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('');
      expect(result.current.plants).toEqual(mockPlants);
    });
  });

  it('clears error when requested', async () => {
    getUserPlants.mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe('');
  });

  it('handles missing user gracefully', () => {
    // Re-mock useAuth to return no user
    vi.doMock('../../src/hooks/useAuth', () => ({
      useAuth: () => ({ user: null, logout: vi.fn() }),
    }));

    const { result } = renderHook(() => useDashboard());

    expect(result.current.loading).toBe(false);
    expect(result.current.plants).toEqual([]);
    expect(getUserPlants).not.toHaveBeenCalled();
  });

  it('logs user actions appropriately', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(logInfo).toHaveBeenCalledWith(
      'Loading dashboard data for user',
      { userId: 'test-user-123' }
    );
    expect(logInfo).toHaveBeenCalledWith(
      'Dashboard data loaded successfully',
      expect.objectContaining({
        plantsCount: mockPlants.length,
        stats: mockStats,
      })
    );
  });
});
