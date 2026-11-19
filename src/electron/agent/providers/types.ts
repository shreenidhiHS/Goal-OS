import type { AiModelInfo } from '../../../shared/ipc/types';

export interface AgentChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: AgentToolCall[];
  tool_name?: string;
}

export interface AgentToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AgentToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AgentChatResponse {
  message: AgentChatMessage;
  done: boolean;
}

export interface AiProviderClient {
  listModels(): Promise<AiModelInfo[]>;
  chat(messages: AgentChatMessage[], tools?: AgentToolDefinition[]): Promise<AgentChatResponse>;
  testConnection(): Promise<{ ok: boolean; message: string }>;
}
