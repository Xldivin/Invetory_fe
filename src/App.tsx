import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
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
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'products':
        return <ProductManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'pos':
        return <POSSystem />;
      case 'warehouses':
        return <WarehouseManagement />;
      case 'shops':
        return <ShopManagement />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <Reports />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'taxes':
        return <TaxCalculations />;
      case 'incidents':
        return <IncidentReports />;
      case 'events':
        return <EventsNoticeBoard />;
      case 'chat':
        return <ChatSystem />;
      case 'logs':
        return <ActivityLogs />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
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
  );
}