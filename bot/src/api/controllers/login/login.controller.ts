import { Express, Request, Response } from 'express';
import { LoginService } from './login.service';
import { Config } from '../../../config/config';
import { HttpExpress } from '../../../http/http.express';

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
    // FIXME: Add login quota
    // FIXME: Add class-validator for request body
    this.app.post(`${this.controllerPath}/request-login-code`, this.requestLoginCode.bind(this));
    this.app.post(`${this.controllerPath}/verify-login`, this.verifyLogin.bind(this));
  }

  allowEmail(email: string): boolean {
    return Config.LOGIN_ALLOWED_EMAILS.includes(email);
  }

  async requestLoginCode(req: Request, res: Response) {
    const allow = this.allowEmail(req.body.email);
    if (!allow) {
      return HttpExpress.forbidden(res, 'Email not allowed');
    }
    const email = req.body.email;
    if (!email) {
      return HttpExpress.badRequest(res, 'Email is required');
    }
    let success = false;
    try {
      success = await this.loginService.sendLoginCode(email);
    } catch (error) {
      return HttpExpress.exception(res, error);
    }
    if (success) {
      return HttpExpress.created(res, 'Login code sent');
    } else {
      return HttpExpress.fatalError(res, new Error('Failed to send login code'));
    }
  }

  async verifyLogin(req: Request, res: Response) {
    const email = req.body.email;
    const code = req.body.code;
    if (!email || !code) {
      return HttpExpress.badRequest(res, 'Email and code are required');
    }
    let success = false;
    try {
      success = await this.loginService.login(email, code);
    } catch (error) {
      return HttpExpress.exception(res, error);
    }
    if (success) {
      return HttpExpress.ok(res, { message: 'Login successful' });
    } else {
      return HttpExpress.unauthorized(res, 'Login failed');
    }
  }
}
