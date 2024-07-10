// lambda that gets apigatewayv2 event and publishes a message to a topic

import { HttpAbstractEvent, HttpFactory } from '../http/http.lambda';
import { APIGatewayV2Event } from '../http/typings/apigatewayv2.event';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// This is your AWS Lambda handler
export const handler = async (event: APIGatewayV2Event): Promise<HttpAbstractEvent> => {
  // Initialize AWS SNS with the new AWS SDK v3
  const snsClient = new SNSClient({});
  const topicArn = 'arn:aws:sns:region:account-id:topicName'; // Replace with your SNS topic ARN

  try {
    // Parse the message from the API Gateway event
    const message = event.body; // Assuming the message to publish is in the request body

    // Publish message to SNS topic using AWS SDK v3
    const publishCommand = new PublishCommand({
      Message: message,
      TopicArn: topicArn,
    });
    await snsClient.send(publishCommand);

    // Return a successful response
    return HttpFactory.createSuccessResponse({
      message: 'Message published successfully',
    });
  } catch (error) {
    console.error('Error publishing message to SNS:', error);
    // Return an error response
    return HttpFactory.createInternalServerErrorResponse('Error publishing message to SNS');
  }
};
