function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const aiApi = {
  sendMessage: async (message: string): Promise<string> => {
    await delay(800);
    return `AI response to: ${message}`;
  },
};
