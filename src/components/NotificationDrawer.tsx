import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons'
import { Button, Drawer, Empty, Space } from 'antd'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { formatRelativeTime } from '../lib/format'
import type { NotificationLevel } from '../lib/insights'

const LEVEL_ICON: Record<NotificationLevel, ReactNode> = {
  success: <CheckCircleFilled style={{ color: 'var(--color-success)' }} />,
  warning: <ExclamationCircleFilled style={{ color: 'var(--color-warning)' }} />,
  error: <CloseCircleFilled style={{ color: 'var(--color-danger)' }} />,
  info: <InfoCircleFilled style={{ color: 'var(--color-primary)' }} />,
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

/** Notification centre: read / unread state, dismissal and deep links. */
export default function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { items, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications()
  const navigate = useNavigate()

  const openItem = (id: string, href?: string) => {
    markRead(id)
    if (href) {
      onClose()
      navigate(href)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="min(420px, 100vw)"
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
      extra={
        <Space>
          <Button size="small" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
          <Button size="small" onClick={clearAll} disabled={items.length === 0}>
            Clear all
          </Button>
        </Space>
      }
    >
      {items.length === 0 ? (
        <Empty description="You are all caught up" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ul className="notification-list" aria-label="Notifications">
          {items.map((item) => (
            <li key={item.id} className={`notification${item.read ? '' : ' notification--unread'}`}>
              <span className="notification__icon" aria-hidden="true">
                {LEVEL_ICON[item.level]}
              </span>
              <button type="button" className="notification__body" onClick={() => openItem(item.id, item.href)}>
                <span className="notification__title">
                  {item.read ? null : <span className="visually-hidden">Unread: </span>}
                  {item.title}
                </span>
                <span className="notification__text">{item.description}</span>
                <span className="notification__time">{formatRelativeTime(item.createdAt)}</span>
              </button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                aria-label={`Dismiss: ${item.title}`}
                onClick={() => dismiss(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
