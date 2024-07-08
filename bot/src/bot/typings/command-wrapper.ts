import { Telegraf } from 'telegraf';
import { ClaudeWrapping } from '../../ai/anthropic/claude-wrapping';
import Anthropic from '@anthropic-ai/sdk';
import { Memory } from '../memory/memory';
import { ChainItem, ChainItemTool } from '../../ai/anthropic/typings/chain-item';
import { ChatRoles } from '../../ai/anthropic/typings/chat-roles.enum';
import { ChatItem } from '../memory/typings/chat-item';

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
  abstract getContext(chatId: string): Promise<(ChainItem | ChainItemTool)[]>;

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

  async formatMessages(chatId: string): Promise<(ChainItem | ChainItemTool)[]> {
    const messages = await this.memory!.getMessages(chatId);
    console.log('Message length:', messages.length);
    const chainMessages = messages.map((message: ChatItem): ChainItem | ChainItemTool => {
      let item: ChainItem | ChainItemTool;
      if (message.toolUseId) {
        item = {
          role: message.role as ChatRoles,
          content: [
            {
              type: 'tool_result',
              tool_use_id: message.toolUseId,
              content: message.message,
            },
          ],
        };
      } else {
        item = {
          role: message.role as ChatRoles,
          content: message.message,
        };
      }
      return item;
    });
    if (chainMessages.length > 0) {
      // verify first is from user and last is from assistant
      if (chainMessages[0].role !== ChatRoles.USER) {
        console.log('First message is not from user');
        chainMessages.shift();
      }
      if (chainMessages[chainMessages.length - 1].role !== ChatRoles.ASSISTANT) {
        console.log('Last message is not from assistant');
        chainMessages.pop();
      }
    }
    return chainMessages;
  }
}
