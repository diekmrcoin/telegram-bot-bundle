import { ApiDynamoDBWrapper } from '../../../db/api.dynamodb';
import { HttpInternalServerErrorException } from '../../../http/http.exception';
import { SESWrapper } from '../../../mail/ses';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
import { Config } from '../../../config/config';

export class LoginService {
  private sesClient: SESWrapper;
  private dynamodb: ApiDynamoDBWrapper;
  constructor(dynamodb?: ApiDynamoDBWrapper, sesClient?: SESWrapper) {
    this.dynamodb = dynamodb || new ApiDynamoDBWrapper();
    this.sesClient = sesClient || new SESWrapper();
  }

  public async sendLoginCode(email: string): Promise<boolean> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const id = uuidv4();
    const token = sign({ id, email, code }, Config.JWT_SECRET, { expiresIn: '12h' });
    try {
      await this.addLoginRecord(id, token, email, code);
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to add login record', error as Error);
    }
    const subject = 'Login code';
    const body = [
      `Your login code is: <strong>${code}</strong>.`,
      '<i>Please use this code to login, if login through website.</i><br>',
      `Your token is: <strong>${token}</strong>`,
      '<hr>',
      `You can use it like:<br><i>Authorization: Bearer ${token}</i>`,
      '<hr>',
      '<i>Please use this token to authenticate your api calls.</i>',
      '<strong>The code and token will expire in 12 hours.</strong>',
    ].join('<br>');
    try {
      await this.sesClient.sendEmail('login', 'Login', email, subject, body);
      return true;
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to send email', error as Error);
    }
  }

  private async addLoginRecord(id: string, token: string, email: string, code: string): Promise<void> {
    return await this.dynamodb.addLoginRecord(id, token, email, code);
  }
}
