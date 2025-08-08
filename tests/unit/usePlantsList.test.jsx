import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { usePlantsList } from '../../src/hooks/usePlantsList';
import { useAuth } from '../../src/hooks/useAuth';
import { getUserPlants, getPlantStats } from '../../src/utils/firestore';

// Mock dependencies
vi.mock('../../src/hooks/useAuth');
vi.mock('../../src/utils/firestore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('usePlantsList', () => {
  const mockUser = { id: 'user123' };
  const mockPlants = [
    { 
      id: '1', 
      name: 'Test Plant 1', 
      status: 'active',
      plantedDate: new Date('2023-01-01')
    },
    { 
      id: '2', 
      name: 'Test Plant 2', 
      status: 'harvested',
      isClone: true
    }
  ];
  const mockStats = {
    totalPlants: 2,
    activePlants: 1,
    harvestedPlants: 1,
    totalClones: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    getUserPlants.mockResolvedValue(mockPlants);
    getPlantStats.mockResolvedValue(mockStats);
  });

  it('loads plants data on mount when user is present', async () => {
    const { result } = renderHook(() => usePlantsList(), { wrapper });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getUserPlants).toHaveBeenCalledWith('user123');
    expect(getPlantStats).toHaveBeenCalledWith('user123');
    expect(result.current.plants).toEqual(mockPlants);
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.loading).toBe(false);
  });

  it('filters plants correctly based on active filter', async () => {
    const { result } = renderHook(() => usePlantsList(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Default filter is 'active'
    expect(result.current.filteredPlants).toHaveLength(1);
    expect(result.current.filteredPlants[0].status).toBe('active');

    // Change to harvested filter
    act(() => {
      result.current.handleFilterChange('harvested');
    });

    expect(result.current.filteredPlants).toHaveLength(1);
    expect(result.current.filteredPlants[0].status).toBe('harvested');

    // Change to clones filter
    act(() => {
      result.current.handleFilterChange('clones');
    });

    expect(result.current.filteredPlants).toHaveLength(1);
    expect(result.current.filteredPlants[0].isClone).toBe(true);
  });

  it('formats dates correctly', async () => {
    const { result } = renderHook(() => usePlantsList(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const formattedDate = result.current.formatDate(new Date('2023-01-01T12:00:00Z'));
    expect(formattedDate).toBe('Jan 1, 2023');

    const formattedNull = result.current.formatDate(null);
    expect(formattedNull).toBe('N/A');
  });

  it('generates status badge data correctly', async () => {
    const { result } = renderHook(() => usePlantsList(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const activePlant = { status: 'active' };
    const badge = result.current.getStatusBadge(activePlant);
    
    expect(badge).toHaveProperty('className');
    expect(badge).toHaveProperty('label');
    expect(badge.label).toBe('Active');
    expect(badge.className).toContain('bg-green-100');
  });

  it('handles loading errors', async () => {
    getUserPlants.mockRejectedValue(new Error('Failed to load'));

    const { result } = renderHook(() => usePlantsList(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to load plants. Please try again.');
    expect(result.current.loading).toBe(false);
  });
});
