import { CommandWrapper } from './command-wrapper';
import { ChainItem } from '../../ai/anthropic/typings/chain-item';

export abstract class BotWrapper {
  public readonly name: string;
  public readonly description: string;
  protected commandWrapper: CommandWrapper;
  protected running: boolean = false;
  constructor(name: string, description: string, commandWrapper: CommandWrapper) {
    this.name = name;
    this.description = description;
    this.commandWrapper = commandWrapper;
    this.commandWrapper.registerCommands();
  }

  // Telegram bot actions
  run(): void {
    if (this.running) {
      return;
    }
    this.commandWrapper.getBot().launch();
    this.running = true;
    console.log('Bot is running');
  }
  webhookCallback(path: string, options: any): any {
    return this.commandWrapper.getBot().webhookCallback(path, options);
  }
  stop(signal: string): void {
    if (!this.running) {
      return;
    }
    this.commandWrapper.getBot().stop(signal);
    this.running = false;
  }

  // AI integration
  abstract setClaude(claude: any): void;
  abstract getSystemConfig(): string;
}
