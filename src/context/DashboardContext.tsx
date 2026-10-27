import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../utils/hooks';

interface DashboardContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  layout: 'default' | 'compact' | 'wide';
  setLayout: (layout: 'default' | 'compact' | 'wide') => void;
  refreshData: () => void;
  isLoading: boolean;
  lastUpdate: Date | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sidebar durumu
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
  
  // Tema yönetimi
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  // Layout tercihi
  const [layout, setLayout] = useLocalStorage('layout', 'default');
  
  // Veri yenileme durumu
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Sidebar toggle fonksiyonu
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Tema toggle fonksiyonu
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Veri yenileme fonksiyonu
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Burada veri yenileme işlemleri yapılacak
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Veri yenileme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tema değişikliğini HTML'e uygula
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = {
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    layout,
    setLayout,
    refreshData,
    isLoading,
    lastUpdate,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};