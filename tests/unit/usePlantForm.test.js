// tests/unit/usePlantForm.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import usePlantForm from '../../src/hooks/usePlantForm';

// Mock the utilities
vi.mock('../../src/utils/uidGeneration', () => ({
  generatePlantUID: vi.fn(() => 'PH-TEST-001'),
  generatePlantCode: vi.fn(() => 'TST001'),
}));

vi.mock('../../src/utils/strainValidation', () => ({
  validateStrainName: vi.fn((strain) => strain.length > 0),
  suggestSimilarStrains: vi.fn(() => ['Blue Dream', 'Green Crack']),
}));

vi.mock('../../src/utils/firestore', () => ({
  addPlant: vi.fn(),
}));

vi.mock('../../src/utils/firebaseStorage', () => ({
  uploadPlantImage: vi.fn(),
}));

vi.mock('../../src/hooks/useAuth', () => ({
  default: () => ({ user: { uid: 'test-user-123' } }),
}));

import { generatePlantUID, generatePlantCode } from '../../src/utils/uidGeneration';
import { validateStrainName } from '../../src/utils/strainValidation';
import { addPlant } from '../../src/utils/firestore';
import { uploadPlantImage } from '../../src/utils/firebaseStorage';

describe('usePlantForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePlantForm());

    expect(result.current.formData).toEqual({
      name: '',
      strain: '',
      origin: 'seed',
      plantDate: new Date().toISOString().split('T')[0],
      notes: '',
      image: null,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe(false);
    expect(result.current.plantCode).toBe('TST001');
    expect(result.current.plantUID).toBe('PH-TEST-001');
  });

  it('updates form data correctly', () => {
    const { result } = renderHook(() => usePlantForm());

    act(() => {
      result.current.updateFormData('name', 'Blue Dream Plant');
    });

    expect(result.current.formData.name).toBe('Blue Dream Plant');
  });

  it('validates strain correctly', () => {
    const { result } = renderHook(() => usePlantForm());

    act(() => {
      result.current.updateFormData('strain', 'Blue Dream');
    });

    expect(validateStrainName).toHaveBeenCalledWith('Blue Dream');
  });

  it('handles form submission successfully', async () => {
    addPlant.mockResolvedValue({ id: 'plant-123' });
    uploadPlantImage.mockResolvedValue('https://example.com/image.jpg');

    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => usePlantForm(mockOnSuccess));

    // Set up form data
    act(() => {
      result.current.updateFormData('name', 'Test Plant');
      result.current.updateFormData('strain', 'Blue Dream');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(addPlant).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Plant',
        strain: 'Blue Dream',
        uid: 'PH-TEST-001',
        code: 'TST001',
        userId: 'test-user-123',
      })
    );
    expect(result.current.success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('handles form submission with image upload', async () => {
    addPlant.mockResolvedValue({ id: 'plant-123' });
    uploadPlantImage.mockResolvedValue('https://example.com/image.jpg');

    const { result } = renderHook(() => usePlantForm());
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Set up form data with image
    act(() => {
      result.current.updateFormData('name', 'Test Plant');
      result.current.updateFormData('strain', 'Blue Dream');
      result.current.updateFormData('image', mockFile);
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(uploadPlantImage).toHaveBeenCalledWith(mockFile, 'plant-123');
    expect(addPlant).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'https://example.com/image.jpg',
      })
    );
  });

  it('handles form submission errors', async () => {
    addPlant.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => usePlantForm());

    // Set up form data
    act(() => {
      result.current.updateFormData('name', 'Test Plant');
      result.current.updateFormData('strain', 'Blue Dream');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe('Failed to add plant. Please try again.');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('resets form correctly', () => {
    const { result } = renderHook(() => usePlantForm());

    // Set some data first
    act(() => {
      result.current.updateFormData('name', 'Test Plant');
      result.current.updateFormData('strain', 'Blue Dream');
    });

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.strain).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe(false);
  });

  it('regenerates UIDs correctly', () => {
    const { result } = renderHook(() => usePlantForm());
    const originalUID = result.current.plantUID;
    const originalCode = result.current.plantCode;

    generatePlantUID.mockReturnValue('PH-NEW-002');
    generatePlantCode.mockReturnValue('NEW002');

    act(() => {
      result.current.regenerateUIDs();
    });

    expect(result.current.plantUID).toBe('PH-NEW-002');
    expect(result.current.plantCode).toBe('NEW002');
    expect(result.current.plantUID).not.toBe(originalUID);
    expect(result.current.plantCode).not.toBe(originalCode);
  });
});
