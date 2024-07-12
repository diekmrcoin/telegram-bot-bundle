import { AttributeValue, DynamoDB, PutItemCommandInput, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { Config } from '../config/config';

export class DynamoDBWrapper {
  private region = 'eu-west-3';
  readonly client: DynamoDB;
  tableName = '';

  constructor(client?: DynamoDB) {
    this.client = client || new DynamoDB({ region: this.region, credentials: Config.AWS_CREDENTIALS as any });
  }

  async addRecord(data: Record<string, AttributeValue>, ttlSeconds: number): Promise<void> {
    const now = new Date();
    const TTL = Math.floor((now.getTime() + ttlSeconds * 1000) / 1000);
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        ...data,
        dateTime: { S: now.getTime().toString() },
        TTL: { N: TTL.toString() },
      },
    };

    try {
      await this.client.putItem(params);
    } catch (error) {
      console.error(error, (error as Error).stack);
    }
  }

  async getRecordsByPartition(partition: string): Promise<Record<string, AttributeValue>[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#partitionKey = :partitionKey',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
      },
      ExpressionAttributeValues: {
        ':partitionKey': { S: partition },
      },
    };
    try {
      const data = await this.client.query(params);
      if (!data || Number(data.Count) < 1) return [];
      if (!data.Items) return [];
      return data.Items;
    } catch (error) {
      console.error(error, (error as Error).stack);
      return [];
    }
  }

  async getRecordByPartitionAndId(partition: string, id: string): Promise<Record<string, AttributeValue> | null> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#partitionKey = :partitionKey and #id = :id',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
        '#id': 'id',
      },
      ExpressionAttributeValues: {
        ':partitionKey': { S: partition },
        ':id': { S: id },
      },
    };
    try {
      const data = await this.client.query(params);
      if (!data || Number(data.Count) < 1) return null;
      if (!data.Items) return null;
      return data.Items[0];
    } catch (error) {
      console.error(error, (error as Error).stack);
      return null;
    }
  }
}

export class DynamoDBFactory {
  static singleton: DynamoDBWrapper;
  static create(): DynamoDBWrapper {
    if (!this.singleton) {
      this.singleton = new DynamoDBWrapper();
    }
    return this.singleton;
  }

  static createWithClient(client: DynamoDB): DynamoDBWrapper {
    return new DynamoDBWrapper(client);
  }
}
