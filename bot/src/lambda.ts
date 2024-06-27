import http from 'serverless-http';

import 'dotenv/config';
import { Bot } from './bot/bot';
import { Config } from './config/config';
import { ClaudeAI } from './claude/claude';
import { Memory } from './claude/memory';
import { DynamoDBWrapper } from './db/dynamodb';
Config.validate(false);
const db = new DynamoDBWrapper();
const memory = new Memory(db);
const claude = new ClaudeAI(Config.CLAUDE_API_KEY, memory);
const bot = new Bot(Config.TELEGRAM_BOT_TOKEN, claude);
// // Temporary return 200
// export const serverlessBot = async (event: any) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: 'Bot is running!' }),
//   };
// };
// setup webhook
export const serverlessBot = http(bot.webhookCallback('/', { secretToken: Config.TELEGRAM_SECRET_TOKEN }));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
console.log('Started bot!');
