import React from 'react';
import { Badge, Dropdown, List, Typography, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { formatDate } from '../utils/helpers';

interface NotificationCenterProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: Date;
  }>;
  onReadAll: () => void;
  onNotificationClick: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onReadAll,
  onNotificationClick,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationList = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Typography.Text strong>Bildirimler ({notifications.length})</Typography.Text>
        {unreadCount > 0 && (
          <Button type="link" onClick={onReadAll}>
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>
      <List
        className="notification-list"
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            className={`notification-item ${!item.read ? 'unread' : ''}`}
            onClick={() => onNotificationClick(item.id)}
          >
            <List.Item.Meta
              title={item.title}
              description={item.message}
            />
            <div className="notification-time">
              {formatDate(item.timestamp, 'short')}
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown overlay={notificationList} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} className="notification-badge">
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationCenter;