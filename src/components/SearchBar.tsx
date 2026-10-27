import React from 'react';
import { Input, Button } from 'antd';
interface SearchBarProps {
  visible: boolean;
  onSearch: (value: string) => void;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ visible, onSearch, onClose }) => {
  if (!visible) return null;

  return (
    <div className="global-search-wrapper">
      <Input
        autoFocus
        placeholder="Arama yapın..."
        suffix={<Button type="text" onClick={onClose}>ESC</Button>}
        onPressEnter={(e) => onSearch((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};

export default SearchBar;