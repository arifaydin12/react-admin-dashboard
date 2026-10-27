import { faker } from '@faker-js/faker';
import type { Sale, SalesSummary, TopProduct, RegionalSales } from '../types';

const PRODUCTS = [
  'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Smart Watch', 
  'Camera', 'Speaker', 'Monitor', 'Keyboard', 'Mouse'
];

const CATEGORIES = [
  'Electronics', 'Accessories', 'Gaming', 'Audio', 'Computing'
];

const REGIONS = [
  'North', 'South', 'East', 'West', 'Central'
];

const PAYMENT_METHODS = [
  'Credit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Crypto'
];

export const generateSales = (count: number = 1000): Sale[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    product: faker.helpers.arrayElement(PRODUCTS),
    amount: parseFloat(faker.finance.amount({ min: 100, max: 2000 })),
    quantity: faker.number.int({ min: 1, max: 10 }),
    date: faker.date.recent({ days: 90 }).toISOString(),
    customer: faker.person.fullName(),
    region: faker.helpers.arrayElement(REGIONS),
    category: faker.helpers.arrayElement(CATEGORIES),
    paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
    status: faker.helpers.arrayElement(['completed', 'pending', 'cancelled'] as const),
  }));
};

export const generateSalesSummary = (sales: Sale[]): SalesSummary => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = sales.length;
  
  return {
    totalSales,
    totalOrders,
    averageOrderValue: totalSales / totalOrders,
    salesGrowth: faker.number.float({ min: -10, max: 30, fractionDigits: 1 }),
  };
};

export const generateTopProducts = (sales: Sale[]): TopProduct[] => {
  const productMap = new Map<string, TopProduct>();
  
  sales.forEach(sale => {
    const existing = productMap.get(sale.product) || {
      product: sale.product,
      revenue: 0,
      quantity: 0,
      category: sale.category,
    };
    
    existing.revenue += sale.amount;
    existing.quantity += sale.quantity;
    productMap.set(sale.product, existing);
  });
  
  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

export const generateRegionalSales = (sales: Sale[]): RegionalSales[] => {
  const regionMap = new Map<string, RegionalSales>();
  
  sales.forEach(sale => {
    const existing = regionMap.get(sale.region) || {
      region: sale.region,
      sales: 0,
      orders: 0,
    };
    
    existing.sales += sale.amount;
    existing.orders += 1;
    regionMap.set(sale.region, existing);
  });
  
  return Array.from(regionMap.values());
};

// Initial data generation
export const mockSales = generateSales();
export const mockSalesSummary = generateSalesSummary(mockSales);
export const mockTopProducts = generateTopProducts(mockSales);
export const mockRegionalSales = generateRegionalSales(mockSales);