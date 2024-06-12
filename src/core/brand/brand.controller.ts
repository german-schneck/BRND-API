// Dependencies
import { Controller, Get, Param } from '@nestjs/common';

// Services
import { BrandService } from './services';

// Models
import { Brand } from '../../models';

@Controller('brand-service')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('/brand/:id')
  getBrandById(@Param('id') id: Brand['id']) {
    return this.brandService.getById(id);
  }
}
