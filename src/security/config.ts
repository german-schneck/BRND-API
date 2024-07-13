import { Logger } from '@nestjs/common';
import { Options } from 'express-rate-limit';

const logger = new Logger('APISystem');

/**
 * Configuration object for the application environment.
 * @property {boolean} isProduction - Determines if the environment is production based on the ENV variable.
 * @property {Object} runtime - Contains runtime configuration.
 * @property {number|string} runtime.port - The port the application runs on, defaults to 8080 if not specified.
 * @property {Object} db - Contains database connection configuration.
 * @property {string} db.name - The name of the database from the DATABASE_NAME environment variable.
 * @property {string} db.host - The database host, defaults to an empty string if not specified.
 * @property {number} db.port - The database port, parsed from the DATABASE_PORT environment variable, defaults to 5432 if not specified.
 * @property {string} db.username - The database username from the DATABASE_USER environment variable.
 * @property {string} db.password - The database password from the DATABASE_PASSWORD environment variable.
 */

export const getConfig = () => ({
  identifier: process.env.IDENTIFIER || 'BRND API',
  version: process.env.VERSION || '1.0',
  isProduction: process.env.ENV === 'prod',
  runtime: {
    host: process.env.HOST || '',
    port: process.env.PORT || 8080,
  },
  session: {
    key: process.env.SESSION_KEY || 'x059bb@_358b',
    domain: process.env.SESSION_DOMAIN || '127.0.0.1',
  },
  db: {
    name: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST || '',
    port: parseInt(process.env.DATABASE_PORT || '', 0) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    requireSSL: process.env.DATABASE_SSL === 'true' || false,
  },
  neynar: {
    apiKey: process.env.NEYNAR_API_KEY || '',
  },
  tools: {},
  startup: () => {
    logger.log(`
             ___  ___  _  _____    ___   ___  ____
            / _ )/ _ \/ |/ / _ \  / _ | / _ \/  _/
           / _  / , _/    / // / / __ |/ ___// /  
          /____/_/|_/_/|_/____/ /_/ |_/_/  /___/  
                                        
                  version ${getConfig().version}

      💻 Created and designed by German Debonis Schneck & Jorge Gomes Durán
      📧 german.schneck@gmail.com | jgomes79@hotmail.es

      Copyright © ${new Date().getFullYear()}.
    
      ===============================================================
      LICENSE AND COPYRIGHT NOTICE

      This software and its source code are protected under legal copyright laws.
      It is strictly prohibited to alter, duplicate, or reproduce any part of this
      software without the express written consent of the creator. Unauthorized use,
      duplication, or reproduction of this software may result in legal action and
      will be prosecuted to the fullest extent under the law. All rights reserved
      to the creator.
      ===============================================================

      🚀 Application listening on port: ${getConfig().runtime.port}

  `);
  },
});

const quarterOfAnHour: number = 15 * 60 * 1000;
const numberOfRequestsBeforeBan = 100;
const returnedMessage = 'Too many requests sent from this IP Address';

/**
 * Configuration object for rate limiting requests.
 * @property {number} windowMs - The time frame for which requests are checked/remembered.
 * @property {number} max - The maximum number of connections during `windowMs` milliseconds before sending a 429 response.
 * @property {string} message - The message sent in the response body when the limit is reached.
 * @property {boolean | EnabledValidations} validate - The list of validation checks that should run.
 */
export const rateLimitConfigObject: Partial<Options> = {
  windowMs: quarterOfAnHour,
  max: numberOfRequestsBeforeBan,
  message: returnedMessage,
  validate: {
    xForwardedForHeader: false,
  },
};

/**
 * Configuration options for CSRF protection middleware.
 * @property {Object} cookie - The configuration for the cookie to be set by CSRF middleware.
 * @property {string} cookie.key - The name of the cookie.
 * @property {boolean} cookie.sameSite - Strictly set to the same site for CSRF protection.
 * @property {boolean} cookie.httpOnly - Ensures the cookie is sent only over HTTP(S), not accessible through JavaScript.
 * @property {boolean} cookie.secure - Ensures the cookie is sent over HTTPS.
 */
export const csurfConfigOptions = {
  cookie: {
    key: '_csrf',
    sameSite: true,
    httpOnly: true,
    secure: true,
  },
};

// Types
type Domains = Record<'LOCAL' | 'STAGING' | 'PRO', string[]>;

/**
 * Domains configuration for different environments.
 * LOCAL: Domains for local development.
 * DEV: Domains for the development environment.
 * PRO: Domains for the production environment.
 */
const domains: Domains = {
  LOCAL: ['http://127.0.0.1:5173', 'http://localhost:5173'],
  STAGING: [],
  PRO: [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://brnd.land',
    'https://www.brnd.land',
    'https://frame.brnd.land',
    'https://brnd-frame.azurewebsites.net',
    '*',
  ],
};

export default domains;
