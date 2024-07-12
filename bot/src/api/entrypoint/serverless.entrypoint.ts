import serverless from 'serverless-http';
import { app } from './express';

import 'dotenv';
import { Config } from '../../config/config';
Config.init();

export const handler = serverless(app);
