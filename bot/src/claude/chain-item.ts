import { ChatRoles } from "./chat-roles.enum";

export class ChainItem {
  constructor(
    public readonly role: ChatRoles,
    public readonly content: string,
  ) {}
}
