import { Context } from 'telegraf';
import { CommandWrapper } from '../typings/command-wrapper';
import { ClaudeModels } from '../../ai/anthropic/typings/models.emun';
import { ModelResponse } from '../../ai/anthropic/typings/model.response';
import { message } from 'telegraf/filters';
import Anthropic from '@anthropic-ai/sdk';

export class GeneralCommands extends CommandWrapper {
  aiModel = ClaudeModels.sonnet_3_5;
  async startCommand(ctx: Context): Promise<void> {
    const username = ctx.from!.username;
    const name = ctx.from!.first_name;
    const answer: ModelResponse = await this.aiWrapper!.sendMessage(
      `<system>New user starting chat, named ${name || username}, greet and ask for the language to use. Use english for this message.</system>`,
      [],
      this.aiModel,
      this.getClaudeTools(),
    );
    ctx.reply(answer.message, { parse_mode: 'HTML' });
  }
  async helpCommand(ctx: Context): Promise<void> {
    const listCommands: string[] = [];
    listCommands.push('/start - Start a new chat');
    listCommands.push('/help - Show this help');
    listCommands.push('/quit - Quit the chat');
    const answer: ModelResponse = await this.aiWrapper!.sendMessage(
      "<sysmtem>The user asked for help. Answer in its language. Here's a list of available commands:\n" +
        listCommands.join('\n') +
        '</system>',
      [],
      this.aiModel,
      this.getClaudeTools(),
    );
    ctx.reply(answer.message, { parse_mode: 'HTML' });
  }
  quitCommand(ctx: Context): void {
    // this.memory!.deleteMessages(ctx.chat!.id.toString());
  }
  registerCommands(): void {
    this.bot.command('start', this.startCommand.bind(this));
    this.bot.command('help', this.helpCommand.bind(this));
    this.bot.command('quit', this.quitCommand.bind(this));
    this.bot.on(message('text'), async (ctx) => {
      // ignore if chat id is negative
      if (ctx.chat!.id < 0) {
        return;
      }
      const answer: ModelResponse = await this.aiWrapper!.sendMessage(
        ctx.message.text,
        [],
        this.aiModel,
        this.getClaudeTools(),
      );
      ctx.reply(answer.message, { parse_mode: 'HTML' });
    });
  }

  getClaudeTools(): Anthropic.Messages.Tool[] {
    return [];
  }
}
