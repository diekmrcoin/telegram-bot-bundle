import { ApiDynamoDBWrapper } from '../../../db/api.dynamodb';
import { SESWrapper } from '../../../mail/ses';

export class LoginService {
  private client: SESWrapper;
  private dynamodb: ApiDynamoDBWrapper;
  public _debug = false;
  constructor(dynamodb?: ApiDynamoDBWrapper, client?: SESWrapper) {
    this.dynamodb = dynamodb || new ApiDynamoDBWrapper();
    this.client = client || new SESWrapper();
  }

  setDebug(debug: boolean) {
    this._debug = debug;
  }

  private debugLog(message: string) {
    if (this._debug) {
      console.debug(message);
    }
  }

  public async sendLoginCode(email: string): Promise<boolean> {
    const code = Math.floor(100000 + Math.random() * 900000);
    const subject = 'Login code';
    const body = `Your login code is: ${code}`;

    try {
      await this.addLoginRecord(email, code.toString());
    } catch (error) {
      console.error(error, (error as Error).stack);
      return false;
    }

    try {
      const response = await this.client.sendEmail('login', 'Login', email, subject, body);
      this.debugLog(`Email sent to ${email} with code ${code}`);
      this.debugLog('Response:');
      this.debugLog(JSON.stringify(response, null, 2));
      return true;
    } catch (error) {
      console.error(error, (error as Error).stack);
      return false;
    }
  }

  public async login(email: string, code: string): Promise<boolean> {
    try {
      const verified = await this.verifyCode(email, code);
      return verified;
    } catch (error) {
      console.error(error, (error as Error).stack);
      return false;
    }
  }

  private async addLoginRecord(email: string, code: string): Promise<void> {
    return await this.dynamodb.addLoginRecord(email, code);
  }

  private async getLoginRecord(email: string): Promise<string[]> {
    const data = await this.dynamodb.getLoginRecords(email);
    return data.map((item) => item.code.S!).filter((code) => !!code);
  }

  private async verifyCode(email: string, code: string): Promise<boolean> {
    const record = await this.dynamodb.getLoginRecord(email, code);
    return !!record;
  }
}
