import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';

import 'dotenv/config';
import { Config } from '../../config/config';
Config.init();

import { DebugController } from '../controllers/debug/debug.controller';
import { HomeController } from '../controllers/home/home.controller';
import { LoginController } from '../controllers/login/login.controller';
import { DynamoDBFactory } from '../../db/dynamodb';
import { LoginService } from '../controllers/login/login.service';
import { ApiDynamoDBWrapper } from '../../db/api.dynamodb';
import { DebugService } from '../controllers/debug/debug.service';
import { HomeService } from '../controllers/home/home.service';
import { ChatDynamoDBWrapper } from '../../db/chat.dynamodb';
import { ConversationController } from '../controllers/conversation/conversation.controller';
import { ConversationService } from '../controllers/conversation/conversation.service';

const db = DynamoDBFactory.create();
const apiDb = new ApiDynamoDBWrapper(db);
const chatDb = new ChatDynamoDBWrapper(db, apiDb.tableName);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

new HomeController(app, new HomeService());
new DebugController(app, new DebugService());
new LoginController(app, new LoginService(apiDb));
new ConversationController(app, new ConversationService());

export { app };
