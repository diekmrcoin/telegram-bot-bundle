import { Express, Request, Response } from 'express';
import { ConversationService } from './conversation.service';

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

  protected registerRoutes() {}

  async getMessages(req: Request, res: Response) {}

  async publishMessage(req: Request, res: Response) {}

  async checkResponse(req: Request, res: Response) {}
}
