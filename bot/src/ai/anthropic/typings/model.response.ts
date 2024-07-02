import { Usage } from "@anthropic-ai/sdk/resources/messages";

export interface ModelResponse {
  usage: Usage;
  message: string;
}
