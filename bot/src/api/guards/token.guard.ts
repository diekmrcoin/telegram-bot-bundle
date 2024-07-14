import { Request, Response, NextFunction } from 'express';
import { DynamoDBFactory } from '../../db/dynamodb';
import { HttpUnauthorizedException } from '../../http/http.exception';
import { HttpExpress } from '../../http/http.express';
import { ApiDynamoDBWrapper } from '../../db/api.dynamodb';
import { JwtPayload, verify } from 'jsonwebtoken';
import { Config } from '../../config/config';
import { IsEmail, IsUUID, Length, validate, validateOrReject } from 'class-validator';

export function TokenGuard() {
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
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

      const data = new JwtPayloadValidator();
      try {
        const payload = verify(parts[1], Config.JWT_SECRET, {
          ignoreExpiration: false,
        }) as JwtPayload;
        data.set(payload);
      } catch (error) {
        return HttpExpress.exception(res, new HttpUnauthorizedException('Jwt validation failed', error as Error));
      }

      try {
        await data.validate();
      } catch (error) {
        return HttpExpress.badRequest(res, (error as any).toString());
      }

      return validateToken(data.id, data.email, data.code)
        .then((isValid) => {
          if (isValid) {
            const pointer = req as any;
            pointer['jwtPayload'] = data;
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
async function validateToken(id: string, email: string, code: string): Promise<boolean> {
  try {
    const result = await apiDynamo.getLoginRecord(id, email, code);
    return !!result;
  } catch (error) {
    console.error('Error validating token', error);
    throw error;
  }
}

export class JwtPayloadValidator {
  @IsUUID(4)
  id: string;
  @IsEmail()
  email: string;
  @Length(6, 6)
  code: string;
  set(data: any) {
    this.id = data.id;
    this.email = data.email;
    this.code = data.code;
  }
  validate(): Promise<void> {
    return validateOrReject(this);
  }
}
