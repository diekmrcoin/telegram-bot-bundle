import axios, { AxiosResponse, AxiosStatic } from 'axios';
import fs from 'fs';
import stream from 'stream';

export class TTSWrapper {
  protected readonly httpClient: AxiosStatic;
  protected readonly apiKey: string;
  protected readonly domain = 'https://api.elevenlabs.io';
  protected readonly ttsPath = '/v1/text-to-speech/{voice_id}';
  protected readonly voicesPath = '/v1/voices';
  public readonly voiceId = 'gD1IexrzCvsXPHUuT0s3'; // Sara Martin
  public readonly modelId = 'eleven_multilingual_v2'; // default model
  constructor(apiKey: string, httpClient: AxiosStatic = axios) {
    this.apiKey = apiKey;
    this.httpClient = httpClient;
  }

  async getAudio(text: string, modelId?: string, voiceId?: string): Promise<stream.Readable> {
    // https://elevenlabs.io/docs/api-reference/text-to-speech
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      data: {
        text: text,
        model_id: modelId || this.modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
        // pronunciation_dictionary_locators: [{ pronunciation_dictionary_id: '<string>', version_id: '<string>' }],
        // seed: 123,
        // previous_text: '<string>',
        // next_text: '<string>',
        // previous_request_ids: ['<string>'],
        // next_request_ids: ['<string>'],
      },
    };
    const path = this.ttsPath.replace('{voice_id}', voiceId || this.voiceId);
    const response = await this.httpClient.post(this.domain + path, options.data, {
      headers: options.headers,
      responseType: 'stream',
    });
    return response.data;
  }

  async saveAudio(stream: stream.Readable, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(fileName);
      stream.pipe(writeStream);
      stream.on('end', () => {
        resolve();
      });
      stream.on('error', (error: any) => {
        reject(error);
      });
    });
  }

  async getVoices(): Promise<any> {
    const response = await this.httpClient.get(this.domain + this.voicesPath, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });
    return response.data;
  }

  async getModels(): Promise<any> {
    const response = await this.httpClient.get(this.domain + '/v1/models', {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });
    return response.data;
  }

  callApi(path: string, method: string, data: any): Promise<AxiosResponse> {
    return this.httpClient.request({
      method: method,
      url: this.domain + path,
      headers: {
        'xi-api-key': this.apiKey,
      },
      data: data,
    });
  }
}
