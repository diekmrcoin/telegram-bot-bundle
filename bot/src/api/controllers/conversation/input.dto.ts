import { Length, validateOrReject } from 'class-validator';

export class PublishMessageRequestDto {
  @Length(1, 128)
  message: string;
  @Length(1, 32)
  chatId: string;
  constructor(data: any) {
    this.message = data.message;
    this.chatId = data.chatId;
  }

  validate(): Promise<void> {
    return validateOrReject(this);
  }
}

export class GetMessagesRequestDto {
  @Length(1, 32)
  chatId: string;
  constructor(data: any) {
    this.chatId = data.chatId;
  }

  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
