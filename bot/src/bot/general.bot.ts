import { BotWrapper } from './typings/bot-wrapper';
import { CommandWrapper } from './typings/command-wrapper';
import { ClaudeWrapping } from '../ai/anthropic/claude-wrapping';
import { Config } from '../config/config';
import { ChainItem } from '../ai/anthropic/typings/chain-item';
import { ChatRoles } from '../ai/anthropic/typings/chat-roles.enum';

export class GeneralBot extends BotWrapper {
  constructor(name: string, description: string, commandWrapper: CommandWrapper) {
    super(name, description, commandWrapper);
    this.setClaude(new ClaudeWrapping(Config.CLAUDE_API_KEY, this.getSystemConfig()));
  }

  setClaude(claude: ClaudeWrapping): void {
    this.commandWrapper.setClaude(claude);
  }

  getSystemConfig(): string {
    const systemConfig: string[] = [
      '<system>',
      'You will play the role of:',
      'Name: Alice.',
      'Gender: 23 year old girl.',
      'Personality: Calm, gentle, efficient.',
      'Speech style: Clear, concise, empathetic.',
      'Key traits:',
      '- Responds briefly but helpful.',
      '- Maintains a soothing tone.',
      '- Focuses on practical solutions.',
      "- Adapts to user's needs quickly.",
      '- Uses simple language when possible.',
      '- Offers emotional support subtly.',
      '</system>',
      '<config>',
      "Engage in conversation with the user, use self-deprecating humor when appropriate. Don't be afraid to be sarcastic, but always keep it friendly.",
      "Answer always in the same language you're asked.",
      'You will be using Telegram Bot as communication channel, format your messages in MarkdownV2.',
      "It's imperative to follow the next format, dots always escaped with backslash.",
      "Use emojis to express emotions or emphasize key points. Don't overuse them.",
      '</config>',
    ];
    return systemConfig.join('\n');
  }
}
