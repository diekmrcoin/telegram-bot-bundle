import { ApiDynamoDBWrapper } from '../../../db/api.dynamodb';
import { HttpInternalServerErrorException } from '../../../http/http.exception';
import { SESWrapper } from '../../../mail/ses';

export class LoginService {
  private sesClient: SESWrapper;
  private dynamodb: ApiDynamoDBWrapper;
  public _debug = false;
  constructor(dynamodb?: ApiDynamoDBWrapper, sesClient?: SESWrapper) {
    this.dynamodb = dynamodb || new ApiDynamoDBWrapper();
    this.sesClient = sesClient || new SESWrapper();
  }

  public async sendLoginCode(email: string): Promise<boolean> {
    const code = Math.floor(100000 + Math.random() * 900000);
    const subject = 'Login code';
    const body = `Your login code is: ${code}`;

    try {
      await this.addLoginRecord(email, code.toString());
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to add login record', error as Error);
    }

    try {
      await this.sesClient.sendEmail('login', 'Login', email, subject, body);
      return true;
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to send email', error as Error);
    }
  }

  public async login(email: string, code: string): Promise<boolean> {
    const verified = await this.verifyCode(email, code);
    return verified;
  }

  private async addLoginRecord(email: string, code: string): Promise<void> {
    return await this.dynamodb.addLoginRecord(email, code);
  }

  private async getLoginRecord(email: string): Promise<string[]> {
    const data = await this.dynamodb.getLoginRecords(email);
    return data.map((item) => item.code.S!).filter((code) => !!code);
  }

  private async verifyCode(email: string, code: string): Promise<boolean> {
    let record;
    try {
      record = await this.dynamodb.getLoginRecord(email, code);
    } catch (error) {
      throw new HttpInternalServerErrorException('Failed to get login record', error as Error);
    }
    return !!record;
  }
}
