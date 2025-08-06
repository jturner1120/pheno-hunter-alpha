import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../src/hooks/useAuth'
import PlantForm from '../../src/components/plants/PlantForm'
import PlantsList from '../../src/components/plants/PlantsList'
import PlantDetail from '../../src/components/plants/PlantDetail'
import { loadDemoData, resetWithDemoData } from '../../src/utils/demoData'

// Mock assets
vi.mock('../../src/assets/billy.png', () => ({
  default: 'mock-billy-image.png'
}))

// Mock React Router params for PlantDetail
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'demo_plant_1' }),
    useNavigate: () => vi.fn(),
  }
})

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Plant Lifecycle Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Plant Creation Flow', () => {
    it('creates a new plant with all required data', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <PlantForm />
        </TestWrapper>
      )

      // Fill out the form
      await user.type(screen.getByLabelText(/plant name/i), 'Test Blue Dream')
      await user.type(screen.getByLabelText(/strain/i), 'Blue Dream')
      await user.selectOptions(screen.getByLabelText(/origin/i), 'Seed')
      
      const dateInput = screen.getByLabelText(/date planted/i)
      await user.clear(dateInput)
      await user.type(dateInput, '2025-08-01')

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /add plant/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/plant added successfully/i)).toBeInTheDocument()
      })

      // Verify data was saved to localStorage
      const plants = JSON.parse(localStorage.getItem('phenoHunter_plants') || '[]')
      expect(plants).toHaveLength(1)
      expect(plants[0]).toMatchObject({
        name: 'Test Blue Dream',
        strain: 'Blue Dream',
        origin: 'Seed',
        generation: 1,
        harvested: false
      })
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <PlantForm />
        </TestWrapper>
      )

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /add plant/i })
      await user.click(submitButton)

      // Should show validation errors
      expect(screen.getByLabelText(/plant name/i)).toBeRequired()
      expect(screen.getByLabelText(/strain/i)).toBeRequired()
      expect(screen.getByLabelText(/origin/i)).toBeRequired()
    })
  })

  describe('Plant List Display', () => {
    it('displays plants from localStorage', () => {
      // Load demo data first
      loadDemoData()
      
      render(
        <TestWrapper>
          <PlantsList />
        </TestWrapper>
      )

      // Should display demo plants
      expect(screen.getByText('Blue Dream #1')).toBeInTheDocument()
      expect(screen.getByText('OG Kush Mother')).toBeInTheDocument()
      expect(screen.getByText('OG Kush Clone #1')).toBeInTheDocument()
      expect(screen.getByText('White Widow Auto')).toBeInTheDocument()
    })

    it('shows correct plant statistics', () => {
      loadDemoData()
      
      render(
        <TestWrapper>
          <PlantsList />
        </TestWrapper>
      )

      // Should show statistics
      expect(screen.getByText(/2 Active/)).toBeInTheDocument()
      expect(screen.getByText(/2 Harvested/)).toBeInTheDocument()
      expect(screen.getByText(/1 Clone/)).toBeInTheDocument()
    })

    it('handles empty plant list', () => {
      render(
        <TestWrapper>
          <PlantsList />
        </TestWrapper>
      )

      expect(screen.getByText(/no plants yet/i)).toBeInTheDocument()
      expect(screen.getByText(/0 Active/)).toBeInTheDocument()
    })
  })

  describe('Clone Creation Flow', () => {
    it('creates clone with correct inheritance', async () => {
      const user = userEvent.setup()
      
      // Load demo data and render plant detail
      loadDemoData()
      
      render(
        <TestWrapper>
          <PlantDetail />
        </TestWrapper>
      )

      // Find and click clone button
      const cloneButton = screen.getByRole('button', { name: /clone plant/i })
      await user.click(cloneButton)

      // Should open clone modal
      expect(screen.getByText(/clone blue dream/i)).toBeInTheDocument()
      
      // Fill clone form
      await user.type(screen.getByLabelText(/clone name/i), 'Blue Dream Clone #1')
      
      // Confirm clone creation
      const confirmButton = screen.getByRole('button', { name: /create clone/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/clone created successfully/i)).toBeInTheDocument()
      })

      // Verify clone data
      const plants = JSON.parse(localStorage.getItem('phenoHunter_plants') || '[]')
      const clone = plants.find(p => p.name === 'Blue Dream Clone #1')
      
      expect(clone).toBeDefined()
      expect(clone.origin).toBe('Clone')
      expect(clone.generation).toBe(2) // Parent generation + 1
      expect(clone.strain).toBe('Blue Dream') // Inherited from parent
    })
  })

  describe('Harvest Flow', () => {
    it('harvests plant with statistics', async () => {
      const user = userEvent.setup()
      
      loadDemoData()
      
      render(
        <TestWrapper>
          <PlantDetail />
        </TestWrapper>
      )

      // Find and click harvest button
      const harvestButton = screen.getByRole('button', { name: /harvest plant/i })
      await user.click(harvestButton)

      // Should open harvest modal
      expect(screen.getByText(/harvest blue dream/i)).toBeInTheDocument()
      
      // Fill harvest form
      await user.type(screen.getByLabelText(/weight/i), '85g')
      await user.type(screen.getByLabelText(/potency/i), '23% THC')
      await user.type(screen.getByLabelText(/notes/i), 'Excellent harvest with dense buds')
      
      // Confirm harvest
      const confirmButton = screen.getByRole('button', { name: /confirm harvest/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/plant harvested successfully/i)).toBeInTheDocument()
      })

      // Verify harvest data
      const plants = JSON.parse(localStorage.getItem('phenoHunter_plants') || '[]')
      const harvestedPlant = plants.find(p => p.id === 'demo_plant_1')
      
      expect(harvestedPlant.harvested).toBe(true)
      expect(harvestedPlant.harvestStats).toMatchObject({
        weight: '85g',
        potency: '23% THC',
        notes: 'Excellent harvest with dense buds'
      })
    })
  })

  describe('Demo Data Integration', () => {
    it('loads demo data correctly', () => {
      const plants = loadDemoData()
      
      expect(plants).toHaveLength(4)
      expect(plants[0].name).toBe('Blue Dream #1')
      expect(plants[1].name).toBe('OG Kush Mother')
      expect(plants[2].name).toBe('OG Kush Clone #1')
      expect(plants[3].name).toBe('White Widow Auto')
    })

    it('resets with demo data', () => {
      // Add some existing data
      localStorage.setItem('phenoHunter_plants', JSON.stringify([{
        id: 'existing_plant',
        name: 'Existing Plant'
      }]))

      const plants = resetWithDemoData()
      
      expect(plants).toHaveLength(4)
      expect(plants.find(p => p.id === 'existing_plant')).toBeUndefined()
    })
  })
})
