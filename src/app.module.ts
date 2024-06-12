// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core
import CoreModules from './core';

// Security
import { getConfig } from './security/config';
import { User } from './models';

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
      entities: [User],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
      logging: 'all',
    }),
  ],
})
export class AppModule {}
