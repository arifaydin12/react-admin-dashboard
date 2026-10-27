import { Button, Form, Input, Modal, Radio, Switch } from 'antd'
import { useSettings, type Settings } from '../context/SettingsContext'
import { useTheme } from '../context/ThemeContext'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

/** Preferences that are persisted in localStorage and applied app-wide. */
export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, update, reset } = useSettings()
  const { mode, setMode } = useTheme()

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Settings"
      footer={
        <>
          <Button
            onClick={() => {
              reset()
              setMode('light')
            }}
          >
            Reset to defaults
          </Button>
          <Button type="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
      destroyOnHidden
    >
      <Form layout="vertical" requiredMark={false} className="settings-form">
        <Form.Item label="Display name" htmlFor="settings-name">
          <Input
            id="settings-name"
            value={settings.displayName}
            maxLength={40}
            onChange={(e) => update({ displayName: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Theme">
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value as 'light' | 'dark')}
            optionType="button"
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Rows per page in the sales table">
          <Radio.Group
            value={settings.pageSize}
            onChange={(e) => update({ pageSize: e.target.value as Settings['pageSize'] })}
            optionType="button"
            options={[10, 20, 50].map((n) => ({ label: String(n), value: n }))}
          />
        </Form.Item>
        <Form.Item label="Compact numbers (e.g. $12.4K)" className="settings-switch">
          <Switch
            aria-label="Compact numbers"
            checked={settings.compactNumbers}
            onChange={(compactNumbers) => update({ compactNumbers })}
          />
        </Form.Item>
        <Form.Item label="Animate charts" className="settings-switch">
          <Switch
            aria-label="Animate charts"
            checked={settings.animations}
            onChange={(animations) => update({ animations })}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
