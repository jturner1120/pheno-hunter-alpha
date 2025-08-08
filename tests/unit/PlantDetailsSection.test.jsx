// tests/unit/PlantDetailsSection.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PlantDetailsSection from '../../src/components/plants/PlantDetailsSection';

const mockFormData = {
  name: '',
  strain: '',
  origin: 'seed',
  notes: '',
};

const mockOnChange = vi.fn();
const mockOnRegenerate = vi.fn();

describe('PlantDetailsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    expect(screen.getByLabelText('Plant Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Strain *')).toBeInTheDocument();
    expect(screen.getByLabelText('Origin *')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('displays plant code and UID correctly', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    expect(screen.getByText('TST001')).toBeInTheDocument();
    expect(screen.getByText('PH-TEST-001')).toBeInTheDocument();
  });

  it('handles plant name input changes', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    const nameInput = screen.getByLabelText('Plant Name *');
    fireEvent.change(nameInput, { target: { value: 'Blue Dream Plant' } });

    expect(mockOnChange).toHaveBeenCalledWith('name', 'Blue Dream Plant');
  });

  it('handles strain input changes', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    const strainInput = screen.getByLabelText('Strain *');
    fireEvent.change(strainInput, { target: { value: 'Blue Dream' } });

    expect(mockOnChange).toHaveBeenCalledWith('strain', 'Blue Dream');
  });

  it('handles origin select changes', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    const originSelect = screen.getByLabelText('Origin *');
    fireEvent.change(originSelect, { target: { value: 'clone' } });

    expect(mockOnChange).toHaveBeenCalledWith('origin', 'clone');
  });

  it('handles notes textarea changes', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    const notesTextarea = screen.getByLabelText('Notes');
    fireEvent.change(notesTextarea, { target: { value: 'This is a test note' } });

    expect(mockOnChange).toHaveBeenCalledWith('notes', 'This is a test note');
  });

  it('calls onRegenerateUIDs when regenerate button is clicked', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    const regenerateButton = screen.getByText('🔄');
    fireEvent.click(regenerateButton);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });

  it('displays form data values correctly', () => {
    const filledFormData = {
      name: 'Blue Dream Plant',
      strain: 'Blue Dream',
      origin: 'clone',
      notes: 'Premium genetics',
    };

    render(
      <PlantDetailsSection
        formData={filledFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    expect(screen.getByDisplayValue('Blue Dream Plant')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Blue Dream')).toBeInTheDocument();
    expect(screen.getByDisplayValue('clone')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Premium genetics')).toBeInTheDocument();
  });

  it('shows required field indicators', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    // Check for asterisks in labels
    expect(screen.getByText('Plant Name *')).toBeInTheDocument();
    expect(screen.getByText('Strain *')).toBeInTheDocument();
    expect(screen.getByText('Origin *')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <PlantDetailsSection
        formData={mockFormData}
        onChange={mockOnChange}
        onRegenerateUIDs={mockOnRegenerate}
        plantCode="TST001"
        plantUID="PH-TEST-001"
      />
    );

    const nameInput = screen.getByLabelText('Plant Name *');
    const strainInput = screen.getByLabelText('Strain *');
    const originSelect = screen.getByLabelText('Origin *');
    
    expect(nameInput).toHaveAttribute('required');
    expect(strainInput).toHaveAttribute('required');
    expect(originSelect).toHaveAttribute('required');
  });
});
