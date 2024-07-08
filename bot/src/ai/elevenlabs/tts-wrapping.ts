import { Config } from '../../config/config';
import axios, { AxiosResponse, AxiosStatic } from 'axios';

export class TTSWrapping {
  protected readonly httpClient: AxiosStatic;
  protected readonly apiKey: string;
  protected readonly domain = 'https://api.elevenlabs.io';
  protected readonly ttsPath = '/v1/text-to-speech/{voice_id}';
  protected readonly voicesPath = '/v1/voices';

  constructor(apiKey: string, httpClient: AxiosStatic = axios) {
    this.apiKey = apiKey;
    this.httpClient = httpClient;
  }

  async getAudio(text: string, language: string): Promise<any> {
    const method = 'POST';
    const response = await this.callApi(this.ttsPath.replace('{voice_id}', language), method, { text: text });
    return response.data;
  }

  async getVoices(): Promise<any> {
    const method = 'GET';
    const response = await this.callApi(this.voicesPath, method, {});
    return response.data;
  }

  callApi(path: string, method: string, data: any): Promise<AxiosResponse> {
    return this.httpClient.request({
      method: method,
      url: this.domain + path,
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      data: data,
    });
  }
}
