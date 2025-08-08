// tests/unit/PlantFormHeader.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlantFormHeader from '../../src/components/plants/PlantFormHeader';

describe('PlantFormHeader', () => {
  it('renders with default title', () => {
    render(<PlantFormHeader />);
    
    expect(screen.getByText('Add New Plant')).toBeInTheDocument();
    expect(screen.getByText('Track your plant from seed to harvest')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<PlantFormHeader title="Edit Plant Details" />);
    
    expect(screen.getByText('Edit Plant Details')).toBeInTheDocument();
    expect(screen.getByText('Track your plant from seed to harvest')).toBeInTheDocument();
  });

  it('renders with custom subtitle', () => {
    render(<PlantFormHeader subtitle="Update your plant information" />);
    
    expect(screen.getByText('Add New Plant')).toBeInTheDocument();
    expect(screen.getByText('Update your plant information')).toBeInTheDocument();
  });

  it('renders both custom title and subtitle', () => {
    render(
      <PlantFormHeader 
        title="Clone Plant" 
        subtitle="Create a genetic copy of your favorite plant" 
      />
    );
    
    expect(screen.getByText('Clone Plant')).toBeInTheDocument();
    expect(screen.getByText('Create a genetic copy of your favorite plant')).toBeInTheDocument();
  });

  it('displays the mascot image', () => {
    render(<PlantFormHeader />);
    
    const mascotImage = screen.getByAltText('PhenoHunter Mascot');
    expect(mascotImage).toBeInTheDocument();
    expect(mascotImage).toHaveAttribute('src', '/src/assets/billy.png');
  });

  it('has correct styling classes', () => {
    render(<PlantFormHeader />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('text-center', 'mb-8');
    
    const title = screen.getByText('Add New Plant');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-green-800', 'mb-2');
    
    const subtitle = screen.getByText('Track your plant from seed to harvest');
    expect(subtitle).toHaveClass('text-lg', 'text-gray-600', 'mb-4');
  });

  it('renders accessibility attributes correctly', () => {
    render(<PlantFormHeader />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const mascotImage = screen.getByAltText('PhenoHunter Mascot');
    expect(mascotImage).toBeInTheDocument();
  });
});
