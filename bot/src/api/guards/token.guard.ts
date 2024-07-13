import { Request, Response, NextFunction } from 'express';
import { DynamoDBFactory } from '../../db/dynamodb';
import { HttpUnauthorizedException } from '../../http/http.exception';
import { HttpExpress } from '../../http/http.express';
import { ApiDynamoDBWrapper } from '../../db/api.dynamodb';

export function TokenGuard() {
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: Request, res: Response, next: NextFunction) {
      const token = req.headers['authorization'];

      if (!token) {
        const error = new HttpUnauthorizedException('Empty token', new Error('Empty token'));
        return HttpExpress.exception(res, error);
      }

      // format is Bearer <email>:<code>
      if (!token.startsWith('Bearer ')) {
        const error = new HttpUnauthorizedException('Not a Bearer token', new Error('Not a Bearer token'));
        return HttpExpress.exception(res, error);
      }

      const parts = token.split(' ');
      if (parts.length !== 2) {
        const error = new HttpUnauthorizedException('Invalid token format', new Error('Invalid token format'));
        return HttpExpress.exception(res, error);
      }

      const [email, code] = parts[1].split(':');
      if (!email || !code) {
        const error = new HttpUnauthorizedException(
          'Invalid token credentials',
          new Error('Invalid token credentials'),
        );
        return HttpExpress.exception(res, error);
      }

      return validateToken(email, code)
        .then((isValid) => {
          if (isValid) {
            return originalMethod.call(this, req, res, next);
          } else {
            return HttpExpress.unauthorized(res, 'Invalid token');
          }
        })
        .catch((error) => {
          console.error('Error in TokenGuard', error);
          return HttpExpress.exception(res, new HttpUnauthorizedException('Token validation failed', error));
        });
    };

    return descriptor;
  };
}
const apiDynamo = new ApiDynamoDBWrapper(DynamoDBFactory.create());
async function validateToken(email: string, code: string): Promise<boolean> {
  console.debug('TokenGuard', email, code);
  try {
    const result = await apiDynamo.getLoginRecord(email, code);
    return !!result;
  } catch (error) {
    console.error('Error validating token', error);
    return false;
  }
}
