// Dependencies
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser as User } from '../../models/User';

/**
 * Custom decorator to extract the current user from the request within the NestJS execution context.
 * This decorator ensures the user object is correctly typed as `User` or returns `null` if no user is found.
 *
 * @param {unknown} data - An optional parameter not used in this decorator, but required for custom decorators.
 * @param {ExecutionContext} ctx - The execution context from which the HTTP request is extracted.
 * @returns {User | null} - The extracted user object from the request, typed as `User` or `null` if not present.
 */
export const Session = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User | null;
  },
);

export type { User };
