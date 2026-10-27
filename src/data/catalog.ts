import type { Product } from '../types'

/** Static product catalogue used by the mock data generator and the UI. */
export const PRODUCTS: readonly Product[] = [
  { id: 'p-nimbus-14', name: 'Nimbus 14 Laptop', category: 'Laptops', price: 1299 },
  { id: 'p-atlas-16', name: 'Atlas Pro 16 Laptop', category: 'Laptops', price: 1899 },
  { id: 'p-breeze-13', name: 'Breeze Air 13 Laptop', category: 'Laptops', price: 999 },
  { id: 'p-pulse-x', name: 'Pulse X Phone', category: 'Phones', price: 899 },
  { id: 'p-orbit-mini', name: 'Orbit Mini Phone', category: 'Phones', price: 599 },
  { id: 'p-vertex-max', name: 'Vertex Max Phone', category: 'Phones', price: 1099 },
  { id: 'p-echo-buds', name: 'Echo Buds Pro', category: 'Audio', price: 199 },
  { id: 'p-studio-hp', name: 'Studio Over-Ear Headphones', category: 'Audio', price: 349 },
  { id: 'p-cube-speaker', name: 'Cube Smart Speaker', category: 'Audio', price: 129 },
  { id: 'p-fit-band', name: 'Fit Band 5', category: 'Wearables', price: 89 },
  { id: 'p-chrono-watch', name: 'Chrono Smartwatch', category: 'Wearables', price: 279 },
  { id: 'p-halo-ring', name: 'Halo Smart Ring', category: 'Wearables', price: 249 },
  { id: 'p-usbc-dock', name: 'USB-C Dock 8-in-1', category: 'Accessories', price: 119 },
  { id: 'p-charger-stand', name: 'Wireless Charger Stand', category: 'Accessories', price: 49 },
  { id: 'p-keyboard-k2', name: 'Mechanical Keyboard K2', category: 'Accessories', price: 139 },
  { id: 'p-mouse-m3', name: 'Ergo Mouse M3', category: 'Accessories', price: 79 },
]