import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { Config } from '../config/config';

export class SESWrapper {
  private sesClient: SESClient;
  private identity = '.ai-proxy@diekmrcoin.com';
  private region = 'eu-west-1';

  constructor(client?: SESClient) {
    this.sesClient = client || new SESClient({ region: this.region, credentials: Config.AWS_CREDENTIALS as any });
  }

  sendEmail(from: string, alias: string, to: string, subject: string, body: string) {
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: `"AI-Proxy ${alias}" ${from}${this.identity}`,
    };

    return this.sesClient.send(new SendEmailCommand(params));
  }
}
