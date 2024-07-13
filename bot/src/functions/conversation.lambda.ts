import 'dotenv/config';
import { Config } from '../config/config';
Config.init();

import { SQSEvent, SQSRecord } from './typings/sqs.event';
import { ApiDynamoDBWrapper } from '../db/api.dynamodb';
import { DynamoDBFactory } from '../db/dynamodb';
import { ChatDynamoDBWrapper } from '../db/chat.dynamodb';
import { ClaudeWrapping } from '../ai/anthropic/claude-wrapping';
import { Memory } from '../bot/memory/memory';
import { ChatItem } from '../bot/memory/typings/chat-item';
import { ChatRoles } from '../ai/anthropic/typings/chat-roles.enum';
import { ClaudeModels } from '../ai/anthropic/typings/models.emun';
import { ModelResponse } from '../ai/anthropic/typings/model.response';

const apiDynamo = new ApiDynamoDBWrapper(DynamoDBFactory.create());
const chatDynamo = new ChatDynamoDBWrapper(DynamoDBFactory.create());
const memory = new Memory(chatDynamo);
const systemAI = [
  "You're role-playing.",
  'You are in a detective game.',
  'You are one of the suspects and the player is going to ask you questions.',
  "Your personality is cocky and you do not accept the player's authority.",
  "The interface is pure text, don't format, don't use emojis.",
].join('\n');
const claude = new ClaudeWrapping(Config.CLAUDE_API_KEY, systemAI);

export const handler = async (event: SQSEvent, context: any, callback: any): Promise<void> => {
  let record: SQSRecord = null as any;
  try {
    for (record of event.Records) {
      const body = JSON.parse(record.body);
      console.log(`Processing message: ${body}`);
      const chat = await memory.getMessages(body.chatId);
      const chainChat = chat.map((item) => ({
        role: item.role as ChatRoles,
        content: item.message,
      }));
      const answer: ModelResponse = await claude.sendMessage(body.message, chainChat, ClaudeModels.sonnet_3_5, []);
      const messages: ChatItem[] = [
        new ChatItem(body.chatId, 'player', body.message, ChatRoles.USER),
        new ChatItem(body.chatId, 'ai', answer.message, ChatRoles.ASSISTANT),
      ];
      await memory.addMessages(messages);
    }
    callback(null, 'Success');
  } catch (error) {
    console.error('Error on record:', record);
    console.error(`Error processing messages: ${error}`);
    callback(error);
  }
};
