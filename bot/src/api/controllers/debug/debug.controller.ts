import { Express } from 'express';
import { DebugService } from './debug.service';

export class DebugController {
  private controllerPath = '/debug';
  private debugService: DebugService;
  constructor(
    private app: Express,
    debugService?: DebugService,
  ) {
    this.debugService = debugService || new DebugService();
    this.registerRoutes();
  }

  protected registerRoutes() {
    this.app.get(this.controllerPath, (req, res) => {
      console.log('Received request');
      res.send({ message: 'Received request' });
    });
  }
}
