import { AttributeValue, PutItemCommandInput, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { DynamoDBWrapper } from './dynamodb';

export class LoginDynamoDBWrapper {
  private wrapper: DynamoDBWrapper;
  private _tableName = 'synergysys-dev-dynamo-api';
  constructor(wrapper?: DynamoDBWrapper, tableName?: string) {
    this.wrapper = wrapper || new DynamoDBWrapper();
    this.wrapper.tableName = tableName || this._tableName;
  }

  async addRecord(data: Record<string, AttributeValue>) {
    const now = new Date();
    // TTL 12 hours, in seconds
    const TTL = Math.floor((now.getTime() + 12 * 60 * 60 * 1000) / 1000);
    const email = data.email!.S!;
    const code = data.code!.S!;
    const params: PutItemCommandInput = {
      TableName: this.wrapper.tableName,
      Item: {
        partition: { S: `login_code` },
        id: { S: email },
        dateTime: { S: now.getTime().toString() },
        code: { S: code },
        TTL: { N: TTL.toString() },
      },
    };

    try {
      await this.wrapper.client.putItem(params);
      console.log(`Código login añadido para el usuario: ${email}`);
    } catch (error) {
      console.error(`Error al añadir registro: ${error}`);
      console.error((error as Error).stack);
      console.error('Error item:', params.Item);
    }
  }

  async getRecord(email: string): Promise<Record<string, AttributeValue>[]> {
    const params: QueryCommandInput = {
      TableName: this.wrapper.tableName,
      KeyConditionExpression: '#partitionKey = :partitionKey AND #id = :id',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
        '#id': 'id',
      },
      ExpressionAttributeValues: {
        ':partitionKey': { S: `login_code` },
        ':id': { S: email },
      },
    };
    try {
      const data = await this.wrapper.client.query(params);
      if (!data || Number(data.Count) < 1) return [];
      if (!data.Items) return [];
      return data.Items;
    } catch (error) {
      console.error(`Error al obtener registro: ${error}`);
      console.error((error as Error).stack);
      return [];
    }
  }
}
