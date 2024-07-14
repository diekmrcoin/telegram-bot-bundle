import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { DynamoDBFactory, DynamoDBWrapper } from './dynamodb';

export class ApiDynamoDBWrapper {
  private wrapper: DynamoDBWrapper;
  readonly tableName = 'synergysys-dev-dynamo-api';
  constructor(wrapper?: DynamoDBWrapper, tableName?: string) {
    this.wrapper = wrapper || DynamoDBFactory.create();
    this.wrapper.tableName = tableName || this.tableName;
  }

  async addLoginRecord(id: string, token: string, email: string, code: string): Promise<void> {
    // TTL 12 hours, in seconds
    const ttlSeconds = 12 * 60 * 60;
    const data: Record<string, AttributeValue> = {
      partition: { S: `login_${email}` },
      id: { S: id },
      token: { S: token },
      email: { S: email },
      code: { S: code },
    };
    return this.wrapper.addRecord(data, ttlSeconds);
  }

  async getLoginRecord(id: string, email: string, code: string): Promise<Record<string, AttributeValue> | null> {
    const record = await this.wrapper.getRecordByPartitionAndId(`login_${email}`, id);
    if (!record) {
      return null;
    }
    if (record.code.S === code && record.email.S === email) {
      return record;
    }
    return null;
  }
}
