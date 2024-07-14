import {
  AttributeValue,
  BatchWriteItemCommandInput,
  PutItemCommandInput,
  QueryCommandInput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBFactory, DynamoDBWrapper } from './dynamodb';

export class ChatDynamoDBWrapper {
  private wrapper: DynamoDBWrapper;
  readonly tableName = 'synergysys-dev-dynamo-api';
  constructor(wrapper?: DynamoDBWrapper, tableName?: string) {
    this.wrapper = wrapper || DynamoDBFactory.create();
    this.wrapper.tableName = tableName || this.tableName;
  }

  genId(i = 0): string {
    // rangeKey is datetime + 5 random number to avoid conflicts with
    const id = `${new Date().getTime()}_${i}_${Math.floor(Math.random() * 100000)}`;
    // sometimes the it hasn't all the chars, fill with 0 at the end, 21 of length
    return id.padEnd(21, '0');
  }

  async addChatRecord(data: Record<string, AttributeValue>) {
    const now = new Date();
    const id = this.genId();
    const params: PutItemCommandInput = {
      TableName: this.wrapper.tableName,
      Item: {
        ...data,
        partition: { S: `chat_${data.user.S}` },
        id: { S: id },
        dateTime: { S: now.getTime().toString() },
      },
    };

    try {
      await this.wrapper.client.putItem(params);
      console.log(`Registro añadido para el usuario: ${data.user.S}`);
    } catch (error) {
      console.error(`Error al añadir registro: ${error}`);
      console.error((error as Error).stack);
      console.error('Error item:', params.Item);
    }
  }

  async addChatRecords(dataItems: Record<string, AttributeValue>[]) {
    let itemTemp = null;
    const chunkSize = 25; // DynamoDB batchWrite limit
    for (let i = 0; i < dataItems.length; i += chunkSize) {
      const chunk = dataItems.slice(i, i + chunkSize);
      let elemIndex = 0;
      const requestItems = chunk.map((data): WriteRequest => {
        const now = new Date();
        const id = this.genId(elemIndex++);
        const item = {
          PutRequest: {
            Item: {
              ...data,
              partition: { S: `chat_${data.user.S}` },
              id: { S: id },
              dateTime: { S: now.getTime().toString() },
            },
          },
        };
        itemTemp = item.PutRequest.Item;
        return item;
      });

      const params: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.wrapper.tableName]: requestItems,
        },
      };

      try {
        await this.wrapper.client.batchWriteItem(params);
        console.log(`Registros añadidos para ${chunk.length} usuarios`);
      } catch (error) {
        console.error(`Error al añadir registros: ${error}`);
        console.error((error as Error).stack);
        console.error('Error item:', itemTemp);
      }
    }
  }

  async getChatRecord(user: string, chatId: string, amount?: number): Promise<Record<string, AttributeValue>[]> {
    const params: QueryCommandInput = {
      TableName: this.wrapper.tableName,
      KeyConditionExpression: '#partitionKey = :partitionKey',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
      },
      ExpressionAttributeValues: {
        ':partitionKey': { S: `chat_${user}` },
      },
      Limit: amount || 10,
      ScanIndexForward: false,
    };
    try {
      const data = await this.wrapper.client.query(params);
      if (!data || Number(data.Count) < 1) return [];
      if (!data.Items) return [];
      // filter by chatId
      const items = data.Items.filter((item) => item.chatId.S === chatId);
      // order asc by .id as string natural comparing
      return items.sort((a: any, b: any) => a.id.S.localeCompare(b.id.S));
    } catch (error) {
      console.error(`Error al obtener registro: ${error}`);
      console.error((error as Error).stack);
      return [];
    }
  }

  async deleteChatRecord(username: string, chatId: string) {
    const params: QueryCommandInput = {
      TableName: this.wrapper.tableName,
      KeyConditionExpression: '#partitionKey = :partition AND #chatId = :chatId',
      ExpressionAttributeNames: {
        '#partitionKey': 'partition',
        '#chatId': 'chatId',
      },
      ExpressionAttributeValues: {
        ':partition': { S: `chat_${username}` },
        ':chatId': { S: chatId },
      },
    };
    try {
      const data = await this.wrapper.client.query(params);
      if (!data || Number(data.Count) < 1) return;
      if (!data.Items) return;
      const deleteParams: BatchWriteItemCommandInput = {
        RequestItems: {
          [this.wrapper.tableName]: data.Items.map((item) => ({
            DeleteRequest: {
              Key: {
                partition: item.partition,
                id: item.id,
              },
            },
          })),
        },
      };
      await this.wrapper.client.batchWriteItem(deleteParams);
      console.log(`Registros eliminados para el usuario: ${username}`);
    } catch (error) {
      console.error(`Error al eliminar registro: ${error}`);
      console.error((error as Error).stack);
    }
  }
}
