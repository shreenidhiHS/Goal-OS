import { settingsRepository } from '../../database/repositories/settings.repository';
import type {
  AiModelInfo,
  AiRunPromptInput,
  AiRunPromptResult,
} from '../../shared/ipc/types';
import { createOllamaProvider } from './providers/ollama';
import type { AgentChatMessage } from './providers/types';
import { AGENT_SYSTEM_PROMPT } from './prompts';
import { AGENT_TOOL_DEFINITIONS } from './tools/definitions';
import { createAgentToolExecutor } from './tools/executor';

const MAX_TOOL_ITERATIONS = 5;

function emptyResult(error: string): AiRunPromptResult {
  return {
    reply: error,
    created: { goals: [], tasks: [] },
    error,
  };
}

export const agentService = {
  listModels(): Promise<AiModelInfo[]> {
    const settings = settingsRepository.get();
    if (settings.aiProvider !== 'ollama') {
      return Promise.resolve([]);
    }
    const provider = createOllamaProvider(settings.aiOllamaPort, settings.aiOllamaModel);
    return provider.listModels();
  },

  testConnection(): Promise<{ ok: boolean; message: string }> {
    const settings = settingsRepository.get();
    if (settings.aiProvider !== 'ollama') {
      return Promise.resolve({ ok: false, message: 'AI provider is set to None' });
    }
    const provider = createOllamaProvider(settings.aiOllamaPort, settings.aiOllamaModel);
    return provider.testConnection();
  },

  async runPrompt(input: AiRunPromptInput): Promise<AiRunPromptResult> {
    const prompt = input.prompt?.trim();
    if (!prompt) return emptyResult('Prompt is empty');

    const settings = settingsRepository.get();
    if (settings.aiProvider !== 'ollama') {
      return emptyResult('Enable Ollama in Settings to use the agent.');
    }
    if (!settings.aiOllamaModel) {
      return emptyResult('Select an Ollama model in Settings.');
    }

    const provider = createOllamaProvider(settings.aiOllamaPort, settings.aiOllamaModel);
    const tools = createAgentToolExecutor();

    const messages: AgentChatMessage[] = [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    try {
      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        console.log('messages', messages);
        const response = await provider.chat(messages, AGENT_TOOL_DEFINITIONS);
        console.log('response', response);
        console.log('tool_calls', response.message.tool_calls);
        const assistant = response.message;
        messages.push(assistant);

        const toolCalls = assistant.tool_calls ?? [];
        if (toolCalls.length === 0) {
          const created = tools.getCreated();
          const reply =
            assistant.content?.trim() ||
            (created.goals.length || created.tasks.length
              ? `Created ${created.goals.length} goal(s) and ${created.tasks.length} task(s).`
              : 'Done.');
          return { reply, created };
        }

        for (const call of toolCalls) {
          const execution = tools.execute(call.function.name, call.function.arguments);
          messages.push({
            role: 'tool',
            tool_name: call.function.name,
            content: JSON.stringify(execution.result),
          });
        }
      }

      const created = tools.getCreated();
      return {
        reply: `Reached tool iteration limit. Created ${created.goals.length} goal(s) and ${created.tasks.length} task(s).`,
        created,
      };
    } catch (err) {
      const created = tools.getCreated();
      const message = (err as Error).message || 'Agent failed';
      return {
        reply: message,
        created,
        error: message,
      };
    }
  },
};
