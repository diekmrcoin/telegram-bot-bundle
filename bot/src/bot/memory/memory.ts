import { ChatDynamoDBWrapper } from '../../db/chat.dynamodb';
import { ChatItem } from './typings/chat-item';

export class Memory {
  private db: ChatDynamoDBWrapper;
  constructor(db: ChatDynamoDBWrapper) {
    this.db = db;
  }

  async addMessage(item: ChatItem, ttl = 5184000) {
    const TTL = ttl ? Math.floor(Date.now() / 1000) + ttl : undefined;
    const chatItem = ChatItem.fromObject({ ...item, TTL }).toDynamoItem();
    await this.db.addChatRecord(chatItem);
  }

  async addMessages(items: ChatItem[], ttl = 5184000) {
    const preparedItems = items.map((item) => {
      const TTL = ttl ? Math.floor(Date.now() / 1000) + ttl : undefined;
      return ChatItem.fromObject({ ...item, TTL }).toDynamoItem();
    });
    await this.db.addChatRecords(preparedItems);
  }

  async getMessages(user: string, chatId: string): Promise<ChatItem[]> {
    const items = await this.db.getChatRecord(user, chatId, 10);
    return items.map((item) => ChatItem.fromDynamoItem(item));
  }

  async deleteMessages(user: string, chatId: string): Promise<void> {
    await this.db.deleteChatRecord(user, chatId);
  }
}
