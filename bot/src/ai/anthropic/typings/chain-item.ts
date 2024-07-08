import { ChatRoles } from './chat-roles.enum';

export interface ChainItem {
  role: ChatRoles;
  content: string;
}

export interface ChainItemTool {
  role: ChatRoles;
  content: ItemToolResponse[];
}

export interface ItemToolResponse {
  type: string;
  tool_use_id: string;
  content: string;
}
