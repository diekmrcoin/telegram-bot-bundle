// lambda that gets apigatewayv2 event and publishes a message to a topic

import { HttpAbstractEvent, HttpFactory } from '../http/http.lambda';
import { APIGatewayV2Event } from '../http/typings/apigatewayv2.event';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
const tempSecret = '51fcf02a5c2a43094a879d5dddcf9cd6f9b86c2f477df3008187607fd8ee48ab';
// This is your AWS Lambda handler
export const handler = async (event: APIGatewayV2Event): Promise<HttpAbstractEvent> => {
  // Initialize AWS SQS with the new AWS SDK v3
  const sqsClient = new SQSClient({});
  const queueUrl = process.env.QUEUE_URL; // Assuming the queue URL is stored in an environment variable

  try {
    // Parse the message from the API Gateway event
    const body = JSON.parse(event.body); // Assuming the message to publish is in the request body
    const bodySecret = body.secret;
    if (bodySecret !== tempSecret) {
      return HttpFactory.createUnauthorizedResponse('Unauthorized');
    }
    const message = JSON.stringify({ message: body.message, timestamp: Date.now() });
    // Publish message to SQS topic using AWS SDK v3
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: message,
      MessageGroupId: 'default',
    });
    await sqsClient.send(command);

    // Return a successful response
    return HttpFactory.createSuccessResponse({
      message: 'Message published successfully',
    });
  } catch (error) {
    console.error('Error publishing message to SQS:', error);
    // Return an error response
    return HttpFactory.createInternalServerErrorResponse('Error publishing message to SQS');
  }
};
