import { Telegraf } from 'telegraf';
import { CommandWrapper } from './command-wrapper';
import { ChainItem } from '../../ai/anthropic/typings/chain-item';

export abstract class BotWrapper {
  public readonly name: string;
  public readonly description: string;
  protected bot: Telegraf;
  protected commandWrapper: CommandWrapper;
  protected running: boolean = false;
  constructor(name: string, description: string, bot: Telegraf, commandWrapper: CommandWrapper) {
    this.name = name;
    this.description = description;
    this.bot = bot;
    this.commandWrapper = commandWrapper;
    this.commandWrapper.registerCommands();
  }

  // Telegram bot actions
  run(): void {
    if (this.running) {
      return;
    }
    this.bot.launch();
    this.running = true;
    console.log('Bot is running');
  }
  webhookCallback(path: string, options: any): any {
    return this.bot.webhookCallback(path, options);
  }
  stop(signal: string): void {
    if (!this.running) {
      return;
    }
    this.bot.stop(signal);
    this.running = false;
  }

  // AI integration
  abstract setClaude(claude: any): void;
  abstract getSystemConfig(): ChainItem[];
}
