import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Progress, theme, Avatar, Badge, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import "../styles/v5-styles.css";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const { token } = theme.useToken();
  const location = useLocation();

  // Sayfa yüklenme efekti
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    // Diğer menü öğeleri buraya eklenecek
  ];

  return (
    <Layout className="app-layout">
      <Sider 
        className="app-sider"
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`
        }}
      >
        <div className="logo">
          {collapsed ? 'D' : 'DASHBOARD'}
        </div>
        <Menu
          className="app-menu"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={menuItems}
          style={{
            background: 'transparent'
          }}
        />
      </Sider>
      
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="action-button"
            />
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              className="action-button"
              onClick={() => {/* Arama fonksiyonu */}}
            />
          </div>

          <div className="header-right">
            <Tooltip title="Bildirimler">
              <Badge count={notificationCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="action-button"
                  onClick={() => setNotificationCount(prev => Math.max(0, prev - 1))}
                />
              </Badge>
            </Tooltip>

            <Tooltip title="Ayarlar">
              <Button
                type="text"
                icon={<SettingOutlined />}
                className="action-button"
                onClick={() => {/* Ayarlar modal */}}
              />
            </Tooltip>

            <Avatar 
              style={{ cursor: 'pointer' }}
              icon={<UserOutlined />}
              onClick={() => {/* Profil dropdown */}}
            />

            <Tooltip title="Çıkış Yap">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                className="action-button"
                onClick={() => {/* Çıkış işlemi */}}
              />
            </Tooltip>
          </div>
        </Header>

        {pageLoading && (
          <div className="progress-bar">
            <Progress
              percent={100}
              showInfo={false}
              status="active"
              className="page-progress"
              strokeColor={token.colorPrimary}
            />
          </div>
        )}

        <Content className="app-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;