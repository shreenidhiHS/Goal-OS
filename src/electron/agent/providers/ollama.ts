import type { AiModelInfo } from '../../../shared/ipc/types';
import type {
  AgentChatMessage,
  AgentChatResponse,
  AgentToolDefinition,
  AiProviderClient,
} from './types';

const FETCH_TIMEOUT_MS = 60_000;

export function createOllamaProvider(port: number, model: string): AiProviderClient {
  const baseUrl = `http://127.0.0.1:${port}`;

  async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Ollama ${res.status}: ${body || res.statusText}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error('Ollama request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async listModels(): Promise<AiModelInfo[]> {
      const data = await fetchJson<{ models?: Array<{ name: string; size?: number }> }>('/api/tags');
      return (data.models ?? []).map((m) => ({ name: m.name, size: m.size }));
    },

    async testConnection(): Promise<{ ok: boolean; message: string }> {
      try {
        const models = await this.listModels();
        return {
          ok: true,
          message: `Connected (${models.length} model${models.length === 1 ? '' : 's'})`,
        };
      } catch (err) {
        return { ok: false, message: (err as Error).message };
      }
    },

    async chat(
      messages: AgentChatMessage[],
      tools?: AgentToolDefinition[],
    ): Promise<AgentChatResponse> {
      if (!model) throw new Error('No Ollama model selected');

      const data = await fetchJson<{
        message?: AgentChatMessage;
        done?: boolean;
      }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          tools: tools?.length ? tools : undefined,
        }),
      });

      if (!data.message) {
        throw new Error('Empty response from Ollama');
      }

      return { message: data.message, done: data.done ?? true };
    },
  };
}
