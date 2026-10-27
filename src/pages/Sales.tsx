import { useState } from 'react';
import { Table, Card, Row, Col, Select, Input } from 'antd';
import { mockSales } from '../data/mockData';
import type { Sale } from '../types';

const { Option } = Select;

const { Search } = Input;

const Sales = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  
  const filteredSales = mockSales.filter(sale => {
    const matchesStatus = !selectedStatus || sale.status === selectedStatus;
    const matchesSearch = !searchText || 
      sale.product.toLowerCase().includes(searchText.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: any = [
    {
      title: 'Ürün',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: Sale, b: Sale) => a.quantity - b.quantity,
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₺${amount.toFixed(2)}`,
      sorter: (a: Sale, b: Sale) => a.amount - b.amount,
    },
    {
      title: 'Müşteri',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Bölge',
      dataIndex: 'region',
      key: 'region',
      filters: [
        { text: 'Kuzey', value: 'North' },
        { text: 'Güney', value: 'South' },
        { text: 'Doğu', value: 'East' },
        { text: 'Batı', value: 'West' },
        { text: 'Merkez', value: 'Central' },
      ],
      onFilter: (value: string, record: Sale) => record.region === value,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          completed: 'green',
          pending: 'gold',
          cancelled: 'red',
        };
        return (
          <span style={{ color: colorMap[status] }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="slide-up">
      <h1 className="page-title">Satış Listesi</h1>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Select 
              style={{ width: '100%' }} 
              placeholder="Duruma Göre Filtrele"
              allowClear
              value={selectedStatus}
              onChange={value => setSelectedStatus(value)}
            >
              <Option value="completed">Tamamlandı</Option>
              <Option value="pending">Beklemede</Option>
              <Option value="cancelled">İptal</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Search
              placeholder="Ürün veya müşteri ara..."
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
        </Row>
        <Table
          dataSource={filteredSales}
          columns={columns}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} kayıt`
          }}
        />
      </Card>
    </div>
  );
};

export default Sales;