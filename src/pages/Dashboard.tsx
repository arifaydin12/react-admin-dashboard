import { Row, Col, Card, Typography } from 'antd';
import { Column } from '@ant-design/charts';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined
} from '@ant-design/icons';

import { mockSalesSummary, mockTopProducts } from '../data/mockData';

const { Title } = Typography;

const Dashboard = () => {
  // İstatistik kartları için veri hazırlığı
  const statCards = [
    {
      title: "Toplam Satış",
      value: mockSalesSummary.totalSales,
      prefix: "₺",
      precision: 2,
      icon: <DollarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      growth: mockSalesSummary.salesGrowth,
      color: '#1890ff'
    },
    {
      title: "Sipariş Sayısı",
      value: mockSalesSummary.totalOrders,
      icon: <ShoppingCartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: "Ortalama Sipariş",
      value: mockSalesSummary.averageOrderValue,
      prefix: "₺",
      precision: 2,
      icon: <ShoppingOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: "Büyüme",
      value: mockSalesSummary.salesGrowth,
      suffix: "%",
      precision: 1,
      icon: <RiseOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      color: '#fa8c16'
    }
  ];

  const columnConfig = {
    data: mockTopProducts,
    xField: 'product',
    yField: 'revenue',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontSize: 12,
        fontWeight: 500,
      },
    },
    meta: {
      product: { alias: 'Ürün' },
      revenue: { 
        alias: 'Gelir',
        formatter: (value: number) => `₺${value.toLocaleString('tr-TR')}`
      },
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1000,
      },
    },
    color: '#1890ff',
    columnStyle: {
      radius: [6, 6, 0, 0],
      shadowColor: 'rgba(0,0,0,0.05)',
      shadowBlur: 10,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Gelir',
        value: `₺${datum.revenue.toLocaleString('tr-TR')}`
      })
    },
    padding: [30, 30, 50, 50],
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
        autoEllipsis: true,
      },
    },
    yAxis: {
      label: {
        formatter: (value: string) => `₺${parseInt(value).toLocaleString('tr-TR')}`
      },
    },
  };


  return (
    <div className="dashboard-container fade-in">
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card bordered={false} bodyStyle={{ padding: '24px' }}>
            <div className="dashboard-header">
              <Title level={2} style={{ margin: 0 }}>Satış Takip Sistemi</Title>
              <div className="dashboard-date" style={{ 
                background: '#f5f5f5', 
                padding: '8px 16px', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666'
              }}>
                {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </Card>
        </Col>

        {/* İstatistik Kartları */}
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card 
              className="stat-card" 
              bordered={false}
              bodyStyle={{ padding: '20px' }}
            >
              <div className="stat-card-content">
                <div className="stat-card-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-title">{stat.title}</div>
                  <div className="stat-card-value">
                    {stat.prefix}{stat.value.toLocaleString('tr-TR', { 
                      minimumFractionDigits: stat.precision || 0,
                      maximumFractionDigits: stat.precision || 0
                    })}{stat.suffix}
                  </div>
                  {stat.growth !== undefined && (
                    <div className={`stat-card-growth ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
                      {stat.growth >= 0 ? '↑' : '↓'} {Math.abs(stat.growth)}%
                      <span className="growth-label">geçen aya göre</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}

        {/* Grafik Bölümü */}
        <Col span={24}>
          <Card 
            className="chart-card"
            bordered={false}
            title={<Title level={4}>En Çok Satan Ürünler</Title>}
          >
            <div className="chart-container">
              <Column {...columnConfig} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;