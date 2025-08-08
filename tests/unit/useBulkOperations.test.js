// tests/unit/useBulkOperations.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBulkOperations } from '../../src/hooks/useBulkOperations';

// Mock Firebase and utilities
vi.mock('../../src/utils/firestore', () => ({
  updatePlant: vi.fn(),
  deletePlant: vi.fn(),
  batchUpdatePlants: vi.fn(),
  clonePlant: vi.fn()
}));

vi.mock('../../src/utils/logger', () => ({
  logBulkOperation: vi.fn(),
  logError: vi.fn()
}));

describe('useBulkOperations', () => {
  const mockPlants = [
    {
      id: '1',
      name: 'Test Plant 1',
      strain: 'Test Strain 1',
      status: 'vegetative',
      stage: 'vegetative'
    },
    {
      id: '2',
      name: 'Test Plant 2',
      strain: 'Test Strain 2',
      status: 'flowering',
      stage: 'flowering'
    },
    {
      id: '3',
      name: 'Test Plant 3',
      strain: 'Test Strain 3',
      status: 'seedling',
      stage: 'seedling'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useBulkOperations());

    expect(result.current.selectedPlants).toEqual([]);
    expect(result.current.selectMode).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toEqual({
      total: 0,
      completed: [],
      failed: [],
      processing: []
    });
  });

  it('should toggle plant selection', () => {
    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.togglePlant(mockPlants[0]);
    });

    expect(result.current.selectedPlants).toHaveLength(1);
    expect(result.current.selectedPlants[0]).toEqual(mockPlants[0]);

    // Toggle again to deselect
    act(() => {
      result.current.togglePlant(mockPlants[0]);
    });

    expect(result.current.selectedPlants).toHaveLength(0);
  });

  it('should select multiple plants', () => {
    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(mockPlants.slice(0, 2));
    });

    expect(result.current.selectedPlants).toHaveLength(2);
    expect(result.current.selectedPlants).toEqual(mockPlants.slice(0, 2));
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(mockPlants);
    });

    expect(result.current.selectedPlants).toHaveLength(3);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedPlants).toHaveLength(0);
  });

  it('should toggle select mode', () => {
    const { result } = renderHook(() => useBulkOperations());

    expect(result.current.selectMode).toBe(false);

    act(() => {
      result.current.toggleSelectMode();
    });

    expect(result.current.selectMode).toBe(true);

    act(() => {
      result.current.toggleSelectMode();
    });

    expect(result.current.selectMode).toBe(false);
  });

  it('should handle bulk stage update', async () => {
    const { updatePlant } = await import('../../src/utils/firestore');
    updatePlant.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(mockPlants.slice(0, 2));
    });

    await act(async () => {
      await result.current.executeBulkOperation('update_stage', { stage: 'flowering' });
    });

    expect(updatePlant).toHaveBeenCalledTimes(2);
    expect(updatePlant).toHaveBeenCalledWith('1', { stage: 'flowering' });
    expect(updatePlant).toHaveBeenCalledWith('2', { stage: 'flowering' });
  });

  it('should handle bulk location update', async () => {
    const { updatePlant } = await import('../../src/utils/firestore');
    updatePlant.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants([mockPlants[0]]);
    });

    await act(async () => {
      await result.current.executeBulkOperation('update_location', { location: 'Greenhouse A' });
    });

    expect(updatePlant).toHaveBeenCalledWith('1', { location: 'Greenhouse A' });
  });

  it('should handle bulk clone operation', async () => {
    const { clonePlant } = await import('../../src/utils/firestore');
    clonePlant.mockResolvedValue({ id: 'clone-1', name: 'Test Plant 1 Clone 1' });

    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants([mockPlants[0]]);
    });

    await act(async () => {
      await result.current.executeBulkOperation('create_clones', { 
        cloneCount: 2,
        namingPattern: '{parent} Clone {number}'
      });
    });

    expect(clonePlant).toHaveBeenCalledTimes(2);
  });

  it('should handle errors during bulk operations', async () => {
    const { updatePlant } = await import('../../src/utils/firestore');
    updatePlant.mockRejectedValueOnce(new Error('Update failed'));
    updatePlant.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(mockPlants.slice(0, 2));
    });

    await act(async () => {
      await result.current.executeBulkOperation('update_stage', { stage: 'flowering' });
    });

    expect(result.current.progress.completed).toHaveLength(1);
    expect(result.current.progress.failed).toHaveLength(1);
    expect(result.current.progress.failed[0].error).toBe('Update failed');
  });

  it('should track progress during operations', async () => {
    const { updatePlant } = await import('../../src/utils/firestore');
    updatePlant.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(mockPlants);
    });

    const operationPromise = act(async () => {
      await result.current.executeBulkOperation('update_stage', { stage: 'flowering' });
    });

    // Check that processing state is set
    expect(result.current.isProcessing).toBe(true);

    await operationPromise;

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress.completed).toHaveLength(3);
  });

  it('should validate operation configs', () => {
    const { result } = renderHook(() => useBulkOperations());

    expect(result.current.OPERATION_CONFIGS).toHaveProperty('update_stage');
    expect(result.current.OPERATION_CONFIGS).toHaveProperty('update_location');
    expect(result.current.OPERATION_CONFIGS).toHaveProperty('create_clones');
    expect(result.current.OPERATION_CONFIGS).toHaveProperty('record_metrics');
    expect(result.current.OPERATION_CONFIGS).toHaveProperty('add_note');
    expect(result.current.OPERATION_CONFIGS).toHaveProperty('harvest_plants');
    expect(result.current.OPERATION_CONFIGS).toHaveProperty('delete_plants');

    // Check required properties
    Object.values(result.current.OPERATION_CONFIGS).forEach(config => {
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('requiresInput');
      expect(config).toHaveProperty('estimatedTime');
    });
  });

  it('should handle undo/redo operations', async () => {
    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants([mockPlants[0]]);
    });

    // Execute an operation
    await act(async () => {
      await result.current.executeBulkOperation('update_stage', { stage: 'flowering' });
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    // Undo the operation
    await act(async () => {
      await result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    // Redo the operation
    await act(async () => {
      await result.current.redo();
    });

    expect(result.current.canUndo).toBe(true);
  });

  it('should clear selection when exiting select mode', () => {
    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(mockPlants);
      result.current.toggleSelectMode();
    });

    expect(result.current.selectedPlants).toHaveLength(3);
    expect(result.current.selectMode).toBe(true);

    act(() => {
      result.current.toggleSelectMode();
    });

    expect(result.current.selectedPlants).toHaveLength(0);
    expect(result.current.selectMode).toBe(false);
  });

  it('should prevent duplicate selections', () => {
    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.togglePlant(mockPlants[0]);
      result.current.togglePlant(mockPlants[0]); // Try to add same plant again
    });

    expect(result.current.selectedPlants).toHaveLength(0); // Should be deselected
  });

  it('should handle batch size limits', async () => {
    const { batchUpdatePlants } = await import('../../src/utils/firestore');
    batchUpdatePlants.mockResolvedValue([]);

    const largePlantList = Array.from({ length: 150 }, (_, i) => ({
      id: `plant-${i}`,
      name: `Plant ${i}`,
      strain: 'Test Strain'
    }));

    const { result } = renderHook(() => useBulkOperations());

    act(() => {
      result.current.selectPlants(largePlantList);
    });

    await act(async () => {
      await result.current.executeBulkOperation('update_stage', { stage: 'flowering' });
    });

    // Should process in batches (default batch size is 50)
    expect(batchUpdatePlants).toHaveBeenCalledTimes(3);
  });
});
