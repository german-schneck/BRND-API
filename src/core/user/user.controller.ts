// Dependencies
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

// Services
import { UserService } from './services';

// Security
import { AdminGuard } from '../../security/guards';

// Models
import { User } from '../../models';

@Controller('user-service')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/user/:id')
  getUserById(@Param('id') id: User['id']) {
    return this.userService.getById(id, ['id', 'username', 'createdAt']);
  }

  @Patch('/user/:id')
  @UseGuards(AdminGuard)
  updateUser(@Param('id') id: User['id'], @Body('body') data: Partial<User>) {
    return this.userService.update(id, data);
  }

  @Delete('/user/:id')
  deleteUser(@Param('id') id: User['id']) {
    return this.userService.delete(id);
  }
}
