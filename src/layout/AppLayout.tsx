import { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react'
import {
  BellOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Drawer, Grid, Layout, Menu, Result, Tooltip } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '../components/ErrorBoundary'
import type { PaletteAction } from '../components/CommandPalette'
import { useData } from '../context/DataContext'
import { PRESETS, useDateRange } from '../context/FilterContext'
import { useNotifications } from '../context/NotificationContext'
import { useSettings } from '../context/SettingsContext'
import { useTheme } from '../context/ThemeContext'
import { useModHotkey } from '../hooks/useHotkey'
import { MOD_KEY_LABEL } from '../lib/platform'
import { readStorage, writeStorage } from '../lib/storage'
import PageSkeleton from './PageSkeleton'
import { NAV_ITEMS } from './navigation'

const { Header, Sider, Content } = Layout

// Overlays are closed on first paint, so their code is fetched on first use.
const CommandPalette = lazy(() => import('../components/CommandPalette'))
const NotificationDrawer = lazy(() => import('../components/NotificationDrawer'))
const SettingsModal = lazy(() => import('../components/SettingsModal'))

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Pulse - Dashboard">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={28} height={28} />
      {collapsed ? null : <span className="brand__name">Pulse</span>}
    </Link>
  )
}

/** Turns true the first time `value` is true and stays true afterwards. */
function useEverTrue(value: boolean): boolean {
  const [seen, setSeen] = useState(value)
  if (value && !seen) setSeen(true)
  return seen
}

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return letters || 'U'
}

export default function AppLayout() {
  const screens = Grid.useBreakpoint()
  const isMobile = screens.lg === false
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  const { mode, toggle: toggleTheme } = useTheme()
  const { settings } = useSettings()
  const { status, error, reload } = useData()
  const { setPreset } = useDateRange()
  const { unreadCount } = useNotifications()

  const [collapsed, setCollapsed] = useState(() => readStorage('sidebar.collapsed', false))
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Mount each overlay on first open and keep it mounted so it can animate out.
  const paletteSeen = useEverTrue(paletteOpen)
  const notificationsSeen = useEverTrue(notificationsOpen)
  const settingsSeen = useEverTrue(settingsOpen)

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const togglePalette = useCallback(() => setPaletteOpen((open) => !open), [])
  useModHotkey('k', togglePalette)

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      writeStorage('sidebar.collapsed', !current)
      return !current
    })
  }

  const paletteActions = useMemo<PaletteAction[]>(
    () => [
      {
        id: 'theme',
        label: mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        keywords: 'appearance mode',
        icon: mode === 'dark' ? <SunOutlined /> : <MoonOutlined />,
        run: toggleTheme,
      },
      { id: 'notifications', label: 'Open notifications', icon: <BellOutlined />, run: () => setNotificationsOpen(true) },
      { id: 'settings', label: 'Open settings', keywords: 'preferences', icon: <SettingOutlined />, run: () => setSettingsOpen(true) },
      ...PRESETS.filter((p) => p.key !== '180d').map((p) => ({
        id: `range-${p.key}`,
        label: `Date range: ${p.label}`,
        keywords: 'period filter',
        icon: <CalendarOutlined />,
        run: () => setPreset(p.key),
      })),
      { id: 'reload', label: 'Reload data', keywords: 'refresh', icon: <ReloadOutlined />, run: reload },
    ],
    [mode, toggleTheme, setPreset, reload],
  )

  const selectedKey =
    NAV_ITEMS.find((item) => (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)))
      ?.path ?? ''

  const menuItems = NAV_ITEMS.map((item) => ({
    key: item.path,
    icon: item.icon,
    label: (
      <Link to={item.path} onClick={() => setMenuOpen(false)}>
        {item.label}
      </Link>
    ),
  }))

  return (
    <Layout className="app-shell">
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus()}>
        Skip to main content
      </button>

      {isMobile ? (
        <Drawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          placement="left"
          width={260}
          title={<Brand collapsed={false} />}
          styles={{ body: { padding: 8 } }}
        >
          <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} aria-label="Main navigation" />
        </Drawer>
      ) : (
        <Sider
          className="app-sider"
          width={232}
          collapsedWidth={72}
          collapsed={collapsed}
          trigger={null}
          theme={mode}
        >
          <div className="app-sider__brand">
            <Brand collapsed={collapsed} />
          </div>
          <nav aria-label="Main navigation">
            <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} theme={mode} />
          </nav>
        </Sider>
      )}

      <Layout>
        <Header className="app-header">
          {isMobile ? (
            <Button type="text" icon={<MenuOutlined />} aria-label="Open navigation menu" onClick={() => setMenuOpen(true)} />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={toggleCollapsed}
            />
          )}

          <button type="button" className="search-trigger" onClick={openPalette} aria-label="Open search (command palette)">
            <SearchOutlined aria-hidden="true" />
            <span className="search-trigger__text">Search orders, products…</span>
            <kbd className="search-trigger__kbd" aria-hidden="true">
              {MOD_KEY_LABEL} K
            </kbd>
          </button>

          <div className="app-header__actions">
            <Tooltip title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              <Button
                type="text"
                shape="circle"
                icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                onClick={toggleTheme}
              />
            </Tooltip>
            <Badge count={unreadCount} size="small" offset={[-4, 4]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined />}
                aria-label={`Notifications, ${unreadCount} unread`}
                onClick={() => setNotificationsOpen(true)}
              />
            </Badge>
            <Button
              type="text"
              className="user-button"
              onClick={() => setSettingsOpen(true)}
              aria-label={`Settings for ${settings.displayName}`}
            >
              <Avatar size={28} style={{ background: 'var(--color-primary)' }}>
                {initials(settings.displayName)}
              </Avatar>
              {screens.md ? <span className="user-button__name">{settings.displayName}</span> : null}
            </Button>
          </div>
        </Header>

        <Content id="main-content" className="app-main" ref={mainRef} tabIndex={-1}>
          <div className="app-main__inner">
            {status === 'error' ? (
              <Result
                status="error"
                title="Could not load the data"
                subTitle={error?.message}
                extra={
                  <Button type="primary" onClick={reload}>
                    Try again
                  </Button>
                }
              />
            ) : (
              <ErrorBoundary resetKey={location.pathname}>
                <Suspense fallback={<PageSkeleton />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </Content>
      </Layout>

      <Suspense fallback={null}>
        {paletteSeen ? (
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />
        ) : null}
        {notificationsSeen ? (
          <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        ) : null}
        {settingsSeen ? <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} /> : null}
      </Suspense>
    </Layout>
  )
}
