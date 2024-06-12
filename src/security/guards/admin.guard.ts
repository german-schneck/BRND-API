// Dependencies
import {
  UnauthorizedException,
  ForbiddenException,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

// Guards
import { AuthorizationGuard } from './authorization.guard';

// Types
import { CurrentUser, UserRoleEnum } from '../../models/User';

@Injectable()
export class AdminGuard extends AuthorizationGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      throw new UnauthorizedException('You are not authenticated');
    }

    const req: Request<{ user: CurrentUser }> = context
      .switchToHttp()
      .getRequest();

    const user = req.user as CurrentUser;

    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
