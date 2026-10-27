import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

// jsdom does not implement these browser APIs that Ant Design relies on.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

Element.prototype.scrollIntoView = vi.fn()

// Ant Design asks for pseudo-element styles, which jsdom does not implement
// and reports as noisy "not implemented" errors. Ignore the second argument.
const nativeGetComputedStyle = window.getComputedStyle.bind(window)
window.getComputedStyle = ((element: Element) => nativeGetComputedStyle(element)) as typeof window.getComputedStyle
