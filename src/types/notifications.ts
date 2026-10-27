import type { NotificationPlacement } from 'antd/es/notification/interface';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  placement?: NotificationPlacement;
}

export interface UserSettings {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  notificationSound: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}