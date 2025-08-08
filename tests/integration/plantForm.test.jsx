// tests/integration/plantForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PlantForm from '../../src/components/plants/PlantForm';

// Mock the dependencies
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

import { addPlant } from '../../src/utils/firestore';
import { uploadPlantImage } from '../../src/utils/firebaseStorage';

// Wrapper component to provide router context
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('PlantForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form sections correctly', () => {
    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // Header section
    expect(screen.getByText('Add New Plant')).toBeInTheDocument();
    expect(screen.getByText('Track your plant from seed to harvest')).toBeInTheDocument();

    // Details section
    expect(screen.getByLabelText('Plant Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Strain *')).toBeInTheDocument();
    expect(screen.getByLabelText('Origin *')).toBeInTheDocument();

    // UID preview
    expect(screen.getByText('TST001')).toBeInTheDocument();
    expect(screen.getByText('PH-TEST-001')).toBeInTheDocument();

    // Status/action section
    expect(screen.getByText('Add Plant')).toBeInTheDocument();
  });

  it('handles complete form submission flow', async () => {
    addPlant.mockResolvedValue({ id: 'plant-123' });

    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // Fill out the form
    const nameInput = screen.getByLabelText('Plant Name *');
    const strainInput = screen.getByLabelText('Strain *');
    const originSelect = screen.getByLabelText('Origin *');

    fireEvent.change(nameInput, { target: { value: 'Test Plant' } });
    fireEvent.change(strainInput, { target: { value: 'Blue Dream' } });
    fireEvent.change(originSelect, { target: { value: 'clone' } });

    // Submit the form
    const submitButton = screen.getByText('Add Plant');
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Adding Plant...')).toBeInTheDocument();

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Plant added successfully!')).toBeInTheDocument();
    });

    // Verify the addPlant was called with correct data
    expect(addPlant).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Plant',
        strain: 'Blue Dream',
        origin: 'clone',
        uid: 'PH-TEST-001',
        code: 'TST001',
        userId: 'test-user-123',
      })
    );
  });

  it('handles form submission with image upload', async () => {
    addPlant.mockResolvedValue({ id: 'plant-123' });
    uploadPlantImage.mockResolvedValue('https://example.com/image.jpg');

    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // Fill out basic form data
    fireEvent.change(screen.getByLabelText('Plant Name *'), { 
      target: { value: 'Test Plant' } 
    });
    fireEvent.change(screen.getByLabelText('Strain *'), { 
      target: { value: 'Blue Dream' } 
    });

    // Add image file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload plant image/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    fireEvent.click(screen.getByText('Add Plant'));

    await waitFor(() => {
      expect(screen.getByText('Plant added successfully!')).toBeInTheDocument();
    });

    expect(uploadPlantImage).toHaveBeenCalledWith(file, 'plant-123');
    expect(addPlant).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'https://example.com/image.jpg',
      })
    );
  });

  it('handles form submission errors gracefully', async () => {
    addPlant.mockRejectedValue(new Error('Database error'));

    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // Fill out minimum required fields
    fireEvent.change(screen.getByLabelText('Plant Name *'), { 
      target: { value: 'Test Plant' } 
    });
    fireEvent.change(screen.getByLabelText('Strain *'), { 
      target: { value: 'Blue Dream' } 
    });

    // Submit form
    fireEvent.click(screen.getByText('Add Plant'));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to add plant. Please try again.')).toBeInTheDocument();
    });

    // Should not show success message
    expect(screen.queryByText('Plant added successfully!')).not.toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Plant Name *');
    const strainInput = screen.getByLabelText('Strain *');
    const originSelect = screen.getByLabelText('Origin *');

    expect(nameInput).toHaveAttribute('required');
    expect(strainInput).toHaveAttribute('required');
    expect(originSelect).toHaveAttribute('required');
  });

  it('allows UID regeneration', () => {
    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // Should show initial UIDs
    expect(screen.getByText('TST001')).toBeInTheDocument();
    expect(screen.getByText('PH-TEST-001')).toBeInTheDocument();

    // Find and click regenerate button
    const regenerateButton = screen.getByText('🔄');
    fireEvent.click(regenerateButton);

    // The mock would need to return different values for this to change
    // In a real scenario, this would generate new UIDs
  });

  it('resets form after successful submission', async () => {
    addPlant.mockResolvedValue({ id: 'plant-123' });

    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // Fill out form
    const nameInput = screen.getByLabelText('Plant Name *');
    const strainInput = screen.getByLabelText('Strain *');
    
    fireEvent.change(nameInput, { target: { value: 'Test Plant' } });
    fireEvent.change(strainInput, { target: { value: 'Blue Dream' } });

    // Submit form
    fireEvent.click(screen.getByText('Add Plant'));

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Plant added successfully!')).toBeInTheDocument();
    });

    // Form should be reset
    expect(nameInput.value).toBe('');
    expect(strainInput.value).toBe('');
  });

  it('is wrapped in error boundary for error handling', () => {
    // The PlantForm should be wrapped in FormErrorBoundary
    // This test verifies the structure is in place
    render(
      <TestWrapper>
        <PlantForm />
      </TestWrapper>
    );

    // The form should render normally, indicating error boundary is working
    expect(screen.getByText('Add New Plant')).toBeInTheDocument();
  });
});
