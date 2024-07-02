import http from 'serverless-http';

import 'dotenv/config';
import { Config } from '../config/config';
import { Telegraf } from 'telegraf';
import { GeneralCommands } from '../bot/general/general.commands';
import { GeneralBot } from '../bot/general.bot';
import { DynamoDBWrapper } from '../db/dynamodb';
import { Memory } from '../bot/memory/memory';
Config.validate(false);
const generalCommands = new GeneralCommands(new Telegraf(Config.TELEGRAM_BOT_TOKEN));
const db = new DynamoDBWrapper();
const memory = new Memory(db);
generalCommands.setMemory(memory);
const generalBot = new GeneralBot('General Bot', 'General bot for all users', generalCommands);

export const serverlessBot = http(generalBot.webhookCallback('/', { secretToken: Config.TELEGRAM_SECRET_TOKEN }));

// Enable graceful stop
process.once('SIGINT', () => generalBot.stop('SIGINT'));
process.once('SIGTERM', () => generalBot.stop('SIGTERM'));
console.log('Started bot!');
