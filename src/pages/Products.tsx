import { Card, Table, Tag } from 'antd';
import { Column } from '@ant-design/charts';
import { mockTopProducts, mockSales } from '../data/mockData';

const Products = () => {
  // Kategoriye göre ürün satışlarını hesapla
  const categoryData = mockSales.reduce((acc, sale) => {
    const category = acc.find(item => item.category === sale.category);
    if (category) {
      category.sales += sale.amount;
      category.quantity += sale.quantity;
    } else {
      acc.push({
        category: sale.category,
        sales: sale.amount,
        quantity: sale.quantity,
      });
    }
    return acc;
  }, [] as { category: string; sales: number; quantity: number }[]);

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Toplam Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `₺${revenue.toFixed(2)}`,
      sorter: (a: any, b: any) => a.revenue - b.revenue,
    },
    {
      title: 'Satış Adedi',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: any, b: any) => a.quantity - b.quantity,
    },
  ];

  const categoryChartConfig = {
    data: categoryData,
    xField: 'category',
    yField: 'sales',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      category: { alias: 'Kategori' },
      sales: { alias: 'Satış' },
    },
  };

  return (
    <div className="slide-up">
      <h1 className="page-title">Ürün Analizi</h1>
      
      <Card className="chart-container" style={{ marginBottom: 24 }}>
        <h2>Kategori Bazında Satışlar</h2>
        <Column {...categoryChartConfig} />
      </Card>

      <Card className="chart-container">
        <h2>En Çok Satan Ürünler</h2>
        <Table
          dataSource={mockTopProducts}
          columns={columns}
          rowKey="product"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Products;