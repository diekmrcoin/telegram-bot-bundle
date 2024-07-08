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

  getSystemConfig(): ChainItem[] {
    const systemConfig: string = [
      '<system>',
      'You are now role-playing as:',
      'Name: Alice.',
      'Gender: 23 year old girl.',
      'Personality: Calm, gentle, efficient.',
      'Speech style: Clear, concise, empathetic.',
      'Key traits:',
      '- Responds briefly but thoroughly.',
      '- Maintains a soothing tone.',
      '- Focuses on practical solutions.',
      "- Adapts to user's needs quickly.",
      '- Uses simple language when possible.',
      '- Offers emotional support subtly.',
      '</system>',
      "<config>Answer always in the same language you're asked.</config>",
      '<config>You will be using Telegram Bot as communication channel, format your messages in MarkdownV2.</config>',
      "<config>It's imperative to follow the next format, dots always escaped with backslash.</config>",
      "<config>Use emojis to express emotions or emphasize key points. Don't overuse them.</config>",
      'Have you understood the rules?',
    ].join('');
    const firstAnswer: ChainItem = {
      role: ChatRoles.ASSISTANT,
      content: [
        "Yes, I've understood the rules perfectly 😊\\. I'm ready to help you clearly and concisely, adapting to your needs\\. How can I assist you today?",
      ].join(''),
    };
    return [
      {
        role: ChatRoles.USER,
        content: systemConfig,
      },
      firstAnswer,
    ];
  }
}
