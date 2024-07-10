// Http wrapper enveloped for lambda returns

export interface HttpAbstractEvent {
  body?: string;
  headers: { [header: string]: string };
  statusCode: number;
}

export class HttpFactory {
  static createResponse(data: {
    statusCode: number;
    headers?: { [header: string]: string };
    body?: string;
  }): HttpAbstractEvent {
    const response = {} as HttpAbstractEvent;
    if (data.body) response.body = data.body;
    response.statusCode = data.statusCode;
    response.headers = { 'Content-Type': 'application/json' };
    if (data.headers) response.headers = { ...response.headers, ...data.headers };
    return response;
  }

  static createSuccessResponse(data: any): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 200, body: JSON.stringify({ data }) });
  }

  static createCreatedResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 201, body: JSON.stringify({ message }) });
  }

  static createNoContentResponse(): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 204 });
  }

  static createBadRequestResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 400, body: JSON.stringify({ message }) });
  }

  static createUnauthorizedResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 401, body: JSON.stringify({ message }) });
  }

  static createForbiddenResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 403, body: JSON.stringify({ message }) });
  }

  static createNotFoundResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 404, body: JSON.stringify({ message }) });
  }

  static createConflictResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 409, body: JSON.stringify({ message }) });
  }

  static createRedirectResponse(locationUrl: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 302, headers: { Location: locationUrl } });
  }

  static createSeeOtherResponse(locationUrl: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 303, headers: { Location: locationUrl } });
  }

  static createNotModifiedResponse(): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 304 });
  }

  static createInternalServerErrorResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 500, body: JSON.stringify({ message }) });
  }

  static createNotImplementedResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 501, body: JSON.stringify({ message }) });
  }

  static createServiceUnavailableResponse(message: string): HttpAbstractEvent {
    return HttpFactory.createResponse({ statusCode: 503, body: JSON.stringify({ message }) });
  }
}
