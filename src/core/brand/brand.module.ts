// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { BrandController } from './brand.controller';

// Services
import { BrandService } from './services';

// Models
import { Brand, User } from '../../models';

@Module({
  imports: [TypeOrmModule.forFeature([User, Brand])],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
