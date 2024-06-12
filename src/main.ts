/**
 * LICENSE AND COPYRIGHT NOTICE
 *
 * This software and its source code are protected under legal copyright laws.
 * It is strictly prohibited to alter, duplicate, or reproduce any part of this
 * software without the express written consent of the creator. Unauthorized use,
 * duplication, or reproduction of this software may result in legal action and
 * will be prosecuted to the fullest extent under the law. All rights reserved
 * to the creator.
 *
 * @author German Debonis Schneck <german.schneck@gmail.com>
 * @link https://www.linkedin.com/in/german-schneck/
 */

// Dependencies
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// Authentication
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

// Security
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as csurf from 'csurf';
import domains, {
  rateLimitConfigObject,
  csurfConfigOptions,
  getConfig,
} from './security/config';
import { csrfMiddleware } from './security/middlewares';

// Environment
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Modules
import { AppModule } from './app.module';

// Docs
import { swaggerOptions } from './doc';

export const logger = new Logger('APIGateway');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(
      session({
        secret: getConfig().session.key,
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use(cookieParser(process.env.COOKIE_SECRET));

    const csrf = csurf(csurfConfigOptions);
    app.use((req: Request, res: Response, next: NextFunction) => {
      csrfMiddleware(req, res, next, csrf);
    });

    if (!getConfig().isProduction) {
      const document = SwaggerModule.createDocument(app, swaggerOptions);
      SwaggerModule.setup('doc', app, document);
    } else {
      app.use(helmet());
      app.use(rateLimit(rateLimitConfigObject));
    }

    app.enableCors({
      origin: getConfig().isProduction
        ? domains.PRO
        : [...domains.LOCAL, ...domains.STAGING],

      credentials: true,
    });

    await app.listen(getConfig().runtime.port);

    void getConfig().startup();
  } catch (e) {
    logger.error(e);
  }
}
void bootstrap();
