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
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard'
import ReportGenerator from './components/reports/ReportGenerator'
import PredictiveAnalytics from './components/predictions/PredictiveAnalytics'
import NotFound from './components/NotFound'
import SessionWarning from './components/SessionWarning'
import SessionStatus from './components/SessionStatus'
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserList from './admin/UserList';
import UserDetail from './admin/UserDetail';

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
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <ReportGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predictions" 
              element={
                <ProtectedRoute>
                  <PredictiveAnalytics />
                </ProtectedRoute>
              } 
            />
              {/* Admin routes - RBAC protected */}
              <Route path="/admin" element={<ProtectedAdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserList />} />
                  <Route path="users/:id" element={<UserDetail />} />
                </Route>
              </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Session Warning Modal - Shows globally when session is about to expire */}
          <SessionWarning />
          
          {/* Debug: Session Status - Remove in production */}
          <SessionStatus />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
