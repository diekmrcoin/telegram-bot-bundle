import { config } from 'dotenv';
// load .env.local file
config({ path: '.env.local' });
import { Bot } from './bot/bot';
import { Config } from './config/config';
import { ClaudeAI } from './claude/claude';
import { DynamoDBWrapper } from './db/dynamodb';
import { Memory } from './claude/memory';
Config.validate(false);
const db = new DynamoDBWrapper();
const memory = new Memory(db);
const claude = new ClaudeAI(Config.CLAUDE_API_KEY, memory);
const bot = new Bot(Config.TELEGRAM_BOT_TOKEN, claude);
bot.run();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
console.log('Started bot!');
