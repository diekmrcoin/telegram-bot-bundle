import {
  AttributeValue,
  BatchWriteItemCommandInput,
  DynamoDB,
  PutItemCommandInput,
  QueryCommandInput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { Config } from '../config/config';

export class DynamoDBWrapper {
  private tableName = 'synergysys-dev-dynamo-ai-bot-memory';
  private region = 'eu-west-3';
  private client: DynamoDB;
  constructor() {
    this.client = new DynamoDB({ region: this.region, credentials: Config.AWS_CREDENTIALS as any });
  }
  private genId(i = 0): string {
    // rangeKey is datetime + 5 random number to avoid conflicts with
    return `${new Date().getTime()}_${i}_${Math.floor(Math.random() * 100000)}`;
  }

  async addChatRecord(data: Record<string, AttributeValue>) {
    const now = new Date();
    const id = this.genId();
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: {
        ...data,
        partition: { S: `chat_${data.chatId.S}` },
        id: { S: id },
        dateTime: { S: now.getTime().toString() },
      },
    };

    try {
      await this.client.putItem(params);
      console.log(`Registro añadido para el usuario: ${data.username.S}`);
    } catch (error) {
      console.error(`Error al añadir registro: ${error}`);
      console.error((error as Error).stack);
    }
  }

  async addChatRecords(dataItems: Record<string, AttributeValue>[]) {
    const chunkSize = 25; // DynamoDB batchWrite limit
    for (let i = 0; i < dataItems.length; i += chunkSize) {
      const chunk = dataItems.slice(i, i + chunkSize);
      let elemIndex = 0;
      const requestItems = chunk.map((data): WriteRequest => {
        const now = new Date();
        const id = this.genId(elemIndex++);
        return {
          PutRequest: {
            Item: {
              ...data,
              partition: { S: `chat_${data.chatId.S}` },
              id: { S: id },
              dateTime: { S: now.getTime().toString() },
            },
          },
        };
      });

      const params: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.tableName]: requestItems,
        },
      };

      try {
        await this.client.batchWriteItem(params);
        console.log(`Registros añadidos para ${chunk.length} usuarios`);
      } catch (error) {
        console.error(`Error al añadir registros: ${error}`);
        console.error((error as Error).stack);
      }
    }
  }

  async getChatRecord(chatId: string, amount?: number): Promise<Record<string, AttributeValue>[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#partitionKey = :partitionKey',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
      },
      ExpressionAttributeValues: {
        ':partitionKey': { S: `chat_${chatId}` },
      },
      Limit: amount || 10,
      ScanIndexForward: false,
    };
    try {
      const data = await this.client.query(params);
      if (!data || Number(data.Count) < 1) return [];
      if (!data.Items) return [];
      return data.Items.sort((a, b) => Number(a.dateTime.S) - Number(b.dateTime.S));
    } catch (error) {
      console.error(`Error al obtener registro: ${error}`);
      console.error((error as Error).stack);
      return [];
    }
  }

  async deleteChatRecord(chatId: string) {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#partitionKey = :partition',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
      },
      ExpressionAttributeValues: {
        ':partition': { S: `chat_${chatId}` },
      },
    };
    try {
      const data = await this.client.query(params);
      if (!data || Number(data.Count) < 1) return;
      if (!data.Items) return;
      const deleteParams: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.tableName]: data.Items.map((item) => ({
            DeleteRequest: {
              Key: {
                partition: item.partition,
                id: item.id,
              },
            },
          })),
        },
      };
      await this.client.batchWriteItem(deleteParams);
      console.log(`Registros eliminados para el usuario: ${chatId}`);
    } catch (error) {
      console.error(`Error al eliminar registro: ${error}`);
      console.error((error as Error).stack);
    }
  }
}
