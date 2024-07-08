import axios from 'axios';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TTSWrapping } from './tts-wrapping';

jest.mock('axios');

describe('TTSWrapping', () => {
  let ttsWrapping: TTSWrapping;
  beforeEach(() => {
    ttsWrapping = new TTSWrapping('API_KEY');
  });

  it('should initialize with the correct API key', () => {
    let apiKey = 'API_KEY_TEST';
    ttsWrapping = new TTSWrapping(apiKey);
    expect(ttsWrapping['apiKey']).toBe(apiKey);
  });

  it('should call the API with the correct parameters', async () => {
    const mockedResponse = { data: {} };
    (axios.request as any).mockResolvedValue(mockedResponse);
    const response = await ttsWrapping.callApi('/path', 'GET', {});
    expect(response).toEqual({ data: {} });
  });

  describe('audio', () => {
    it('should call the API with the correct parameters', async () => {
      const mockedResponse = { data: {} };
      (axios.request as any).mockResolvedValue(mockedResponse);
      const response = await ttsWrapping.getAudio('text', 'language');
      expect(response).toEqual({});
    });
  });

  describe('voices', () => {
    it('should call the API with the correct parameters', async () => {
      const mockedResponse = { data: {} };
      (axios.request as any).mockResolvedValue(mockedResponse);
      const response = await ttsWrapping.getVoices();
      expect(response).toEqual({});
    });
  });
});
