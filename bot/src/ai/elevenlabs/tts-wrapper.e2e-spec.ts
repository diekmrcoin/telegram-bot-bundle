import fs from 'fs';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { Config } from '../../config/config';
Config.init();
import { TTSWrapper } from './tts-wrapper';
import { fail } from 'assert';

describe('TTSWrapping', () => {
  let ttsWrapping: TTSWrapper;
  beforeEach(() => {
    ttsWrapping = new TTSWrapper(Config.ELEVENLABS_API_KEY);
    expect(ttsWrapping).toBeDefined();
  });

  it('Api key should be set', () => {
    expect(Config.ELEVENLABS_API_KEY).toBeDefined();
    expect(Config.ELEVENLABS_API_KEY).not.toEqual('');
  });

  it('Should return a list of voices', async () => {
    let voices: any;
    try {
      voices = await ttsWrapping.getVoices();
    } catch (error) {
      console.error(error);
      fail();
    }
    expect(voices).toBeDefined();
    // console.debug(voices);
    fs.writeFileSync('voices.json', JSON.stringify(voices, null, 2));
  });

  it('Should return a list of models', async () => {
    let models: any;
    try {
      models = await ttsWrapping.getModels();
    } catch (error) {
      console.error(error);
      fail();
    }
    expect(models).toBeDefined();
    // console.debug(models);
    fs.writeFileSync('models.json', JSON.stringify(models, null, 2));
  });

  it('Should return an audio file', async () => {
    const text = 'Hola, esto es una prueba de audio.';
    let audio: any;
    try {
      audio = await ttsWrapping.getAudio(text);
    } catch (error) {
      console.error(error);
      console.log('Error:', (error as any).response.data);
      fail();
    }
    expect(audio).toBeDefined();
  }, 60000);
});
