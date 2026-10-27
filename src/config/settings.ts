import type { UserSettings } from '../types/notifications';

export const defaultSettings: UserSettings = {
  notifications: true,
  theme: 'light',
  language: 'tr',
  timezone: 'Europe/Istanbul',
  dateFormat: 'DD.MM.YYYY HH:mm',
  notificationSound: true,
  autoRefresh: false,
  refreshInterval: 300000  // 5 dakika
};