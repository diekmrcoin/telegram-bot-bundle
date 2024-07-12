import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Config } from '../config/config';

export class DynamoDBWrapper {
  readonly tableName = 'synergysys-dev-dynamo-ai-bot-memory';
  private region = 'eu-west-3';
  readonly client: DynamoDB;

  constructor(client?: DynamoDB) {
    this.client = client || new DynamoDB({ region: this.region, credentials: Config.AWS_CREDENTIALS as any });
  }
}
