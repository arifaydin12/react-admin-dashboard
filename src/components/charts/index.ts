import { lazy } from 'react'

/**
 * Charts pull in the whole charting engine, so they are loaded on demand and
 * end up in a separate chunk instead of the entry bundle.
 */
export const TrendChart = lazy(() => import('./TrendChart'))
export const DonutChart = lazy(() => import('./DonutChart'))
export const BarChart = lazy(() => import('./BarChart'))
