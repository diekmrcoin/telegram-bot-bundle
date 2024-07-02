import { Telegraf } from 'telegraf';
import { ClaudeWrapping } from '../../ai/anthropic/claude-wrapping';
import Anthropic from '@anthropic-ai/sdk';

export abstract class CommandWrapper {
  protected aiWrapper?: ClaudeWrapping;
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

  abstract getClaudeTools(): Anthropic.Messages.Tool[];
}
