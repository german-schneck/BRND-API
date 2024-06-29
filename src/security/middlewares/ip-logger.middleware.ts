import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class IpLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('ipAddress', ipAddress);
    next();
  }
}
