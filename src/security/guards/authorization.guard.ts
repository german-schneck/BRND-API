// Dependencies
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as jsonwebtoken from 'jsonwebtoken';

// Utils
import { logger } from '../../main';

// Types
import { getConfig } from '../config';
import { CurrentUser } from '../../models/User';

/**
 * @class AuthorizationGuard
 * @description This class is responsible for user authorization
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  /**
   * @constructor
   * @param {UserTokenService} userTokenService - The user token service
   */
  constructor() {}

  /**
   * @method canActivate
   * @description This method checks if the user is authorized
   * @param {ExecutionContext} context - The execution context
   * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request<{ user: CurrentUser }> = context
        .switchToHttp()
        .getRequest();
      const jwt: string = req.cookies['Authorization'];

      if (!jwt) throw new UnauthorizedException('Token not authenticated');

      let jwtTokenPayload;
      const key = getConfig().session.key;

      try {
        jwtTokenPayload = jsonwebtoken.verify(jwt, key) as CurrentUser;
      } catch (error) {
        logger.error(error);
        throw new UnauthorizedException('Invalid or expired token.');
      }

      // add user's information to the request object
      req.user = jwtTokenPayload;

      return true;
    } catch (error) {
      logger.error(error);
      const res: Response = context.switchToHttp().getResponse();
      res.clearCookie('Authorization');
      throw new UnauthorizedException(error.message);
    }
  }
}
