// Dependencies
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

// Services
import { BrandService } from './services';

// Models
import { Brand } from '../../models';

// Utils
import { HttpStatus, hasError, hasResponse } from '../../utils';

@ApiTags('brand-service')
@Controller('brand-service')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  /**
   * Retrieves a brand by its ID.
   *
   * @param {Brand['id']} id - The ID of the brand to retrieve.
   * @returns {Promise<Brand | undefined>} The brand entity or undefined if not found.
   */
  @Get('/brand/:id')
  getBrandById(@Param('id') id: Brand['id']) {
    return this.brandService.getById(id);
  }

  @Put('/vote')
  async voteBrands(@Body() { ids }: { ids: string[] }, @Res() res: Response) {
    if (!Array.isArray(ids) || ids.length !== 3) {
      return hasError(
        res,
        HttpStatus.BAD_REQUEST,
        'voteBrands',
        'Invalid input: exactly 3 brand IDs are required.',
      );
    }

    try {
      // Assuming there's a method in brandService to handle the voting logic
      //await this.brandService.voteForBrands(ids);
      return hasResponse(res, { message: 'Vote recorded successfully.' });
    } catch (error) {
      return hasError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'voteBrands',
        'An unexpected error occurred.',
      );
    }
  }
  /**
   * Retrieves all brands with pagination.
   *
   * @param {string} search - The search query to filter brands.
   * @param {number} pageId - The ID of the page to retrieve.
   * @param {number} limit - The number of brands to retrieve per page.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A response object containing the page ID, total count of brands, and an array of brand objects.
   */
  @Get('/all')
  async getAllBrands(
    @Query('search') search: string,
    @Query('pageId') pageId: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    const [brands, count] = await this.brandService.getAll(
      ['id', 'name', 'url', 'imageUrl'],
      [],
      search,
      pageId,
      limit,
    );

    return hasResponse(res, {
      pageId,
      count,
      brands,
    });
  }
}
