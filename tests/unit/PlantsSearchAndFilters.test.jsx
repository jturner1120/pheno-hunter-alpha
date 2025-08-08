// tests/unit/PlantsSearchAndFilters.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlantsSearchAndFilters from '../../src/components/plants/PlantsSearchAndFilters';

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  sortBy: 'createdAt',
  sortOrder: 'desc',
  onSortChange: vi.fn(),
  filteredCount: 10,
  totalCount: 15,
  activeFilter: 'all',
  loading: false,
};

describe('PlantsSearchAndFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input correctly', () => {
    render(<PlantsSearchAndFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search by name, strain/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('should display search term when provided', () => {
    render(
      <PlantsSearchAndFilters 
        {...defaultProps} 
        searchQuery="test plant" 
      />
    );

    const searchInput = screen.getByDisplayValue('test plant');
    expect(searchInput).toBeInTheDocument();
  });

  it('should call onSearchChange when typing in search input', async () => {
    render(<PlantsSearchAndFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search by name, strain/i);
    
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('new search');
  });

  it('should render sort dropdown correctly', () => {
    render(<PlantsSearchAndFilters {...defaultProps} />);

    // Look for the sort select by its label text
    expect(screen.getByText('Sort by:')).toBeInTheDocument();
  });

  it('should call onSortChange when sort option is selected', () => {
    render(<PlantsSearchAndFilters {...defaultProps} />);

    const sortSelect = screen.getByDisplayValue('Date Added (Newest)');
    fireEvent.change(sortSelect, { target: { value: 'name-asc' } });

    expect(defaultProps.onSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('should display correct results count', () => {
    render(<PlantsSearchAndFilters {...defaultProps} />);

    expect(screen.getByText('Showing 15 plants')).toBeInTheDocument();
  });

  it('should display filtered results count when searching', () => {
    render(
      <PlantsSearchAndFilters 
        {...defaultProps} 
        searchQuery="test"
        filteredCount={3}
        totalCount={15}
        activeFilter="all"
      />
    );

    expect(screen.getByText('Showing 3 of 15 plants')).toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', () => {
    render(
      <PlantsSearchAndFilters 
        {...defaultProps} 
        searchQuery="test search"
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<PlantsSearchAndFilters {...defaultProps} />);

    const searchInput = screen.getByLabelText(/search plants/i);
    expect(searchInput).toBeInTheDocument();

    const sortSelect = screen.getByLabelText(/sort plants/i);
    expect(sortSelect).toBeInTheDocument();
  });

  it('should show loading state correctly', () => {
    render(
      <PlantsSearchAndFilters 
        {...defaultProps} 
        loading={true}
      />
    );

    expect(screen.getByText('Loading plants...')).toBeInTheDocument();
  });

  it('should handle edge cases for counts', () => {
    // Test with zero results
    render(
      <PlantsSearchAndFilters 
        {...defaultProps} 
        filteredCount={0}
        totalCount={0}
      />
    );

    expect(screen.getByText('Showing 0 plants')).toBeInTheDocument();

    // Test with single result
    render(
      <PlantsSearchAndFilters 
        {...defaultProps} 
        filteredCount={1}
        totalCount={1}
      />
    );

    expect(screen.getByText('Showing 1 plant')).toBeInTheDocument();
  });
});
