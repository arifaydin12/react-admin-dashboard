import { lazy, type ReactNode } from 'react'
import { App as AntApp, ConfigProvider, theme as antdTheme } from 'antd'
import enUS from 'antd/locale/en_US'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { DataProvider, useData } from './context/DataContext'
import { FilterProvider } from './context/FilterContext'
import { NotificationProvider } from './context/NotificationContext'
import { SettingsProvider } from './context/SettingsContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import AppLayout from './layout/AppLayout'

// Route-level code splitting: every page is its own chunk.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Sales = lazy(() => import('./pages/Sales'))
const Products = lazy(() => import('./pages/Products'))
const Regions = lazy(() => import('./pages/Regions'))
const NotFound = lazy(() => import('./pages/NotFound'))

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"

function AntdProvider({ children }: { children: ReactNode }) {
  const { mode } = useTheme()
  const dark = mode === 'dark'
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          colorInfo: '#4f46e5',
          borderRadius: 8,
          fontFamily: FONT_STACK,
          colorBgLayout: dark ? '#0d0e12' : '#f4f5f9',
          colorBgContainer: dark ? '#16171d' : '#ffffff',
          colorBgElevated: dark ? '#1c1d25' : '#ffffff',
          colorBorderSecondary: dark ? '#262832' : '#eceef4',
        },
        components: {
          Layout: { headerBg: dark ? '#16171d' : '#ffffff', siderBg: dark ? '#16171d' : '#ffffff' },
          Menu: { itemBg: 'transparent', darkItemBg: 'transparent' },
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}

/** Connects the date range to the data set (its "today" anchors the presets). */
function FilterBridge({ children }: { children: ReactNode }) {
  const { today } = useData()
  return <FilterProvider today={today}>{children}</FilterProvider>
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <AntdProvider>
            <DataProvider>
              <FilterBridge>
                <NotificationProvider>
                  {/* HashRouter keeps the app working on static hosts such as GitHub Pages. */}
                  <HashRouter>
                    <Routes>
                      <Route element={<AppLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="products" element={<Products />} />
                        <Route path="regions" element={<Regions />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </HashRouter>
                </NotificationProvider>
              </FilterBridge>
            </DataProvider>
          </AntdProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
