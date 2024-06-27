import { config } from 'dotenv';
// load .env.local file
config({ path: '.env.local' });
import { WordleBot } from '../bot/wordle.bot';
import { Config } from '../config/config';
import { Telegraf } from 'telegraf';
import { WordleCommands } from '../bot/wordle/wordle.commands';
Config.validate(false);
const telegrafBot = new Telegraf(Config.TELEGRAM_BOT_TOKEN);
const bot = new WordleBot('Wordle', 'Wordle game', telegrafBot, new WordleCommands(telegrafBot));
bot.run();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
console.log('Started bot!');
