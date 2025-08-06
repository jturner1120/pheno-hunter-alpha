import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import SignUp from '../../src/components/auth/SignUp'
import { AuthProvider } from '../../src/hooks/useAuth'

// Mock Billy Bong image
vi.mock('../../src/assets/billy.png', () => ({
  default: 'mock-billy-image.png'
}))

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('SignUp Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders signup form with all required fields', () => {
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    expect(screen.getByText('Join Pheno Hunter')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('displays Billy Bong mascot', () => {
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const billyImage = screen.getByAltText(/billy bong/i)
    expect(billyImage).toBeInTheDocument()
    expect(billyImage).toHaveAttribute('src', 'mock-billy-image.png')
  })

  it('validates password confirmation', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('validates minimum password length', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(passwordInput, '123')
    await user.type(confirmPasswordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Create an error
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    // Clear error by typing
    await user.clear(confirmPasswordInput)
    await user.type(confirmPasswordInput, 'p')

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
  })

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    await user.click(submitButton)

    expect(screen.getByText('Creating Account...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('has link to login page', () => {
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const loginLink = screen.getByRole('link', { name: /sign in here/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('requires all fields to be filled', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <SignUp />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(screen.getByLabelText(/username/i)).toBeRequired()
    expect(screen.getByLabelText(/email/i)).toBeRequired()
    expect(screen.getByLabelText(/^password$/i)).toBeRequired()
    expect(screen.getByLabelText(/confirm password/i)).toBeRequired()
  })
})
