import { Config } from './config';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fail } from 'assert';
function initValues() {
  // Set up any necessary environment variables before each test
  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_SECRET_TOKEN = 'test-secret-token';
  process.env.CLAUDE_API_KEY = 'test-claude-api-key';
  process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-api-key';
  process.env.TELEGRAM_ALLOWED_CHAT_IDS = '1,2,3';
  process.env.TELEGRAM_ADMIN_CHAT_IDS = '4,5,6';
  process.env.AWS_ACCESS_KEY = 'test-access-key';
  process.env.AWS_SECRET_KEY = 'test-secret-key';
  Config.init();
}
function cleanValues() {
  // Clean up any changes made to the environment variables after each test
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_SECRET_TOKEN;
  delete process.env.CLAUDE_API_KEY;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.TELEGRAM_ALLOWED_CHAT_IDS;
  delete process.env.TELEGRAM_ADMIN_CHAT_IDS;
  delete process.env.AWS_ACCESS_KEY;
  delete process.env.AWS_SECRET_KEY;
  Config.init();
}
describe('Config', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    initValues();
  });

  afterEach(() => {
    cleanValues();
  });

  it('should have default values if environment variables are not set', () => {
    cleanValues();
    expect(Config.TELEGRAM_BOT_TOKEN).toBe('');
    expect(Config.TELEGRAM_SECRET_TOKEN).toBe('');
    expect(Config.CLAUDE_API_KEY).toBe('');
    expect(Config.ELEVENLABS_API_KEY).toBe('');
    expect(Config.TELEGRAM_ALLOWED_CHAT_IDS).toEqual([]);
    expect(Config.TELEGRAM_ADMIN_CHAT_IDS).toEqual([]);
    expect(Config.AWS_CREDENTIALS).toEqual({
      accessKeyId: '',
      secretAccessKey: '',
    });
  });

  it('should read environment variables correctly', () => {
    expect(Config.TELEGRAM_BOT_TOKEN).toBe('test-token');
    expect(Config.TELEGRAM_SECRET_TOKEN).toBe('test-secret-token');
    expect(Config.CLAUDE_API_KEY).toBe('test-claude-api-key');
    expect(Config.ELEVENLABS_API_KEY).toBe('test-elevenlabs-api-key');
    expect(Config.TELEGRAM_ALLOWED_CHAT_IDS).toEqual([1, 2, 3]);
    expect(Config.TELEGRAM_ADMIN_CHAT_IDS).toEqual([4, 5, 6]);
    expect(Config.AWS_CREDENTIALS).toEqual({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
    });
  });
  describe('validate', () => {
    it('should validate correctly', () => {
      expect(Config.validate(false)).toBe(true);
    });

    it('should throw an error if TELEGRAM_BOT_TOKEN is not set', () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      Config.init();
      try {
        expect(Config.validate(false)).toBe(false);
        Config.validate(true);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).toBe('TELEGRAM_BOT_TOKEN is required');
      }
    });

    it('should throw an error if CLAUDE_API_KEY is not set', () => {
      delete process.env.CLAUDE_API_KEY;
      Config.init();
      try {
        expect(Config.validate(false)).toBe(false);
        Config.validate(true);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).toBe('CLAUDE_API_KEY is required');
      }
    });

    it('should throw an error if TELEGRAM_SECRET_TOKEN is not set', () => {
      delete process.env.TELEGRAM_SECRET_TOKEN;
      Config.init();
      try {
        expect(Config.validate(false)).toBe(false);
        Config.validate(true);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e.message).toBe('TELEGRAM_SECRET_TOKEN is required');
      }
    });
  });
});
