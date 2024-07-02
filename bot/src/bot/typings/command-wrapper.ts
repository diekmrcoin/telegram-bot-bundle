import { Telegraf } from 'telegraf';
import { ClaudeWrapping } from '../../ai/anthropic/claude-wrapping';
import Anthropic from '@anthropic-ai/sdk';
import { Memory } from '../memory/memory';

export abstract class CommandWrapper {
  protected aiWrapper?: ClaudeWrapping;
  protected memory?: Memory;
  constructor(protected bot: Telegraf) {}
  // Commands actions
  abstract registerCommands(): void;
  abstract startCommand(ctx: any): void;
  abstract helpCommand(ctx: any): void;
  abstract quitCommand(ctx: any): void;

  getBot(): Telegraf {
    return this.bot;
  }

  setClaude(claude: ClaudeWrapping) {
    this.aiWrapper = claude;
  }

  setMemory(memory: Memory) {
    this.memory = memory;
  }

  getMemory(): Memory {
    if (!this.memory) {
      throw new Error('Memory is not set');
    }
    return this.memory;
  }

  abstract getClaudeTools(): Anthropic.Messages.Tool[];
}
