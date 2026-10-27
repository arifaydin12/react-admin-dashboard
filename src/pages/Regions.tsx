import { Card, Row, Col } from 'antd';
import { Pie } from '@ant-design/charts';
import { mockRegionalSales } from '../data/mockData';
import StatCard from '../components/StatCard';

const Regions = () => {
  const pieConfig = {
    data: mockRegionalSales.map(item => ({
      type: item.region,
      value: item.sales,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  return (
    <div className="slide-up">
      <h1 className="page-title">Bölgesel Analiz</h1>
      
      <Row gutter={[16, 16]}>
        {mockRegionalSales.map(region => (
          <Col xs={24} sm={12} md={8} key={region.region}>
            <StatCard
              className="stat-card"
              title={`${region.region} Bölgesi`}
              value={region.sales}
              precision={2}
              prefix="₺"
              suffix={` (${region.orders} sipariş)`}
            />
          </Col>
        ))}
      </Row>

      <Card className="chart-container" style={{ marginTop: 24 }}>
        <h2>Bölgesel Satış Dağılımı</h2>
        <div style={{ height: 400 }}>
          <Pie {...pieConfig} />
        </div>
      </Card>
    </div>
  );
};

export default Regions;