import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';

import { DebugController } from '../controllers/debug/debug.controller';
import { HomeController } from '../controllers/home/home.controller';
import { LoginController } from '../controllers/login/login.controller';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

new HomeController(app);
new DebugController(app);
new LoginController(app);

export { app };
