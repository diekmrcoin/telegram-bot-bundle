import Anthropic from '@anthropic-ai/sdk';
import { TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { Memory } from './memory';
import { ChatRoles } from './chat-roles.enum';
import { ChatItem } from './chat-item';

export class ClaudeAI {
  private anthropic: Anthropic;
  private systemConfig: any;
  private memory: Memory;
  constructor(apiKey: string, memory: Memory) {
    this.memory = memory;
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    this.systemConfig = {
      role: 'user',
      content: [
        '<system>',
        'You are Clau, a cheerful female engineer, you must answer spanish,',
        'your answer will be sent by Telegram bot so use parser HTML, never use Markdown due to critical parse error prone,',
        'and you are in a chat group of software engineering.',
        'From now on, you will get a compendium of all the messages a chat group has sent every minute.',
        'Collaborate and engage with the messages trying to help the users.',
        'Try to be very concise and helpful.',
        '</system>',
      ].join(' '),
    };
  }

  async sendMessage(chatId: number, username: string, message: string, model = ClaudeModels.haiku_3): Promise<string> {
    message = `${username}: ${message.trim()}`;
    const chainMessages = await this.memory.formattedMessages(chatId.toString());
    const chain = [
      this.systemConfig,
      {
        role: 'assistant',
        content: 'Hola 💅, soy Clau, vuestra asistente, estoy aquí para ayudar en lo necesario.',
      },
      ...chainMessages,
      {
        role: 'user',
        content: message,
      },
    ];
    const answer: Anthropic.Messages.Message = await this.anthropic.messages.create({
      max_tokens: 1024,
      messages: chain,
      model: model,
    });
    // save user message and ai response
    const answerText = (answer.content[0] as TextBlock).text.toString();
    await this.memory.addMessage(new ChatItem(chatId.toString(), username, message, ChatRoles.USER));
    await this.memory.addMessage(new ChatItem(chatId.toString(), 'Clau', answerText, ChatRoles.ASSISTANT));
    return answerText;
  }
}

export enum ClaudeModels {
  sonnet_3_5 = 'claude-3-5-sonnet-20240620',
  opus_3 = 'claude-3-opus-20240229',
  sonnet_3 = 'claude-3-sonnet-20240229',
  haiku_3 = 'claude-3-haiku-20240307',
}
