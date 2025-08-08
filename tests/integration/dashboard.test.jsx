// tests/integration/dashboard.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/components/Dashboard';

// Mock all dependencies
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ 
    user: { id: 'test-user-123', name: 'Test User' },
    logout: vi.fn().mockResolvedValue(),
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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { getUserPlants, getPlantStats } from '../../src/utils/firestore';

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

const mockPlants = [
  {
    id: '1',
    name: 'Blue Dream Plant',
    strain: 'Blue Dream',
    status: 'vegetative',
    createdAt: new Date('2024-01-01'),
    imageUrl: 'https://example.com/plant1.jpg',
  },
  {
    id: '2',
    name: 'Clone 1',
    strain: 'Blue Dream',
    status: 'flowering',
    createdAt: new Date('2024-01-15'),
    isClone: true,
  },
];

const mockStats = {
  total: 2,
  active: 2,
  clones: 1,
  harvested: 0,
};

describe('Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    getUserPlants.mockResolvedValue(mockPlants);
    getPlantStats.mockResolvedValue(mockStats);
  });

  it('renders complete dashboard with data', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Should show loading initially
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Your Plant Dashboard')).toBeInTheDocument();
    });

    // Header should be visible
    expect(screen.getByText('Pheno Hunter')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();

    // Navigation cards should be visible
    expect(screen.getByText('Add Another Plant')).toBeInTheDocument();
    expect(screen.getByText('View Plants')).toBeInTheDocument();

    // Stats should be displayed
    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Active plants
    expect(screen.getByText('1')).toBeInTheDocument(); // Clones

    // Recent plants widget should show
    expect(screen.getByText('Recent Plants')).toBeInTheDocument();
    expect(screen.getByText('Blue Dream Plant')).toBeInTheDocument();
  });

  it('handles first-time user experience', async () => {
    getUserPlants.mockResolvedValue([]);
    getPlantStats.mockResolvedValue({ total: 0, active: 0, clones: 0, harvested: 0 });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome to Pheno Hunter!')).toBeInTheDocument();
    });

    // Should show first-time messaging
    expect(screen.getByText('Add Your First Plant')).toBeInTheDocument();
    expect(screen.getByText('Start your growing journey by adding your first plant to track.')).toBeInTheDocument();

    // View Plants card should be disabled
    const viewPlantsCard = screen.getByText('View Plants').closest('div');
    expect(viewPlantsCard).toHaveClass('opacity-50', 'cursor-not-allowed');

    // Stats should show empty state
    expect(screen.getByText('Your stats will appear here')).toBeInTheDocument();
  });

  it('handles navigation actions correctly', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Another Plant')).toBeInTheDocument();
    });

    // Test add plant navigation
    fireEvent.click(screen.getByText('Add Another Plant'));
    expect(mockNavigate).toHaveBeenCalledWith('/plant');

    // Test view plants navigation
    fireEvent.click(screen.getByText('View Plants'));
    expect(mockNavigate).toHaveBeenCalledWith('/plants');

    // Test recent plant navigation
    fireEvent.click(screen.getByText('Blue Dream Plant'));
    expect(mockNavigate).toHaveBeenCalledWith('/plants/1');
  });

  it('handles stats filtering navigation', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    });

    // Click on active plants stat
    fireEvent.click(screen.getByLabelText('View active plants'));
    expect(mockNavigate).toHaveBeenCalledWith('/plants?filter=active');

    // Click on clones stat
    fireEvent.click(screen.getByLabelText('View clones made'));
    expect(mockNavigate).toHaveBeenCalledWith('/plants?filter=clones');
  });

  it('handles logout functionality', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles loading errors gracefully', async () => {
    getUserPlants.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load dashboard data. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
  });

  it('handles authentication errors appropriately', async () => {
    getUserPlants.mockRejectedValue(new Error('Auth failure'));

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    });

    expect(screen.getByText('Please log in again to access your dashboard.')).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
  });

  it('supports retry functionality after errors', async () => {
    getUserPlants
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockPlants);
    getPlantStats
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockStats);

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    // Click retry
    fireEvent.click(screen.getByText('Try Again'));

    // Should eventually show the dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome to Your Plant Dashboard')).toBeInTheDocument();
    });
  });

  it('shows recent plants widget only when user has plants', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Plants')).toBeInTheDocument();
    });

    // Should show recent plants
    expect(screen.getByText('Blue Dream Plant')).toBeInTheDocument();
    expect(screen.getByText('Clone 1')).toBeInTheDocument();
    expect(screen.getByText('View All →')).toBeInTheDocument();
  });

  it('handles keyboard navigation correctly', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Another Plant')).toBeInTheDocument();
    });

    // Test keyboard navigation for add plant card
    const addPlantCard = screen.getByLabelText('Add a new plant to your collection');
    fireEvent.keyDown(addPlantCard, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/plant');

    // Test keyboard navigation for view plants card
    const viewPlantsCard = screen.getByLabelText('View your plant collection');
    fireEvent.keyDown(viewPlantsCard, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/plants');
  });
});
