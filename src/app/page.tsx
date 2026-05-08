'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Select, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Header } from '@/components/Header';
import { UserTable } from '@/components/UserTable';
import { useUsers, type User } from '@/hooks/useUsers';
import styles from './page.module.scss';

type UserFormValues = {
  nome: string;
  data_nascimento: string;
  genero: string;
  telefones: { numero: string }[];
};

export default function Page() {
  const [form] = Form.useForm<UserFormValues>();
  const { users, loading, getUsers, getUserById, createUser, updateUser, deleteUser } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const normalizePhonesForForm = (phones?: User['telefones']) => {
    const normalized =
      phones
        ?.map((phone) => ({
          numero: String(phone?.numero ?? '').trim(),
        }))
        .filter((phone) => phone.numero.length > 0) ?? [];

    return normalized.length > 0 ? normalized : [{ numero: '' }];
  };


  const filteredUsers = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => user.nome.toLowerCase().includes(term));
  }, [users, searchValue]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ telefones: [{ numero: '' }] });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    
    form.resetFields();

    form.setFieldsValue({
      nome: user.nome,
      data_nascimento: user.data_nascimento,
      genero: user.genero,
      telefones: normalizePhonesForForm(user.telefones), 
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
  
      const success = editingUser?.id
        ? await updateUser(editingUser.id, values)
        : await createUser(values);

        closeModal();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };
  
  return (
    <section className={styles.container}>
      <div className={styles.panel}>
        <Header onAdd={openCreateModal} searchValue={searchValue} onSearchChange={setSearchValue} />

        <div className={styles.tableWrapper}>
          <UserTable data={filteredUsers} loading={loading} onEdit={openEditModal} onDelete={deleteUser} />
        </div>
      </div>
      {isModalOpen && (
        <Modal
        title={<h2 className={styles.modalTitle}>{editingUser ? 'Editar usuario' : 'Novo usuario'}</h2>}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingUser ? 'Salvar' : 'Criar'}
        cancelText="Cancelar"
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nome"
            name="nome"
            rules={[
              { required: true, message: 'Informe o nome' },
              { min: 2, message: 'Nome deve ter ao menos 2 caracteres' },
            ]}
          >
            <Input placeholder="Nome completo" maxLength={120} />
          </Form.Item>

          <Form.Item
            label="Data de nascimento"
            name="data_nascimento"
            getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
            normalize={(value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')}
            rules={[{ required: true, message: 'Informe a data de nascimento' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecione a data" />
          </Form.Item>

          <Form.Item label="Genero" name="genero" rules={[{ required: true, message: 'Informe o genero' }]}>
            <Select
              placeholder="Selecione"
              options={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Feminino', label: 'Feminino' },
                { value: 'Outro', label: 'Outro' },
              ]}
            />
          </Form.Item>

          <Form.List name="telefones">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => {
                  const { key, ...restField } = field;
                  const phoneLabel = fields.length > 1 ? 'Telefones' : 'Telefone';

                  return (
                  <Space key={key} align="start" style={{ display: 'flex' }}>
                    <Form.Item
                      {...restField}
                      label={index === 0 ? phoneLabel : ''}
                      name={[field.name, 'numero']}
                      rules={[
                        { required: true, message: 'Informe o telefone' },
                        {
                          validator: async (_, value) => {
                            const digits = String(value ?? '').replace(/\D/g, '');
                            if (digits.length < 10 || digits.length > 11) {
                              throw new Error('Telefone deve ter 10 ou 11 digitos');
                            }
                          },
                        },
                      ]}
                    >
                      <Input placeholder="(99) 99999-9999" maxLength={15} style={{ width: 260 }} />
                    </Form.Item>

                    {fields.length > 1 && (
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                        style={{ marginTop: index === 0 ? 30 : 0 }}
                      />
                    )}
                  </Space>
                  );
                })}

                <Form.Item>
                  <Button type="dashed" onClick={() => add({ numero: '' })} icon={<PlusOutlined />} block>
                    Adicionar telefone
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
      )}
    </section>
  );
}
