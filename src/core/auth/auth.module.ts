// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AuthController } from './auth.controller';

// Services
import { AuthService } from './services';
import { UserService } from '../user/services';

// Models
import { Brand, User, UserBrandVotes, UserDailyActions } from '../../models';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Brand, UserBrandVotes, UserDailyActions]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
