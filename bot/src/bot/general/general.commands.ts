import stream from 'stream';
import { Context, Telegraf } from 'telegraf';
import { CommandWrapper } from '../typings/command-wrapper';
import { ClaudeModels } from '../../ai/anthropic/typings/models.emun';
import { ModelResponse } from '../../ai/anthropic/typings/model.response';
import { message } from 'telegraf/filters';
import Anthropic from '@anthropic-ai/sdk';
import { ChainItem, ChainItemTool } from '../../ai/anthropic/typings/chain-item';
import { ChatItem } from '../memory/typings/chat-item';
import { ChatRoles } from '../../ai/anthropic/typings/chat-roles.enum';
import { TTSWrapper } from '../../ai/elevenlabs/tts-wrapper';
import { Config } from '../../config/config';

export class GeneralCommands extends CommandWrapper {
  aiModel = ClaudeModels.sonnet_3_5;
  ttsWrapper?: TTSWrapper;

  constructor(bot: Telegraf) {
    super(bot);
  }

  async startCommand(ctx: Context): Promise<void> {
    if (this.ignoreMessage(ctx, 'start')) return;
    const username = ctx.from!.username;
    const name = ctx.from!.first_name;
    const answer: ModelResponse = await this.aiWrapper!.sendMessage(
      `<system>New user starting chat, named ${name || username}, greet telling your name and ask for the language to use. Use english for this message.</system>`,
      [],
      this.aiModel,
      this.getClaudeTools(),
    );
    await ctx.reply(answer.message, { parse_mode: 'MarkdownV2' });
  }
  async helpCommand(ctx: Context): Promise<void> {
    const listCommands: string[] = [];
    listCommands.push('/start - Start a new chat');
    listCommands.push('/help - Show this help');
    listCommands.push('/tts <text> - Convert text to speech');
    listCommands.push('/quit - Quit the chat');
    const answer: ModelResponse = await this.aiWrapper!.sendMessage(
      "<sysmtem>The user asked for help. Answer in english. Here's a list of available commands:\n" +
        listCommands.join('\n') +
        '</system>',
      [],
      this.aiModel,
      this.getClaudeTools(),
    );
    await ctx.reply(answer.message, { parse_mode: 'MarkdownV2' });
  }
  async quitCommand(ctx: Context): Promise<void> {
    if (this.ignoreMessage(ctx, 'quit')) return;
    console.log(`User ${ctx.chat!.id} quit the chat`);
    this.memory!.deleteMessages(ctx.chat!.id.toString());
    await ctx.reply('Chat ended. If you need help, just type /start');
  }
  registerCommands(): void {
    this.bot.command('start', this.startCommand.bind(this));
    this.bot.command('id', async (ctx) => {
      if (this.ignoreMessage(ctx, 'id')) return;
      await ctx.reply(ctx.chat!.id.toString());
    });
    this.bot.command('help', this.helpCommand.bind(this));
    this.bot.command('tts', async (ctx) => {
      if (this.ignoreMessage(ctx, 'tts')) return;
      const text = ctx.message.text.replace('/tts ', '');
      await this.sendAudio(ctx, text);
    });
    this.bot.command('quit', this.quitCommand.bind(this));
    this.bot.on(message('text'), async (ctx) => {
      if (this.ignoreMessage(ctx, 'text')) return;
      const username = ctx.from!.username || 'noname';
      const answer: ModelResponse = await this.aiWrapper!.sendMessage(
        ctx.message.text,
        await this.getContext(ctx.chat!.id.toString()),
        this.aiModel,
        this.getClaudeTools(),
      );
      const messages: ChatItem[] = [
        new ChatItem(ctx.chat!.id.toString(), username, ctx.message.text, ChatRoles.USER),
        new ChatItem(ctx.chat!.id.toString(), 'Alice', answer.message, ChatRoles.ASSISTANT),
      ];
      await this.memory!.addMessages(messages);
      await ctx.reply(answer.message, { parse_mode: 'MarkdownV2' });
      try {
        // if (answer.tool?.name === 'generateAudio') {
        //   // FIXME: the delay is so long that Telegram is trying again and again the request
        //   // await this.sendAudio(ctx, answer.tool.input.text, 1024);
        //   await this.memory!.addMessages([
        //     ChatItem.fromObject({
        //       chatId: ctx.chat!.id.toString(),
        //       username: username,
        //       message: '<system>Audio sent</system>',
        //       role: ChatRoles.USER,
        //       type: 'tool_result',
        //       toolUseId: answer.tool.id,
        //     } as ChatItem),
        //     new ChatItem(ctx.chat!.id.toString(), 'Alice', '...', ChatRoles.ASSISTANT),
        //   ]);
        // }
      } catch (err) {
        await ctx.reply('Error creating the audio.');
        console.error('Error sending audio', err);
        console.error((err as Error).stack);
      }
    });
  }

  getClaudeTools(): Anthropic.Messages.Tool[] {
    // * generateAudio: callable when the user wants the answer to be in audio format
    return [
      // {
      //   name: 'generateAudio',
      //   description: 'Generate an audio file with the answer',
      //   input_schema: {
      //     type: 'object',
      //     properties: {
      //       text: {
      //         type: 'string',
      //         description: 'The text to convert to audio',
      //       },
      //     },
      //     required: ['text'],
      //   },
      // },
    ];
  }

  async getContext(chatId: string): Promise<(ChainItem | ChainItemTool)[]> {
    const chain = await this.formatMessages(chatId);
    return chain;
  }

  setTtsWrapper(ttsWrapper: TTSWrapper) {
    this.ttsWrapper = ttsWrapper;
  }

  tts(text: string): Promise<stream.Readable> {
    return this.ttsWrapper!.getAudio(text);
  }

  async sendAudio(ctx: Context, text: string, maxLength = 64): Promise<void> {
    // text max length is 32 characters
    if (text.length > maxLength) {
      await ctx.reply(`Text is too long, max length is ${maxLength} characters`);
      return;
    }
    text = text.trim();
    const stream = await this.tts(text);
    await ctx.replyWithVoice({ source: stream });
  }

  ignoreMessage(ctx: Context, command: string): boolean {
    // if group id included in allowed ids, allow tts command
    if (Config.TELEGRAM_ALLOWED_CHAT_IDS.includes(ctx.chat!.id) && command === 'tts') {
      return false;
    }
    // if group (negative chat id) only allow id command
    if (ctx.chat!.id < 0 && command === 'id') {
      return false;
    }
    // if user included in allowed ids, allow all commands
    if (ctx.chat!.id > 0 && Config.TELEGRAM_ALLOWED_CHAT_IDS.includes(ctx.from!.id)) {
      return false;
    }
    return true;
  }
}
