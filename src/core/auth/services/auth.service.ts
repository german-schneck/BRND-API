// Dependencies
import { Injectable } from '@nestjs/common';
import {
  AppClient,
  createAppClient,
  viemConnector,
} from '@farcaster/auth-client';
import * as jwt from 'jsonwebtoken';

// Services
import { UserService } from '../../user/services';

// Security
import { getConfig } from '../../../security/config';

@Injectable()
export class AuthService {
  readonly farcasterApi: AppClient;

  constructor(private userService: UserService) {
    this.farcasterApi = createAppClient({
      relay: 'https://relay.farcaster.xyz',
      ethereum: viemConnector(),
    });
  }

  /**
   * Logs in a user by verifying the sign-in message with the Farcaster API and handles user retrieval or creation.
   *
   * @param credentials An object containing:
   * @param credentials.fid The Farcaster ID of the user.
   * @param credentials.signature The cryptographic signature prefixed with `0x`.
   * @param credentials.message The original message that was signed.
   * @param credentials.nonce The nonce used during the signing to prevent replay attacks.
   * @param credentials.domain The domain associated with the signing event.
   * @param credentials.username The username of the user.
   * @param credentials.photoUrl The photo URL of the user.
   */
  async logIn(credentials: {
    fid: string;
    signature: `0x${string}`;
    message: string;
    nonce: string;
    domain: string;
    username: string;
    photoUrl: string;
  }) {
    // Obtaining authentication of the credentials.
    const auth = await this.farcasterApi.verifySignInMessage({
      nonce: credentials.nonce,
      domain: credentials.domain,
      message: credentials.message,
      signature: credentials.signature,
    });

    if (!auth || !auth.success || auth.isError) {
      return auth.error;
    }

    const fid = Number(credentials.fid);

    if (auth.fid !== fid)
      throw new Error(
        `The user does not match the one registered in the database.`,
      );

    const { username, photoUrl } = credentials;

    const user = await this.userService.upsert(fid, {
      username,
      photoUrl,
    });

    const key = getConfig().session.key;
    const token = jwt.sign(
      {
        id: user.id,
        fid,
        role: user.role,
      },
      key,
    );

    return { token, user };
  }
}
