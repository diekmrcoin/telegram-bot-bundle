import { Express, Request, Response } from 'express';
import { LoginService } from './login.service';
import { Config } from '../../../config/config';

export class LoginController {
  private controllerPath = '/login';
  private loginService: LoginService;
  constructor(
    private app: Express,
    loginService?: LoginService,
  ) {
    this.loginService = loginService || new LoginService();
    this.registerRoutes();
  }

  protected registerRoutes() {
    this.app.post(`${this.controllerPath}/request-login-code`, this.requestLoginCode.bind(this));
    this.app.post(`${this.controllerPath}/verify-login`, this.verifyLogin.bind(this));
  }

  checkAndSetDebug(req: Request) {
    const debug = req.query.debug === 'true';
    this.loginService.setDebug(debug);
  }

  allowEmail(email: string): boolean {
    return Config.LOGIN_ALLOWED_EMAILS.includes(email);
  }

  async requestLoginCode(req: Request, res: Response) {
    this.checkAndSetDebug(req);
    const allow = this.allowEmail(req.body.email);
    if (!allow) {
      return res.status(403).send({ message: 'Email not allowed' });
    }
    const email = req.body.email;
    if (!email) {
      return res.status(400).send({ message: 'Email is required' });
    }
    const success = await this.loginService.sendLoginCode(email);
    if (success) {
      return res.send({ message: 'Login code sent' });
    } else {
      return res.status(500).send({ message: 'Failed to send login code' });
    }
  }

  async verifyLogin(req: Request, res: Response) {
    this.checkAndSetDebug(req);
    const email = req.body.email;
    const code = req.body.code;
    if (!email || !code) {
      return res.status(400).send({ message: 'Email and code are required' });
    }
    const success = await this.loginService.login(email, code);
    if (success) {
      return res.send({ message: 'Login successful' });
    } else {
      return res.status(403).send({ message: 'Login failed' });
    }
  }
}
