export class HttpException extends Error {
  constructor(
    public status: number,
    public message: string,
    error: Error,
  ) {
    super(message);
    console.error(error, error.stack);
  }
}

export class HttpBadRequestException extends HttpException {
  constructor(message: string, error: Error) {
    super(400, message, error);
  }
}

export class HttpUnauthorizedException extends HttpException {
  constructor(message: string, error: Error) {
    super(401, message, error);
  }
}

export class HttpPaymentRequiredException extends HttpException {
  constructor(message: string, error: Error) {
    super(402, message, error);
  }
}

export class HttpForbiddenException extends HttpException {
  constructor(message: string, error: Error) {
    super(403, message, error);
  }
}

export class HttpNotFoundException extends HttpException {
  constructor(message: string, error: Error) {
    super(404, message, error);
  }
}

export class HttpConflictException extends HttpException {
  constructor(message: string, error: Error) {
    super(409, message, error);
  }
}

export class HttpFailedDependencyException extends HttpException {
  constructor(message: string, error: Error) {
    super(424, message, error);
  }
}

export class HttpInternalServerErrorException extends HttpException {
  constructor(message: string, error: Error) {
    super(500, message, error);
  }
}

export class HttpNotImplementedException extends HttpException {
  constructor(error: Error) {
    super(501, 'Not implemented', error);
  }
}

export class HttpServiceUnavailableException extends HttpException {
  constructor(error: Error) {
    super(503, 'Service unavailable', error);
  }
}
