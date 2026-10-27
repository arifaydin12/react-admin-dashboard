export interface Sale {
  id: string;
  product: string;
  amount: number;
  quantity: number;
  date: string;
  customer: string;
  region: string;
  category: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesGrowth: number;
}

export interface TopProduct {
  product: string;
  revenue: number;
  quantity: number;
  category: string;
}

export interface RegionalSales {
  region: string;
  sales: number;
  orders: number;
}