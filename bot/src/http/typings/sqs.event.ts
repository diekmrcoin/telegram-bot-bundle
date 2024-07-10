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
    SequenceNumber?: string; // Only for FIFO queues
    MessageGroupId?: string; // Only for FIFO queues
    SenderId: string;
    MessageDeduplicationId?: string; // Only for FIFO queues
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
