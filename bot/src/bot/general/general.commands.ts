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
  helpCommand(ctx: Context): void {
    throw new Error('Method not implemented.');
  }
  quitCommand(ctx: Context): void {
    throw new Error('Method not implemented.');
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
    // return [
    //   {
    //     name: 'check_word',
    //     description: 'Check if the word is correct and returns the emojis result of the word to verify',
    //     input_schema: {
    //       type: 'object',
    //       properties: {
    //         word: {
    //           type: 'string',
    //           description: 'The word to check',
    //         },
    //       },
    //       required: ['word'],
    //     },
    //   },
    // ];
  }
}
