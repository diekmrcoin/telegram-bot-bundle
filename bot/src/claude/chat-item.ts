import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { ChatRoles } from './chat-roles.enum';

export class ChatItem {
  constructor(
    public readonly chatId: string,
    public readonly username: string,
    public readonly message: string,
    public readonly role: ChatRoles,
    public readonly TTL?: number,
    public readonly dateTime?: string,
  ) {}

  public static fromDynamoItem(item: any): ChatItem {
    return new ChatItem(
      item.chatId.S,
      item.username.S,
      item.message.S,
      item.role.S as ChatRoles,
      item.TTL ? item.TTL.N : undefined,
      item.dateTime.S,
    );
  }

  public toDynamoItem(): Record<string, AttributeValue> {
    return {
      username: { S: this.username },
      chatId: { S: this.chatId },
      message: { S: this.message },
      role: { S: this.role },
      TTL: this.TTL ? { N: this.TTL.toString() } : (undefined as any),
      dateTime: { S: this.dateTime! },
    };
  }
}
