// Dependencies
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// Services
import { BrandService } from './services';

// Models
import { Brand } from '../../models';

@ApiTags('brand-service')
@Controller('brand-service')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('/brand/:id')
  getBrandById(@Param('id') id: Brand['id']) {
    return this.brandService.getById(id);
  }
}
