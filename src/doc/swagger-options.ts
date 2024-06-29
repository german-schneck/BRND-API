import { DocumentBuilder } from '@nestjs/swagger';
import { getConfig } from '../security/config';

export const swaggerOptions = new DocumentBuilder()
  .setTitle(getConfig().identifier)
  .setDescription('An API Gateway for Reposity')
  .setVersion(getConfig().version)
  .addSecurity('authenticationCookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'Authentication',
  })
  .addSecurityRequirements([{ openId: [] }, { authorizationCookie: [] }] as any)
  .build();
