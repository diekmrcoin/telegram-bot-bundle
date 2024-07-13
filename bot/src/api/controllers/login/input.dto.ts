import { Length, validateOrReject } from 'class-validator';

export class RequestLoginCodeDto {
  @Length(1, 128)
  email: string;
  constructor(data: any) {
    this.email = data.email;
  }

  validate(): Promise<void> {
    return validateOrReject(this);
  }
}

export class VerifyLoginRequestDto {
  @Length(1, 128)
  email: string;
  @Length(1, 6)
  code: string;
  constructor(data: any) {
    this.email = data.email;
    this.code = data.code;
  }

  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
