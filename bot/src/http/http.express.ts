// Http wrapper enveloped for express responses and exceptions

import { HttpException } from './http.exception';

export class HttpExpress {
  private static response(res: any, statusCode: number, data?: any) {
    res.status(statusCode).send(data);
  }

  static ok(res: any, data?: any) {
    HttpExpress.response(res, 200, { data });
  }

  static created(res: any, message: string) {
    HttpExpress.response(res, 201, { message });
  }

  static accepted(res: any, data?: any) {
    HttpExpress.response(res, 202, { data });
  }

  static noContent(res: any) {
    HttpExpress.response(res, 204);
  }

  static badRequest(res: any, message: string) {
    HttpExpress.response(res, 400, { message });
  }

  static unauthorized(res: any, message: string) {
    HttpExpress.response(res, 401, { message });
  }

  static paymentRequired(res: any, message: string) {
    HttpExpress.response(res, 402, { message });
  }

  static forbidden(res: any, message: string) {
    HttpExpress.response(res, 403, { message });
  }

  static notFound(res: any, message: string) {
    HttpExpress.response(res, 404, { message });
  }

  static conflict(res: any, message: string) {
    HttpExpress.response(res, 409, { message });
  }

  static failedDependency(res: any, message: string) {
    HttpExpress.response(res, 424, { message });
  }

  static fatalError(res: any, error: Error) {
    HttpExpress.response(res, 500, { message: error.message });
  }

  static notImplemented(res: any) {
    HttpExpress.response(res, 501, { message: 'Not implemented' });
  }

  static serviceUnavailable(res: any) {
    HttpExpress.response(res, 503, { message: 'Service unavailable' });
  }

  static exception(res: any, error: any) {
    if (error instanceof HttpException) {
      HttpExpress.response(res, error.status, { message: error.message });
    } else {
      console.error('Unhandled error:', error);
      HttpExpress.fatalError(res, error);
    }
  }
}
