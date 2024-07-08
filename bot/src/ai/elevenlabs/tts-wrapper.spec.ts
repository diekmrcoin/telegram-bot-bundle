import axios from 'axios';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TTSWrapper } from './tts-wrapper';

jest.mock('axios');

describe('TTSWrapping', () => {
  let ttsWrapping: TTSWrapper;
  beforeEach(() => {
    ttsWrapping = new TTSWrapper('API_KEY');
  });

  it('should initialize with the correct API key', () => {
    let apiKey = 'API_KEY_TEST';
    ttsWrapping = new TTSWrapper(apiKey);
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
      const response = await ttsWrapping.getAudio('text');
      expect(response).toBeTruthy();
    });
  });

  describe('voices', () => {
    it('should call the API with the correct parameters', async () => {
      const mockedResponse = {
        data: {
          voices: [],
        },
      };
      (axios.get as any).mockResolvedValue(mockedResponse);
      const response = await ttsWrapping.getVoices();
      expect(response).toEqual({
        voices: [],
      });
    });
  });
  describe('models', () => {
    it('should call the API with the correct parameters', async () => {
      const mockedResponse = {
        data: {
          models: [],
        },
      };
      (axios.get as any).mockResolvedValue(mockedResponse);
      const response = await ttsWrapping.getModels();
      expect(response).toEqual({
        models: [],
      });
    });
  });
});
