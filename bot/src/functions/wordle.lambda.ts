import http from 'serverless-http';

import 'dotenv/config';
import { Config } from '../config/config';
import { WordleBot } from '../bot/wordle.bot';
import { Telegraf } from 'telegraf';
import { WordleCommands } from '../bot/wordle/wordle.commands';
Config.validate(false);
const wordleBot = new WordleBot(
  'Wordle',
  'Wordle game bot',
  new WordleCommands(new Telegraf(Config.TELEGRAM_BOT_TOKEN)),
);
// // Temporary return 200
// export const serverlessBot = async (event: any) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: 'Bot is running!' }),
//   };
// };
// setup webhook
export const serverlessBot = http(wordleBot.webhookCallback('/', { secretToken: Config.TELEGRAM_SECRET_TOKEN }));

// Enable graceful stop
process.once('SIGINT', () => wordleBot.stop('SIGINT'));
process.once('SIGTERM', () => wordleBot.stop('SIGTERM'));
console.log('Started bot!');
