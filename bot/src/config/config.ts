export class Config {
  protected static _TELEGRAM_BOT_TOKEN: string = '';
  protected static _TELEGRAM_SECRET_TOKEN: string = '';
  protected static _CLAUDE_API_KEY: string = '';
  protected static _ELEVENLABS_API_KEY: string = '';
  // TODO: migrate this to a dynamodb record
  protected static _TELEGRAM_ALLOWED_CHAT_IDS: number[] = [];
  // TODO: migrate this to a dynamodb record
  protected static _TELEGRAM_ADMIN_CHAT_IDS: number[] = [];
  protected static _AWS_CREDENTIALS = {
    accessKeyId: '',
    secretAccessKey: '',
  };
  protected static _PORT: number = 3000;
  protected static _LOGIN_ALLOWED_EMAILS: string[] = [];

  public static init() {
    Config._TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    Config._TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN || '';
    Config._CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
    Config._ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
    Config._TELEGRAM_ALLOWED_CHAT_IDS = (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
      .split(',')
      .filter((id) => id !== '')
      .map(Number);
    Config._TELEGRAM_ADMIN_CHAT_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '')
      .split(',')
      .filter((id) => id !== '')
      .map(Number);
    Config._AWS_CREDENTIALS = {
      accessKeyId: process.env.AWS_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_SECRET_KEY || '',
    };
    Config._PORT = Number(process.env.PORT) || 3000;
    Config._LOGIN_ALLOWED_EMAILS = (process.env.LOGIN_ALLOWED_EMAILS || '').split(',').filter((email) => email !== '');
  }

  public static get TELEGRAM_BOT_TOKEN(): string {
    return Config._TELEGRAM_BOT_TOKEN;
  }

  public static get TELEGRAM_SECRET_TOKEN(): string {
    return Config._TELEGRAM_SECRET_TOKEN;
  }

  public static get CLAUDE_API_KEY(): string {
    return Config._CLAUDE_API_KEY;
  }

  public static get ELEVENLABS_API_KEY(): string {
    return Config._ELEVENLABS_API_KEY;
  }

  public static get TELEGRAM_ALLOWED_CHAT_IDS(): number[] {
    return Config._TELEGRAM_ALLOWED_CHAT_IDS;
  }

  public static get TELEGRAM_ADMIN_CHAT_IDS(): number[] {
    return Config._TELEGRAM_ADMIN_CHAT_IDS;
  }

  public static get AWS_CREDENTIALS(): { accessKeyId: string; secretAccessKey: string } | undefined {
    return Config._AWS_CREDENTIALS.accessKeyId ? Config._AWS_CREDENTIALS : undefined;
  }

  public static get PORT(): number {
    return Config._PORT;
  }

  public static get LOGIN_ALLOWED_EMAILS(): string[] {
    return Config._LOGIN_ALLOWED_EMAILS;
  }

  public static validate(fail: boolean): boolean {
    if (!Config.TELEGRAM_BOT_TOKEN) {
      if (fail) {
        console.error('TELEGRAM_BOT_TOKEN is required');
        throw new Error('TELEGRAM_BOT_TOKEN is required');
      }
      return false;
    }
    if (!Config.CLAUDE_API_KEY) {
      if (fail) {
        console.error('CLAUDE_API_KEY is required');
        throw new Error('CLAUDE_API_KEY is required');
      }
      return false;
    }
    if (!Config.TELEGRAM_SECRET_TOKEN) {
      if (fail) {
        console.error('TELEGRAM_SECRET_TOKEN is required');
        throw new Error('TELEGRAM_SECRET_TOKEN is required');
      }
      return false;
    }
    return true;
  }
}
