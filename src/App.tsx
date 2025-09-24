import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { POSSystem } from './components/POSSystem';
import { ProductManagement } from './components/ProductManagement';
import { SupplierManagement } from './components/SupplierManagement';
import { WarehouseManagement } from './components/WarehouseManagement';
import { ShopManagement } from './components/ShopManagement';
import { UserManagement } from './components/UserManagement';
import { Reports } from './components/Reports';
import { ExpenseManagement } from './components/ExpenseManagement';
import { TaxCalculations } from './components/TaxCalculations';
import { IncidentReports } from './components/IncidentReports';
import { EventsNoticeBoard } from './components/EventsNoticeBoard';
import { ChatSystem } from './components/ChatSystem';
import { ActivityLogs } from './components/ActivityLogs';
import { Settings } from './components/Settings';
import { Toaster } from 'sonner';

function AppContent() {
  return (
    <Routes>
      {/* Login route without layout */}
      <Route path="/login" element={<LoginForm />} />
      
      {/* Protected routes with layout */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute permission="dashboard.view">
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute permission="products.view">
            <Layout>
              <ProductManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute permission="suppliers.view">
            <Layout>
              <SupplierManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute permission="pos.view">
            <Layout>
              <POSSystem />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute permission="warehouses.view">
            <Layout>
              <WarehouseManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shops"
        element={
          <ProtectedRoute permission="shops.view">
            <Layout>
              <ShopManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute permission="users.view">
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute permission="reports.view">
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute permission="expenses.view">
            <Layout>
              <ExpenseManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/taxes"
        element={
          <ProtectedRoute permission="taxes.view">
            <Layout>
              <TaxCalculations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute permission="incidents.view">
            <Layout>
              <IncidentReports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute permission="events.view">
            <Layout>
              <EventsNoticeBoard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute permission="chat.view">
            <Layout>
              <ChatSystem />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute permission="logs.view">
            <Layout>
              <ActivityLogs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute permission="settings.view">
            <Layout>
              <Settings />
    </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <InventoryProvider>
            <div className="min-h-screen bg-background">
              <AppContent />
              <Toaster richColors position="top-right" />
            </div>
          </InventoryProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}