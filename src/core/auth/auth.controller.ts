// Dependencies
import {
  Body,
  Controller,
  Get,
  // Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthClientError } from '@farcaster/auth-client';

// Services
import { AuthService } from './services';
import { UserService } from '../user/services';

// Security
import { AuthorizationGuard } from '../../security/guards';
import { getConfig } from '../../security/config';
import { Session, User } from '../../security/decorators';

// Utils
import { hasResponse, hasError, HttpStatus } from '../../utils';

@ApiTags('auth-service')
@Controller('auth-service')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * Handles the POST request for user login.
   *
   * @param body - The login credentials including Farcaster ID, signature, message, nonce, domain, username, and photo URL.
   * @param res - The response object to handle HTTP responses.
   * @returns A response with either the user's data or an error message.
   */
  @Post('/login')
  async logIn(
    @Body()
    body: {
      fid: string;
      signature: `0x${string}`;
      message: string;
      nonce: string;
      domain: string;
      username: string;
      photoUrl: string;
    },
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.logIn(body);

      if (!data || data instanceof AuthClientError) {
        return hasError(
          res,
          HttpStatus.BAD_REQUEST,
          'logIn',
          'Authentication failed. No data returned.',
        );
      }

      const { user, isCreated, token } = data;

      // Determine if the user has voted today.
      const unixDate = Math.floor(Date.now() / 1000);
      const votesToday = await this.userService.getUserVotes(user.id, unixDate);
      const hasVotedToday = !!votesToday;

      res.cookie('Authorization', token, {
        maxAge: 6 * 60 * 60 * 1000, // 6 hours
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        domain: getConfig().session.domain,
      });

      return hasResponse(res, {
        isCreated,
        hasVotedToday,
        user: {
          fid: user.fid.toString(),
          username: user.username,
          photoUrl: user.photoUrl,
        },
      });
    } catch (error) {
      return hasError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'logIn',
        'An unexpected error occurred during login.',
      );
    }
  }

  /**
   * Handles the HTTP POST request for user logout.
   *
   * This method clears the 'Authorization' cookie, effectively logging out the user.
   * It uses the `AuthorizationGuard` to ensure that the request is authenticated.
   *
   * @param {Request} req - The incoming HTTP request.
   * @param {Response} res - The outgoing HTTP response.
   * @returns A success response if logout is successful, otherwise an error response.
   */
  @Post('/logout')
  @UseGuards(AuthorizationGuard)
  async logOut(@Req() req: Request, @Res() res: Response) {
    try {
      res.clearCookie('Authorization');
      return hasResponse(res, 'Successfully logged out.');
    } catch (error) {
      return hasError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'logOut',
        'An unexpected error occurred during logout.',
      );
    }
  }

  /**
   * Handles the HTTP GET request to retrieve the current user's information.
   *
   * This method uses the `AuthorizationGuard` to ensure that the request is authenticated.
   * It retrieves the user information based on the session ID and returns the user's details.
   *
   * @param {User} session - The session object containing the user's information.
   * @param {Response} res - The outgoing HTTP response.
   * @returns A success response with the user's details if retrieval is successful, otherwise an error response.
   */
  @Get('/me')
  @UseGuards(AuthorizationGuard)
  async getMe(@Session() session: User, @Res() res: Response) {
    try {
      const user = await this.userService.getById(session.id, [
        'id',
        'username',
        'photoUrl',
        'points',
        'createdAt',
      ]);

      // Determine if the user has voted today.
      const unixDate = Math.floor(Date.now() / 1000);
      const votesToday = await this.userService.getUserVotes(user.id, unixDate);

      const hasVotedToday = !!votesToday;

      return hasResponse(res, { ...user, hasVotedToday });
    } catch (error) {
      console.error(error);
      return hasError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'getMe',
        'An unexpected error occurred while retrieving user information.',
      );
    }
  }
}
