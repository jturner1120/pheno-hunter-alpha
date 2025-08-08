// tests/unit/DashboardHeader.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DashboardHeader from '../../src/components/dashboard/DashboardHeader';

describe('DashboardHeader', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with user name', () => {
    const user = { name: 'John Doe' };
    
    render(<DashboardHeader user={user} onLogout={mockOnLogout} />);

    expect(screen.getByText('Pheno Hunter')).toBeInTheDocument();
    expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders with username when name is not available', () => {
    const user = { username: 'johndoe123' };
    
    render(<DashboardHeader user={user} onLogout={mockOnLogout} />);

    expect(screen.getByText('Welcome, johndoe123!')).toBeInTheDocument();
  });

  it('renders with fallback when no user info available', () => {
    const user = {};
    
    render(<DashboardHeader user={user} onLogout={mockOnLogout} />);

    expect(screen.getByText('Welcome, Grower!')).toBeInTheDocument();
  });

  it('handles null user gracefully', () => {
    render(<DashboardHeader user={null} onLogout={mockOnLogout} />);

    expect(screen.getByText('Welcome, Grower!')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const user = { name: 'John Doe' };
    
    render(<DashboardHeader user={user} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    const user = { name: 'John Doe' };
    
    render(<DashboardHeader user={user} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout from your account');
  });

  it('has proper styling classes', () => {
    const user = { name: 'John Doe' };
    
    render(<DashboardHeader user={user} onLogout={mockOnLogout} />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
  });
});
