import { apiClient } from './client';

interface AiMessageResponse {
  reply: string;
}

export const aiApi = {
  sendMessage: async (message: string): Promise<string> => {
    const { data } = await apiClient.post<AiMessageResponse>('/ai/message', { message });
    return data.reply;
  },
};
