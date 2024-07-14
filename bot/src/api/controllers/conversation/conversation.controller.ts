import { Express, NextFunction, Request, Response } from 'express';
import { ConversationService } from './conversation.service';
import { HttpExpress } from '../../../http/http.express';
import { JwtPayloadValidator, TokenGuard } from '../../guards/token.guard';
import { GetMessagesRequestDto, PublishMessageRequestDto } from './input.dto';
import { ValidationError } from 'class-validator';

export class ConversationController {
  private controllerPath = '/conversation';
  private conversationService: ConversationService;
  constructor(
    private app: Express,
    conversationService?: ConversationService,
  ) {
    this.conversationService = conversationService || new ConversationService();
    this.registerRoutes();
  }

  protected registerRoutes() {
    this.app.get(`${this.controllerPath}/messages/:chatId`, this.getMessages.bind(this));
    this.app.post(`${this.controllerPath}/publish-message`, this.publishMessage.bind(this));
    // this.app.post(`${this.controllerPath}/check-response`, this.checkResponse.bind(this));
  }

  @TokenGuard()
  async getMessages(req: Request, res: Response) {
    const input = new GetMessagesRequestDto({
      chatId: req.params.chatId,
      user: (req as any).jwtPayload.email,
    });
    try {
      await input.validate();
    } catch (error) {
      return HttpExpress.badRequest(res, (error as any).toString());
    }
    try {
      const messages = await this.conversationService.getMessages(input.user, input.chatId);
      return HttpExpress.ok(res, messages);
    } catch (error) {
      return HttpExpress.exception(res, error);
    }
  }

  @TokenGuard()
  async publishMessage(req: Request, res: Response, next: NextFunction) {
    const input = new PublishMessageRequestDto({
      message: req.body.message,
      chatId: req.body.chatId,
      user: (req as any).jwtPayload.email,
      timestamp: Date.now(),
    });
    try {
      await input.validate();
    } catch (error) {
      return HttpExpress.badRequest(res, (error as ValidationError[]).toString());
    }
    try {
      const messageId = await this.conversationService.publishMessage(JSON.stringify(input));
      return HttpExpress.ok(res, { messageId });
    } catch (error) {
      return HttpExpress.exception(res, error);
    }
  }

  async checkResponse(req: Request, res: Response) {
    return HttpExpress.notImplemented(res);
  }
}
