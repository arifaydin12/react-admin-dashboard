import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Menu, 
  Typography, 
  Button, 
  Space, 
  Badge, 
  Tooltip, 
  notification,
  Input,
  Drawer,
  Modal,
  Switch,
  Form,
  Dropdown,
  Avatar
} from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  BulbOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { useWindowSize, useKeyPress } from '../utils/hooks';
import { formatDate } from '../utils/helpers';
import type { MenuProps } from 'antd';
import type { Notification, UserSettings } from '../types/notifications';
import { defaultSettings } from '../config/settings';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/sales':
      return 'Satışlar';
    case '/products':
      return 'Ürünler';
    case '/regions':
      return 'Bölgeler';
    default:
      return 'Dashboard';
  }
};

const MainLayout = () => {
  const navigate = useNavigate();
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    toggleTheme,
    refreshData,
    lastUpdate
  } = useDashboard();
  
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState(getPageTitle(location.pathname));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const { width } = useWindowSize();

  // Bildirim yönetimi
  const showNotification = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    if (userSettings.notifications) {
      notification[type]({
        message: title,
        description: message
      });
    }
  };

  // Sayfa başlığını güncelle
  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location]);

  // Sayfa yenileme işlemi
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Responsive davranış
  useEffect(() => {
    const autoCollapse = () => {
      if (width <= 768 && !sidebarCollapsed) {
        toggleSidebar();
      }
    };
    autoCollapse();
  }, [width, sidebarCollapsed, toggleSidebar]);

  // Tam ekran yönetimi
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Arama işlemi
  const handleSearch = (value: string) => {
    setSearchText(value);
    // Arama işlemi burada yapılacak
    showNotification('info', 'Arama', `Aranan: ${value}`);
  };

  // Bildirim işlemleri
  const handleNotificationClick = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleReadAllNotifications = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Ayarlar işlemleri
  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Kullanıcı menüsü işlemleri
  const userMenuItems = useMemo(() => [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış'
    }
  ] as MenuProps['items'], []);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'settings':
        setSettingsModalOpen(true);
        break;
      case 'logout':
        navigate('/login');
        break;
    }
  };

  // Klavye kısayolları
  useKeyPress('b', toggleSidebar); // Sidebar toggle
  useKeyPress('t', toggleTheme); // Tema toggle
  useKeyPress('r', handleRefresh); // Sayfa yenileme
  useKeyPress('/', () => setSearchVisible(true)); // Arama
  useKeyPress('f', toggleFullscreen); // Tam ekran
  useKeyPress('Escape', () => {
    if (searchVisible) setSearchVisible(false);
  });

  // Sayfa başlığını güncelle
  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location]);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/sales">Satışlar</Link>,
    },
    {
      key: '/products',
      icon: <BarChartOutlined />,
      label: <Link to="/products">Ürünler</Link>,
    },
    {
      key: '/regions',
      icon: <GlobalOutlined />,
      label: <Link to="/regions">Bölgeler</Link>,
    },
  ];

  return (
    <Layout>
      <Sider 
        collapsible 
        collapsed={sidebarCollapsed} 
        onCollapse={toggleSidebar}
        breakpoint="lg"
        collapsedWidth="80"
      >
        <div className="logo">
          {!sidebarCollapsed ? 'Sales Dashboard' : 'SD'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {React.createElement(
              sidebarCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: 'trigger',
                onClick: toggleSidebar,
                style: { fontSize: '18px' }
              }
            )}
            <Title level={4} style={{ margin: 0 }}>{pageTitle}</Title>
          </div>
          <Space size="middle">
            {searchVisible && (
              <Input
                placeholder="Arama yapın... (/)"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                value={searchText}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
            )}
            <Tooltip title="Yenile (R)">
              <Button
                icon={<ReloadOutlined spin={isRefreshing} />}
                onClick={handleRefresh}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Tema Değiştir (T)">
              <Button
                icon={<BulbOutlined />}
                onClick={toggleTheme}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Tam Ekran (F)">
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
                type="text"
              />
            </Tooltip>
            <Tooltip title="Bildirimler">
              <Badge count={notifications.filter(n => !n.read).length}>
                <Button
                  icon={<BellOutlined />}
                  onClick={() => setNotificationDrawerOpen(true)}
                  type="text"
                />
              </Badge>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }}>
              <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
            {lastUpdate && (
              <Tooltip title="Son Güncelleme">
                <Badge status="processing" text={formatDate(lastUpdate, 'short')} />
              </Tooltip>
            )}
          </Space>
        </Header>
        <Content style={{ 
          margin: '24px',
          minHeight: 280,
          borderRadius: '8px',
          background: '#f0f2f5',
          padding: '24px',
          height: 'calc(100vh - 112px)',
          overflow: 'auto'
        }}>
          <div className="fade-in" style={{ height: '100%' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* Bildirim Drawer'ı */}
      <Drawer
        title="Bildirimler"
        placement="right"
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        extra={
          <Button type="link" onClick={handleReadAllNotifications}>
            Tümünü Okundu İşaretle
          </Button>
        }
      >
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Bildirim bulunmuyor
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: notification.read ? '#f5f5f5' : '#fff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <small>{formatDate(notification.timestamp)}</small>
            </div>
          ))
        )}
      </Drawer>

      {/* Ayarlar Modal'ı */}
      <Modal
        title="Ayarlar"
        open={settingsModalOpen}
        onOk={() => setSettingsModalOpen(false)}
        onCancel={() => setSettingsModalOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Bildirimler">
            <Switch
              checked={userSettings.notifications}
              onChange={checked => handleSettingChange('notifications', checked)}
            />
          </Form.Item>
          <Form.Item label="Bildirim Sesi">
            <Switch
              checked={userSettings.notificationSound}
              onChange={checked => handleSettingChange('notificationSound', checked)}
            />
          </Form.Item>
          <Form.Item label="Otomatik Yenileme">
            <Switch
              checked={userSettings.autoRefresh}
              onChange={checked => handleSettingChange('autoRefresh', checked)}
            />
          </Form.Item>
          <Form.Item label="Yenileme Aralığı (sn)">
            <Input
              type="number"
              value={userSettings.refreshInterval / 1000}
              onChange={e => handleSettingChange('refreshInterval', Number(e.target.value) * 1000)}
              min={5}
              max={3600}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;