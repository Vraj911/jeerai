import { apiClient } from './client';
import type { User } from '@/types/user';
import { env } from '@/app/config/env';
export interface LoginPayload {
  email: string;
  password: string;
}
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
  user: User;
}
const authBaseUrl = env.apiBaseUrl.replace(/\/api\/?$/, '');
export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(`${authBaseUrl}/auth/login`, payload);
    return data;
  },
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(`${authBaseUrl}/auth/signup`, payload);
    return data;
  },
};
