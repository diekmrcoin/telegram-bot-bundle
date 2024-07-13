import { Express, Request, Response } from 'express';
import { LoginService } from './login.service';
import { Config } from '../../../config/config';
import { HttpExpress } from '../../../http/http.express';
import { RequestLoginCodeDto, VerifyLoginRequestDto } from './input.dto';

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
    // FIXME: Use the code to get an jwt for further requests
    this.app.post(`${this.controllerPath}/request-login-code`, this.requestLoginCode.bind(this));
    this.app.post(`${this.controllerPath}/verify-login`, this.verifyLogin.bind(this));
  }

  allowEmail(email: string): boolean {
    return Config.LOGIN_ALLOWED_EMAILS.includes(email);
  }

  async requestLoginCode(req: Request, res: Response) {
    const input = new RequestLoginCodeDto(req.body);
    try {
      await input.validate();
    } catch (error) {
      return HttpExpress.badRequest(res, (error as any).toString());
    }
    const allow = this.allowEmail(input.email);
    if (!allow) {
      console.debug(`Email not allowed: ${input.email}`);
      return HttpExpress.forbidden(res, 'Email not allowed');
    }
    let success = false;
    try {
      success = await this.loginService.sendLoginCode(input.email);
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
    const input = new VerifyLoginRequestDto(req.body);
    try {
      await input.validate();
    } catch (error) {
      return HttpExpress.badRequest(res, (error as any).toString());
    }
    let success = false;
    try {
      success = await this.loginService.login(input.email, input.code);
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
