import { ChatRoles } from "./chat-roles.enum";

export interface ChainItem {
  role: ChatRoles;
  content: string;
}
