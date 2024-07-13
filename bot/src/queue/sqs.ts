import { SendMessageCommand, SendMessageCommandInput, SendMessageCommandOutput, SQSClient } from '@aws-sdk/client-sqs';
import { Config } from '../config/config';

export class SQSWrapper {
  private sqsClient: SQSClient;
  private queueUrl: string;
  constructor(client?: SQSClient) {
    this.sqsClient = client || new SQSClient({ credentials: Config.AWS_CREDENTIALS as any });
    this.queueUrl = Config.QUEUE_URL;
  }

  async sendMessage(message: string): Promise<SendMessageCommandOutput> {
    const params: SendMessageCommandInput = {
      QueueUrl: this.queueUrl,
      MessageBody: message,
      MessageGroupId: 'conversation',
    };
    console.debug('Sending message to SQS', params);
    return this.sqsClient.send(new SendMessageCommand(params));
  }
}
