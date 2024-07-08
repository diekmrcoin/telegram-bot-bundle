import { Telegraf } from 'telegraf';
import { ClaudeWrapping } from '../../ai/anthropic/claude-wrapping';
import Anthropic from '@anthropic-ai/sdk';
import { Memory } from '../memory/memory';
import { ChainItem } from '../../ai/anthropic/typings/chain-item';
import { ChatRoles } from '../../ai/anthropic/typings/chat-roles.enum';

export abstract class CommandWrapper {
  protected aiWrapper?: ClaudeWrapping;
  protected memory?: Memory;
  constructor(protected bot: Telegraf) {}
  // Commands actions
  abstract registerCommands(): void;
  abstract startCommand(ctx: any): void;
  abstract helpCommand(ctx: any): void;
  abstract quitCommand(ctx: any): void;
  abstract getClaudeTools(): Anthropic.Messages.Tool[];
  abstract getContext(chatId: string): Promise<ChainItem[]>;

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

  async formatMessages(chatId: string): Promise<ChainItem[]> {
    const messages = await this.memory!.getMessages(chatId);
    const chainMessages = messages.map(
      (message): ChainItem => ({ role: message.role as ChatRoles, content: message.message }),
    );
    if (chainMessages.length > 0) {
      // verify first is from user and last is from assistant
      if (chainMessages[0].role !== ChatRoles.USER) {
        chainMessages.shift();
      }
      if (chainMessages[chainMessages.length - 1].role !== ChatRoles.ASSISTANT) {
        chainMessages.pop();
      }
    }
    return chainMessages;
  }
}
