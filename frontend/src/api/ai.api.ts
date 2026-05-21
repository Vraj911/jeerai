import { apiClient } from './client';
import type { AiMessageRequest, AiMessageResponse } from '@/types/ai';
export const aiApi = {
  sendMessage: async (body: AiMessageRequest): Promise<AiMessageResponse> => {
    const { data } = await apiClient.post<AiMessageResponse>('/ai/message', body);
    return data;
  },
};
