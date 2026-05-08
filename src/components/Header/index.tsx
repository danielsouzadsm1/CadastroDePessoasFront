import { Button, Input } from 'antd';
import styles from './index.module.scss';

interface HeaderProps {
  onAdd: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const Header = ({ onAdd, searchValue, onSearchChange }: HeaderProps) => (
  <div className={styles.wrapper}>
    <Input.Search
      className={styles.search}
      allowClear
      placeholder="Pesquisar por nome..."
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      size="middle"
    />
    <Button type="primary" size="large" onClick={onAdd}>
      Novo Usuário
    </Button>
  </div>
);