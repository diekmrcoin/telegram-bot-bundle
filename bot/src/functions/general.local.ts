import { config } from 'dotenv';
// load .env.local file
config({ path: '.env.local' });
import { Config } from '../config/config';
import { Telegraf } from 'telegraf';
import { GeneralCommands } from '../bot/general/general.commands';
import { GeneralBot } from '../bot/general.bot';
Config.validate(false);
const wordleBot = new GeneralBot('Wordle', 'Wordle game', new GeneralCommands(new Telegraf(Config.TELEGRAM_BOT_TOKEN)));
wordleBot.run();

// Enable graceful stop
process.once('SIGINT', () => wordleBot.stop('SIGINT'));
process.once('SIGTERM', () => wordleBot.stop('SIGTERM'));
console.log('Started bot!');
