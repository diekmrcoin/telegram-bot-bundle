import { SESWrapper } from '../../../mail/ses';

export class LoginService {
  private client: SESWrapper;
  public _debug = false;
  constructor(client?: SESWrapper) {
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
}
