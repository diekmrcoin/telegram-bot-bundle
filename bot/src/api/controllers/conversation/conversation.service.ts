import { Memory } from '../../../bot/memory/memory';
import { ChatItem } from '../../../bot/memory/typings/chat-item';
import { ChatDynamoDBWrapper } from '../../../db/chat.dynamodb';
import { DynamoDBFactory } from '../../../db/dynamodb';
import { HttpInternalServerErrorException } from '../../../http/http.exception';
import { SQSWrapper } from '../../../queue/sqs';

export class ConversationService {
  private sqsCLient: SQSWrapper;
  private memory: Memory;
  constructor(sqsClient?: SQSWrapper, memory?: Memory) {
    this.sqsCLient = sqsClient || new SQSWrapper();
    this.memory = memory || new Memory(new ChatDynamoDBWrapper(DynamoDBFactory.create()));
  }
  async getMessages(chatId: string): Promise<ChatItem[]> {
    let messages: ChatItem[];
    try {
      messages = await this.memory.getMessages(chatId);
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to get messages', error as Error);
    }
    return messages;
  }

  async publishMessage(message: string): Promise<string> {
    let data;
    try {
      data = await this.sqsCLient.sendMessage(message);
      if (!data.MessageId) {
        throw new HttpInternalServerErrorException('Failed to send message', new Error('No message id'));
      }
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to send message', error as Error);
    }
    return data.MessageId;
  }

  async checkResponse() {
    return true;
  }
}
