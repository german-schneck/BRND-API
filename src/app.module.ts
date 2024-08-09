// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core
import CoreModules from './core';

// Security
import { getConfig } from './security/config';

// Models
import {
  User,
  Category,
  Brand,
  Tag,
  UserBrandVotes,
  BrandTags,
  UserDailyActions,
} from './models';

@Module({
  imports: [
    ...CoreModules,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: getConfig().db.host,
      port: getConfig().db.port,
      username: getConfig().db.username,
      password: getConfig().db.password,
      database: getConfig().db.name,
      entities: [
        User,
        Category,
        Brand,
        Tag,
        UserBrandVotes,
        BrandTags,
        UserDailyActions,
      ],
      synchronize: true,
      logging: getConfig().isProduction ? false : 'all',
      extra: {
        insecureAuth: true,
      },
    }),
  ],
})
export class AppModule {}
