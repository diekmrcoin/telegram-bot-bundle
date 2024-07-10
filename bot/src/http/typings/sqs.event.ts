export interface SQSEvent {
  Records: SQSRecord[];
}

export interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: {
    ApproximateReceiveCount: string;
    SentTimestamp: string;
    SenderId: string;
    ApproximateFirstReceiveTimestamp: string;
  };
  messageAttributes: {
    [key: string]: {
      stringValue?: string;
      binaryValue?: string;
      stringListValues: string[];
      binaryListValues: string[];
      dataType: string;
    };
  };
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}
