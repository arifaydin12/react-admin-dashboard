import { AppstoreOutlined, DashboardOutlined, GlobalOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

export interface NavItem {
  path: string
  label: string
  icon: ReactNode
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
  { path: '/sales', label: 'Sales', icon: <ShoppingCartOutlined /> },
  { path: '/products', label: 'Products', icon: <AppstoreOutlined /> },
  { path: '/regions', label: 'Regions', icon: <GlobalOutlined /> },
]
