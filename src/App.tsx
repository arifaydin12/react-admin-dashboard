import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import trTR from 'antd/locale/tr_TR';
import MainLayout from './layouts/MainLayout';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import 'antd/dist/reset.css';
import './styles/app.css';
import './styles/animations.css';

// Pages
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Products from './pages/Products';
import Regions from './pages/Regions';

const { defaultAlgorithm, darkAlgorithm } = theme;

const AppContent = () => {
  const { theme } = useDashboard();
  
  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          wireframe: false,
        },
      }}
    >
      <AntApp>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="products" element={<Products />} />
              <Route path="regions" element={<Regions />} />
            </Route>
          </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

export default App
