import { apiClient } from './client';
import type { User } from '@/types/user';
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },
};
