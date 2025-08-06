import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generatePlantId,
  convertImageToBase64,
  getPlantsData,
  savePlantsData,
  saveAuthData,
  getAuthData,
  clearAuthData
} from '../../src/utils/localStorage'

describe('localStorage Utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('generatePlantId', () => {
    it('generates unique plant IDs', () => {
      const id1 = generatePlantId()
      const id2 = generatePlantId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^plant_\d+$/)
    })

    it('generates sequential IDs', () => {
      // Mock Date.now() to return predictable values
      const mockNow = vi.spyOn(Date, 'now')
      mockNow.mockReturnValueOnce(1000)
      mockNow.mockReturnValueOnce(2000)

      const id1 = generatePlantId()
      const id2 = generatePlantId()
      
      expect(id1).toBe('plant_1000')
      expect(id2).toBe('plant_2000')
      
      mockNow.mockRestore()
    })
  })

  describe('Plant Data Management', () => {
    const mockPlants = [
      {
        id: 'plant_1',
        name: 'Test Plant 1',
        strain: 'Blue Dream',
        origin: 'Seed',
        harvested: false
      },
      {
        id: 'plant_2',
        name: 'Test Plant 2',
        strain: 'OG Kush',
        origin: 'Clone',
        harvested: true
      }
    ]

    it('saves and retrieves plant data', () => {
      savePlantsData(mockPlants)
      const retrievedPlants = getPlantsData()
      
      expect(retrievedPlants).toEqual(mockPlants)
    })

    it('returns empty array when no plants exist', () => {
      const plants = getPlantsData()
      expect(plants).toEqual([])
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('phenoHunter_plants', 'invalid json')
      const plants = getPlantsData()
      expect(plants).toEqual([])
    })
  })

  describe('Authentication Data Management', () => {
    const mockAuthData = {
      user: {
        username: 'testuser',
        email: 'test@example.com'
      },
      token: 'mock-jwt-token',
      timestamp: Date.now()
    }

    it('saves and retrieves auth data', () => {
      saveAuthData(mockAuthData)
      const retrievedAuth = getAuthData()
      
      expect(retrievedAuth).toEqual(mockAuthData)
    })

    it('returns null when no auth data exists', () => {
      const authData = getAuthData()
      expect(authData).toBeNull()
    })

    it('clears auth data', () => {
      saveAuthData(mockAuthData)
      expect(getAuthData()).toEqual(mockAuthData)
      
      clearAuthData()
      expect(getAuthData()).toBeNull()
    })

    it('handles corrupted auth data gracefully', () => {
      localStorage.setItem('phenoHunter_auth', 'invalid json')
      const authData = getAuthData()
      expect(authData).toBeNull()
    })
  })

  describe('convertImageToBase64', () => {
    it('converts file to base64 string', async () => {
      // Create a mock file
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        result: 'data:image/jpeg;base64,dGVzdCBjb250ZW50'
      }
      
      global.FileReader = vi.fn(() => mockFileReader)

      const promise = convertImageToBase64(mockFile)
      
      // Simulate successful file read
      mockFileReader.onload()
      
      const result = await promise
      expect(result).toBe('data:image/jpeg;base64,dGVzdCBjb250ZW50')
    })

    it('handles file read errors', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null,
        onerror: null,
        error: new Error('File read failed')
      }
      
      global.FileReader = vi.fn(() => mockFileReader)

      const promise = convertImageToBase64(mockFile)
      
      // Simulate file read error
      mockFileReader.onerror()
      
      await expect(promise).rejects.toThrow('File read failed')
    })
  })
})
