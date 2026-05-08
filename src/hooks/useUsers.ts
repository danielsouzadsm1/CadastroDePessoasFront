import { useState, useCallback, useRef } from 'react';
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

export interface UsersQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface UsersMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface CacheEntry {
  users: User[];
  meta: UsersMeta;
}

const DEFAULT_META: UsersMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

const buildCacheKey = (query: Required<UsersQuery>) =>
  `${query.page}|${query.perPage}|${query.search}`;

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<UsersMeta>(DEFAULT_META);
  const [loading, setLoading] = useState<boolean>(false);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const lastQueryRef = useRef<Required<UsersQuery>>({ page: 1, perPage: 10, search: '' });

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

  const fetchUsers = useCallback(async (query: Required<UsersQuery>) => {
    const key = buildCacheKey(query);
    const cached = cacheRef.current.get(key);

    if (cached) {
      setUsers(cached.users);
      setMeta(cached.meta);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/user', {
        params: {
          page: query.page,
          per_page: query.perPage,
          search: query.search || undefined,
        },
      });

      const data: User[] = response.data.data;
      const responseMeta: UsersMeta = response.data.meta ?? DEFAULT_META;

      cacheRef.current.set(key, { users: data, meta: responseMeta });
      setUsers(data);
      setMeta(responseMeta);
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao buscar usuários', error));
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = useCallback(
    async (query: UsersQuery = {}) => {
      const normalized: Required<UsersQuery> = {
        page: query.page ?? 1,
        perPage: query.perPage ?? 10,
        search: query.search ?? '',
      };
      lastQueryRef.current = normalized;
      await fetchUsers(normalized);
    },
    [fetchUsers],
  );

  const invalidateAndRefetch = useCallback(
    async (query: Required<UsersQuery> = lastQueryRef.current) => {
      cacheRef.current.clear();
      lastQueryRef.current = query;
      await fetchUsers(query);
    },
    [fetchUsers],
  );

  const createUser = async (userData: User) => {
    try {
      await api.post('/user', userData);
      message.success('Usuário criado com sucesso!');
      await invalidateAndRefetch({ ...lastQueryRef.current, page: 1 });
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao criar usuário', error));
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      await api.put(`/user/${id}`, userData);
      message.success('Usuário atualizado!');
      await invalidateAndRefetch();
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
      await invalidateAndRefetch();
    } catch (error) {
      message.error(getApiErrorMessage('Erro ao deletar usuário', error));
    }
  };

  return {
    users,
    meta,
    loading,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};
