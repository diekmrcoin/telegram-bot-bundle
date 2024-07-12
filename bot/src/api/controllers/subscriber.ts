// lambda that gets triggered by an sqs event and runs the application logic

import { SQSEvent } from '../../http/typings/sqs.event';

export const handler = async (event: SQSEvent): Promise<void> => {};
