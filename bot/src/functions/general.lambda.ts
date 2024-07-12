import http from 'serverless-http';

import 'dotenv/config';
import { Config } from '../config/config';
Config.init();
import { Telegraf } from 'telegraf';
import { GeneralCommands } from '../bot/general/general.commands';
import { GeneralBot } from '../bot/general.bot';
import { Memory } from '../bot/memory/memory';
import { TTSWrapper } from '../ai/elevenlabs/tts-wrapper';
import { ChatDynamoDBWrapper } from '../db/chat.dynamodb';
Config.validate(false);
const generalCommands = new GeneralCommands(new Telegraf(Config.TELEGRAM_BOT_TOKEN));
const db = new ChatDynamoDBWrapper();
const memory = new Memory(db);
generalCommands.setMemory(memory);
generalCommands.setTtsWrapper(new TTSWrapper(Config.ELEVENLABS_API_KEY));
const generalBot = new GeneralBot('General Bot', 'General bot for all users', generalCommands);

export const serverlessBot = http(generalBot.webhookCallback('/', { secretToken: Config.TELEGRAM_SECRET_TOKEN }));

// Enable graceful stop
process.once('SIGINT', () => generalBot.stop('SIGINT'));
process.once('SIGTERM', () => generalBot.stop('SIGTERM'));
console.log('Started bot!');
