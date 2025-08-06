import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Auth
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'

// Components
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Dashboard from './components/Dashboard'
import PlantForm from './components/plants/PlantForm'
import PlantsList from './components/plants/PlantsList'
import PlantDetail from './components/plants/PlantDetail'
import NotFound from './components/NotFound'
import AuthDebug from './components/AuthDebug'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/plant" 
              element={
                <ProtectedRoute>
                  <PlantForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/plants" 
              element={
                <ProtectedRoute>
                  <PlantsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/plants/:id" 
              element={
                <ProtectedRoute>
                  <PlantDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AuthDebug />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
