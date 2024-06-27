import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { ClaudeAI, ClaudeModels } from '../claude/claude';
import { Config } from '../config/config';

export class Bot {
  private bot: Telegraf;
  private claude: ClaudeAI;
  private running: boolean = false;
  constructor(token: string, claude: ClaudeAI) {
    this.bot = new Telegraf(token);
    this.claude = claude;
    this.defineCommands();
  }

  public run() {
    if (this.running) {
      return;
    }
    this.bot.launch();
    this.running = true;
    console.log('Bot is running');
  }

  public webhookCallback(path: string, options: any) {
    return this.bot.webhookCallback(path, options);
  }

  public stop(signal: string) {
    if (!this.running) {
      return;
    }
    this.bot.stop(signal);
    this.running = false;
  }

  private defineCommands() {
    this.bot.command('start', (ctx) => this.startCommand(ctx));
    this.bot.command('help', (ctx) => this.helpCommand(ctx));
    this.bot.command('quit', (ctx) => this.quitCommand(ctx));

    /**
     * This method answer when:
     * If the text starts with "Clau" and the chat is a group
     * If not, if the chat is private
     */
    this.bot.on(message('text'), async (ctx) => {
      if (!Config.TELEGRAM_ALLOWED_CHAT_IDS.includes(ctx.message.chat.id)) {
        console.log('Chat not allowed', ctx.message.chat.id, {
          from: {
            id: ctx.message.from.id,
            username: ctx.message.from.username,
          },
        });
        return;
      }
      const explicitAndGroup =
        ctx.message.text.startsWith('Clau') &&
        (ctx.message.chat.type === 'group' || ctx.message.chat.type === 'supergroup');
      const implicitAndPrivate = ctx.message.chat.type === 'private';
      const isAdmin = Config.TELEGRAM_ADMIN_CHAT_IDS.includes(ctx.message.chat.id);
      const model = explicitAndGroup || isAdmin ? ClaudeModels.sonnet_3_5 : ClaudeModels.haiku_3;
      if (explicitAndGroup || implicitAndPrivate) {
        const response: string = await this.claude.sendMessage(
          ctx.message.chat.id,
          ctx.message.from.username || 'none',
          ctx.message.text,
          model,
        );
        ctx.reply(response, { parse_mode: 'HTML' });
      } else {
        console.log('Message not processed', ctx.message.text, ctx.message.chat.type);
      }
      // ctx.reply(ctx.message.text);
    });
  }

  private startCommand(ctx: Context) {
    ctx.reply('Welcome to the Telegram bot!', { parse_mode: 'Markdown' });
  }

  private async quitCommand(ctx: Context) {
    ctx.reply('Goodbye!', { parse_mode: 'Markdown' });
    // await ctx.telegram.leaveChat(ctx.message.chat.id);
    await ctx.leaveChat();
  }

  private helpCommand(ctx: Context) {
    const commands = [
      'I understand the following commands:',
      '*/start* - Start the bot',
      '*/help* - Show this help message',
      '*/quit* - Quit the bot',
      '_memory is work in progress_',
      '*If this is a group, I only answer when invoked by Clau, my name.*',
      "-Example: 'Clau, what is the meaning of life?'",
    ];
    ctx.reply(commands.join('\n'), { parse_mode: 'Markdown' });
  }
}
