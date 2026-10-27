import React from 'react';
import { Modal, Form, Switch, Select, Button } from 'antd';

interface UserSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: {
    theme: 'light' | 'dark';
    compactMode: boolean;
    notifications: boolean;
    language: 'tr' | 'en';
  };
  onSettingsChange: (newSettings: any) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSettingsChange(values);
      onClose();
    });
  };

  return (
    <Modal
      title="Kullanıcı Ayarları"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          İptal
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Kaydet
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
      >
        <Form.Item
          name="theme"
          label="Tema"
        >
          <Select>
            <Select.Option value="light">Açık</Select.Option>
            <Select.Option value="dark">Koyu</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="compactMode"
          label="Kompakt Mod"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notifications"
          label="Bildirimler"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="language"
          label="Dil"
        >
          <Select>
            <Select.Option value="tr">Türkçe</Select.Option>
            <Select.Option value="en">English</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserSettingsModal;