// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { UserController } from './user.controller';

// Services
import { UserService } from './services';

// Models
import { Brand, User, UserBrandVotes } from '../../models';
@Module({
  imports: [TypeOrmModule.forFeature([User, Brand, UserBrandVotes])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
