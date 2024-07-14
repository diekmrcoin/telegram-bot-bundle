import { Length, validateOrReject } from 'class-validator';

export class PublishMessageRequestDto {
  @Length(1, 128)
  message: string;
  @Length(1, 32)
  chatId: string;
  user: string;
  timestamp: number;
  constructor(data: any) {
    this.message = data.message;
    this.chatId = data.chatId;
    this.user = data.user;
    this.timestamp = data.timestamp;
  }

  validate(): Promise<void> {
    return validateOrReject(this);
  }
}

export class GetMessagesRequestDto {
  @Length(1, 32)
  chatId: string;
  user: string;
  constructor(data: any) {
    this.chatId = data.chatId;
    this.user = data.user;
  }

  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
