import { DynamoDBWrapper } from '../db/dynamodb';
import { ChainItem } from './chain-item';
import { ChatItem } from './chat-item';
import { ChatRoles } from './chat-roles.enum';

export class Memory {
  private db: DynamoDBWrapper;
  constructor(db: DynamoDBWrapper) {
    this.db = db;
  }

  async addMessage(item: ChatItem, ttl = 5184000) {
    const TTL = ttl ? Math.floor(Date.now() / 1000) + ttl : undefined;
    const chatItem = new ChatItem(item.chatId, item.username, item.message, item.role, TTL).toDynamoItem();
    await this.db.addChatRecord(chatItem);
  }

  async addMessages(items: ChatItem[], ttl = 5184000) {
    const preparedItems = items.map((item) => {
      const TTL = ttl ? Math.floor(Date.now() / 1000) + ttl : undefined;
      return new ChatItem(item.chatId, item.username, item.message, item.role, TTL).toDynamoItem();
    });
    await this.db.addChatRecords(preparedItems);
  }

  async getMessages(chatId: string): Promise<ChatItem[]> {
    const items = await this.db.getChatRecord(chatId, 20);
    return items.map((item) => ChatItem.fromDynamoItem(item));
  }

  async formattedMessages(chatId: string): Promise<ChainItem[]> {
    const messages = await this.getMessages(chatId);
    const chainMessages = messages.map((message) => new ChainItem(message.role, message.message));
    if (chainMessages.length > 0) {
      // verify first is from user and last is from assistant
      if (chainMessages[0].role !== ChatRoles.USER) {
        chainMessages.shift();
      }
      if (chainMessages[chainMessages.length - 1].role !== ChatRoles.ASSISTANT) {
        chainMessages.pop();
      }
    }
    return chainMessages;
  }
}
