import { create } from 'zustand';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiAgentUiStore {
  open: boolean;
  messages: AiChatMessage[];
  loading: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
  addMessage: (message: Omit<AiChatMessage, 'id'> & { id?: string }) => void;
  clearMessages: () => void;
}

export const useAiAgentUiStore = create<AiAgentUiStore>((set) => ({
  open: false,
  messages: [],
  loading: false,
  setOpen: (open) => set({ open }),
  toggleOpen: () => set((s) => ({ open: !s.open })),
  setLoading: (loading) => set({ loading }),
  addMessage: (message) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: message.id ?? crypto.randomUUID(), role: message.role, content: message.content },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));
