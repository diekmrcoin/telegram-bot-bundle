import { Express } from 'express';
import { HomeService } from './home.service';

export class HomeController {
  private controllerPath = '/';
  private homeService: HomeService;
  constructor(
    private app: Express,
    homeService?: HomeService,
  ) {
    this.homeService = homeService || new HomeService();
    this.registerRoutes();
  }

  protected registerRoutes() {
    this.app.get(this.controllerPath, (req, res) => {
      res.send({ message: 'Hello world!' });
    });
  }
}
