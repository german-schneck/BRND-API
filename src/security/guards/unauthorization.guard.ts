/**
 * @module AuthorizationGuard
 * @description This module is responsible for user authorization
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

// Utils
import { logger } from '../../main';

/**
 * @class UnauthorizationGuard
 * @description This class is responsible for checking if there is no active session
 */
@Injectable()
export class UnauthorizationGuard implements CanActivate {
  /**
   * @constructor
   */
  constructor() {}

  /**
   * @method canActivate
   * @description This method checks if there is no active session
   * @param {ExecutionContext} context - The execution context
   * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating if there is no active session
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request = context.switchToHttp().getRequest();

      const jwt: string = req.cookies['Authorization'];

      // If JWT exists, it means there is an active session, hence return false to deny access
      if (jwt) {
        throw new UnauthorizedException(
          'Cannot access this resource because your session is active.',
        );
      }

      // If no JWT is found, it means there is no active session, hence return true to allow access
      return true;
    } catch (error) {
      logger.error(error);
      throw new UnauthorizedException(error.message);
    }
  }
}
