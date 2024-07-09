import Anthropic from '@anthropic-ai/sdk';
import { TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { ChatRoles } from './typings/chat-roles.enum';
import { ClaudeModels } from './typings/models.emun';
import { ChainItem, ChainItemTool } from './typings/chain-item';
import { ModelResponse } from './typings/model.response';

export class ClaudeWrapping {
  private anthropic: Anthropic;
  private systemConfig: string;
  constructor(apiKey: string, systemConfig: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    this.systemConfig = systemConfig;
  }

  async sendMessage(
    message: string,
    prevChain: ChainItem[],
    model: ClaudeModels,
    tools: Anthropic.Messages.Tool[],
  ): Promise<ModelResponse> {
    const chain: ChainItem[] = [
      ...prevChain,
      {
        role: ChatRoles.USER,
        content: message,
      },
    ];
    const answer: Anthropic.Messages.Message = await this.anthropic.messages.create({
      max_tokens: 1024,
      system: this.systemConfig,
      messages: chain,
      model: model,
      tools: tools,
    });
    console.log('answer', answer);
    if (answer.content[1]) {
      console.log('content 1', JSON.stringify((answer.content[1] as any).input, null, 2));
    }
    return {
      usage: answer.usage,
      message: (answer.content[0] as TextBlock).text || 'error',
      tool: answer.content[1] ? (answer.content[1] as ModelResponse['tool']) : undefined,
    };
  }
}
