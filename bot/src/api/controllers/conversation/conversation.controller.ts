import { Express, Request, Response } from 'express';
import { ConversationService } from './conversation.service';
import { HttpExpress } from '../../../http/http.express';

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
    // FIXME: Add class-validator for request body
    // FIXME: Add guard decorators
    // this.app.get(`${this.controllerPath}/messages`, this.getMessages.bind(this));
    // this.app.post(`${this.controllerPath}/publish-message`, this.publishMessage.bind(this));
    // this.app.post(`${this.controllerPath}/check-response`, this.checkResponse.bind(this));
  }

  async getMessages(req: Request, res: Response) {
    return HttpExpress.notImplemented(res);
  }

  async publishMessage(req: Request, res: Response) {
    // FIXME: Don't allow new messages when there is a message in progress
    const message = req.body.message;
    if (!message) {
      return HttpExpress.badRequest(res, 'Message is required');
    }
    try {
      const messageId = await this.conversationService.publishMessage(message);
      return HttpExpress.ok(res, { messageId });
    } catch (error) {
      return HttpExpress.exception(res, error);
    }
  }

  async checkResponse(req: Request, res: Response) {
    return HttpExpress.notImplemented(res);
  }
}
