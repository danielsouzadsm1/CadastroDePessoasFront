import { useState, useCallback } from 'react';
import api from '@/services/api';
import { message } from 'antd';
import { isAxiosError } from 'axios';

export interface Telefone {
  id?: number;
  numero: string;
}
export interface User {
  id?: number;
  nome: string;
  data_nascimento: string;
  genero: string;
  telefones?: Telefone[];
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getApiErrorMessage = (fallbackMessage: string, error: unknown) => {
    if (isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }

      const status = error.response?.status;
      if (status === 404) return 'Registro não encontrado';
      if (status === 422) return 'Dados inválidos. Verifique os campos';
      if (status && status >= 500) return 'Erro interno do servidor';
    }

    return fallbackMessage;
  };

  const getUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/user');
      setUsers(response.data.data);
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao buscar usuários', error));
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (userData: User) => {
    try {
      await api.post('/user', userData);
      message.success('Usuário criado com sucesso!');
      getUsers();
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao criar usuário', error));
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      await api.put(`/user/${id}`, userData);
      message.success('Usuário atualizado!');
      getUsers();
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao atualizar usuário', error));
    }
  };

  const getUserById = async (id: number) => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data.data as User;
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao buscar usuario para edicao', error));
      return null;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/user/${id}`);
      message.success('Usuário removido!');
      getUsers();
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao deletar usuário', error));
    }
  };

  return {
    users,
    loading,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};