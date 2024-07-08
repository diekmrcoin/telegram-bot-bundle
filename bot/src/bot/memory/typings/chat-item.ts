import { AttributeValue } from '@aws-sdk/client-dynamodb';

export class ChatItem {
  constructor(
    public readonly chatId: string,
    public readonly username: string,
    public readonly message: string,
    public readonly role: string,
    public readonly TTL?: number,
    public readonly dateTime?: string,
    public readonly type?: string,
    public readonly toolUseId?: string,
  ) {}

  public static fromObject(obj: ChatItem): ChatItem {
    return new ChatItem(
      obj.chatId,
      obj.username,
      obj.message,
      obj.role,
      obj.TTL,
      obj.dateTime,
      obj.type,
      obj.toolUseId,
    );
  }

  public static fromDynamoItem(item: any): ChatItem {
    return new ChatItem(
      item.chatId.S,
      item.username.S,
      item.message.S,
      item.role.S,
      item.TTL ? item.TTL.N : undefined,
      item.dateTime.S,
      item.type ? item.type.S : undefined,
      item.toolUseId ? item.toolUseId.S : undefined,
    );
  }

  public toDynamoItem(): Record<string, AttributeValue> {
    const item: Record<string, AttributeValue> = {
      username: { S: this.username },
      chatId: { S: this.chatId },
      message: { S: this.message },
      role: { S: this.role },
      dateTime: { S: this.dateTime! }, // Assuming dateTime always exists
    };

    if (this.TTL) {
      item.TTL = { N: this.TTL.toString() };
    }
    if (this.type) {
      item.type = { S: this.type };
    }
    if (this.toolUseId) {
      item.toolUseId = { S: this.toolUseId };
    }

    return item;
  }
}
