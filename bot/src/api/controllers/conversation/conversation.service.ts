import { HttpInternalServerErrorException } from '../../../http/http.exception';
import { SQSWrapper } from '../../../queue/sqs';

export class ConversationService {
  private sqsCLient: SQSWrapper;
  constructor(sqsClient?: SQSWrapper) {
    this.sqsCLient = sqsClient || new SQSWrapper();
  }
  async getMessages() {
    return [];
  }

  async publishMessage(message: string): Promise<string> {
    let data;
    try {
      data = await this.sqsCLient.sendMessage(message);
      if (!data.MessageId) {
        throw new HttpInternalServerErrorException('Failed to send message', new Error('No message id'));
      }
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to send message', error as Error);
    }
    return data.MessageId;
  }

  async checkResponse() {
    return true;
  }
}
