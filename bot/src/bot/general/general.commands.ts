import stream from 'stream';
import { Context, Telegraf } from 'telegraf';
import { CommandWrapper } from '../typings/command-wrapper';
import { ClaudeModels } from '../../ai/anthropic/typings/models.emun';
import { ModelResponse } from '../../ai/anthropic/typings/model.response';
import { message } from 'telegraf/filters';
import Anthropic from '@anthropic-ai/sdk';
import { ChainItem } from '../../ai/anthropic/typings/chain-item';
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
    ctx.reply(answer.message, { parse_mode: 'HTML' });
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
    ctx.reply(answer.message, { parse_mode: 'HTML' });
  }
  quitCommand(ctx: Context): void {
    if (this.ignoreMessage(ctx, 'quit')) return;
    console.log(`User ${ctx.chat!.id} quit the chat`);
    this.memory!.deleteMessages(ctx.chat!.id.toString());
    ctx.reply('Chat ended. If you need help, just type /start');
  }
  registerCommands(): void {
    this.bot.command('start', this.startCommand.bind(this));
    this.bot.command('id', (ctx) => {
      if (this.ignoreMessage(ctx, 'id')) return;
      ctx.reply(ctx.chat!.id.toString());
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
      ctx.reply(answer.message, { parse_mode: 'HTML' });
    });
  }

  getClaudeTools(): Anthropic.Messages.Tool[] {
    return [];
  }

  getContext(chatId: string): Promise<ChainItem[]> {
    return this.formatMessages(chatId);
  }

  setTtsWrapper(ttsWrapper: TTSWrapper) {
    this.ttsWrapper = ttsWrapper;
  }

  tts(text: string): Promise<stream.Readable> {
    return this.ttsWrapper!.getAudio(text);
  }

  async sendAudio(ctx: Context, text: string): Promise<void> {
    // text max length is 32 characters
    if (text.length > 64) {
      ctx.reply('Text is too long, max 64 characters');
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
