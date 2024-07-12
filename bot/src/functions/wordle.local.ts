import { config } from 'dotenv';
// load .env.local file
config({ path: '.env.local' });
import { WordleBot } from '../bot/wordle.bot';
import { Config } from '../config/config';
Config.init();
import { Telegraf } from 'telegraf';
import { WordleCommands } from '../bot/wordle/wordle.commands';
const wordleBot = new WordleBot('Wordle', 'Wordle game', new WordleCommands(new Telegraf(Config.TELEGRAM_BOT_TOKEN)));
wordleBot.run();

// Enable graceful stop
process.once('SIGINT', () => wordleBot.stop('SIGINT'));
process.once('SIGTERM', () => wordleBot.stop('SIGTERM'));
console.log('Started bot!');
