import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { SearchOutlined, ShoppingOutlined, TagOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Input, Modal, type InputRef } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { NAV_ITEMS } from '../layout/navigation'
import { formatCurrency } from '../lib/format'
import { searchOrders, searchProducts } from '../lib/search'

export interface PaletteAction {
  id: string
  label: string
  keywords?: string
  icon?: ReactNode
  run: () => void
}

type Group = 'Pages' | 'Actions' | 'Orders' | 'Products'

interface Entry {
  id: string
  group: Group
  label: string
  hint?: string
  icon: ReactNode
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  actions: readonly PaletteAction[]
}

/** Ctrl/Cmd + K command palette: navigation, actions and order / product search. */
export default function CommandPalette({ open, onClose, actions }: CommandPaletteProps) {
  const inputRef = useRef<InputRef>(null)
  return (
    <Modal
      open={open}
      onCancel={onClose}
      // The modal moves focus to its own container when it opens; hand it back to the search field.
      afterOpenChange={(visible) => {
        if (visible) inputRef.current?.focus()
      }}
      footer={null}
      closable={false}
      destroyOnHidden
      width={620}
      style={{ top: '12vh' }}
      className="palette-modal"
      aria-label="Command palette"
    >
      <PaletteBody onClose={onClose} actions={actions} inputRef={inputRef} />
    </Modal>
  )
}

interface PaletteBodyProps {
  onClose: () => void
  actions: readonly PaletteAction[]
  inputRef: RefObject<InputRef | null>
}

function PaletteBody({ onClose, actions, inputRef }: PaletteBodyProps) {
  const navigate = useNavigate()
  const { orders, products } = useData()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const entries = useMemo<Entry[]>(() => {
    const needle = query.trim().toLowerCase()
    const matches = (text: string) => !needle || text.toLowerCase().includes(needle)
    const go = (path: string) => () => navigate(path)

    const list: Entry[] = []
    for (const item of NAV_ITEMS) {
      if (matches(`${item.label} go to page`)) {
        list.push({ id: `page-${item.path}`, group: 'Pages', label: item.label, hint: 'Go to page', icon: item.icon, run: go(item.path) })
      }
    }
    for (const action of actions) {
      if (matches(`${action.label} ${action.keywords ?? ''}`)) {
        list.push({
          id: `action-${action.id}`,
          group: 'Actions',
          label: action.label,
          icon: action.icon ?? <ThunderboltOutlined />,
          run: action.run,
        })
      }
    }
    for (const order of searchOrders(orders, query)) {
      list.push({
        id: `order-${order.id}`,
        group: 'Orders',
        label: `${order.id} · ${order.customer}`,
        hint: `${order.product} · ${formatCurrency(order.amount)}`,
        icon: <ShoppingOutlined />,
        run: go(`/sales?order=${encodeURIComponent(order.id)}`),
      })
    }
    for (const product of searchProducts(products, query)) {
      list.push({
        id: `product-${product.id}`,
        group: 'Products',
        label: product.name,
        hint: `${product.category} · see orders`,
        icon: <TagOutlined />,
        run: go(`/sales?q=${encodeURIComponent(product.name)}`),
      })
    }
    return list
  }, [query, actions, orders, products, navigate])

  const activeIndex = Math.min(active, Math.max(0, entries.length - 1))
  const activeId = entries[activeIndex] ? `palette-option-${entries[activeIndex].id}` : undefined

  // The surrounding modal moves focus to itself after mounting; reclaim it for the field.
  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [inputRef])

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId])

  const choose = (entry: Entry | undefined) => {
    if (!entry) return
    onClose()
    entry.run()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((activeIndex + 1) % Math.max(1, entries.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((activeIndex - 1 + entries.length) % Math.max(1, entries.length))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(Math.max(0, entries.length - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(entries[activeIndex])
    }
  }

  let previousGroup: Group | null = null

  return (
    <div className="palette">
      <Input
        ref={inputRef}
        autoFocus
        size="large"
        variant="borderless"
        className="palette__input"
        prefix={<SearchOutlined />}
        placeholder="Search orders, products, pages and actions…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-label="Search"
        aria-expanded="true"
        aria-controls="palette-listbox"
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        allowClear
      />
      <ul id="palette-listbox" role="listbox" aria-label="Results" className="palette__list">
        {entries.length === 0 ? (
          <li className="palette__empty" role="presentation">
            No results for “{query.trim()}”
          </li>
        ) : null}
        {entries.map((entry, index) => {
          const heading = entry.group !== previousGroup ? entry.group : null
          previousGroup = entry.group
          return (
            <li key={entry.id} role="presentation">
              {heading ? <div className="palette__group">{heading}</div> : null}
              <div
                id={`palette-option-${entry.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`palette__item${index === activeIndex ? ' palette__item--active' : ''}`}
                onMouseMove={() => setActive(index)}
                onClick={() => choose(entry)}
              >
                <span className="palette__icon" aria-hidden="true">
                  {entry.icon}
                </span>
                <span className="palette__label">{entry.label}</span>
                {entry.hint ? <span className="palette__hint">{entry.hint}</span> : null}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="palette__footer" aria-hidden="true">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> navigate
        </span>
        <span>
          <kbd>Enter</kbd> select
        </span>
        <span>
          <kbd>Esc</kbd> close
        </span>
      </div>
    </div>
  )
}
