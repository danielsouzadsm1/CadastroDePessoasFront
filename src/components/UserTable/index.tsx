import { Table, Button, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { User } from '@/hooks/useUsers';
import { FaRegTrashAlt, FaEdit } from 'react-icons/fa';
import dayjs from 'dayjs';

interface UserTablePagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

interface UserTableProps {
  data: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  pagination: UserTablePagination;
}

export const UserTable = ({ data, loading, onEdit, onDelete, pagination }: UserTableProps) => {
  const handleDelete = (user: User) => {
    if (typeof user.id !== 'number') {
      return;
    }

    onDelete(user.id);
  };

  const columns: TableColumnsType<User> = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      ellipsis: true,
      sorter: (a, b) =>
        String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'pt-BR', {
          sensitivity: 'base',
        }),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: { title: 'Ordenar por ordem alfabética' },
    },
    {
      title: 'Telefone',
      key: 'telefone',
      ellipsis: true,
      render: (_value, record) => record.telefones?.[0]?.numero ?? '-',
    },
    { 
      title: 'Idade', 
      dataIndex: 'data_nascimento', 
      key: 'idade',
      render: (text: string) => {
        if (!text) return '-';
        const idade = dayjs().diff(dayjs(text, 'YYYY-MM-DD'), 'year');
        return `${idade} anos`;
      }
    },
    {
      title: 'Gênero',
      dataIndex: 'genero',
      key: 'genero',
      width: 200,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 300,
      align: 'center',
      render: (_value, record) => (
        <Space size="small">
          <Button type="default" size="small" onClick={() => onEdit(record)} icon={<FaEdit size={14} />} />
          <Popconfirm title="Tem certeza que deseja excluir este usuário?" onConfirm={() => handleDelete(record) } okText="Sim" cancelText="Não">
            <Button danger size="small" icon={<FaRegTrashAlt size={14} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      bordered
      size="middle"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: false,
        onChange: pagination.onChange,
      }}
    />
  );
};