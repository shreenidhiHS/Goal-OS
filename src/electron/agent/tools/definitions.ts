import type { AgentToolDefinition } from '../providers/types';

export const AGENT_TOOL_DEFINITIONS: AgentToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Create a new goal in GoalOS.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Short goal name' },
          description: { type: 'string', description: 'Optional short description' },
          notes: { type: 'string', description: 'Optional longer notes / why' },
          targetDate: {
            type: 'string',
            description: 'Optional target date as YYYY-MM-DD',
          },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description:
        'Create a task. Optionally link it to a goal by exact goal name (existing or just created).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
          },
          dueDate: { type: 'string', description: 'Optional due date YYYY-MM-DD' },
          goalName: {
            type: 'string',
            description: 'Optional goal name to link this task to',
          },
        },
        required: ['title'],
      },
    },
  },
];
