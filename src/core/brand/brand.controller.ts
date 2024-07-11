// Dependencies
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

// Services
import { BrandOrderType, BrandResponse, BrandService } from './services';

// Models
import { Brand, CurrentUser } from '../../models';

// Utils
import { HttpStatus, hasError, hasResponse } from '../../utils';

// Utils
import { AuthorizationGuard } from '../../security/guards';
import { Session } from '../../security/decorators';

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
  getBrandById(
    @Param('id') id: Brand['id'],
  ): Promise<BrandResponse | undefined> {
    return this.brandService.getById(id, [], ['category']);
  }

  /**
   * Retrieves all brands with pagination.
   *
   * @param {BrandOrderType} order - The order in which to sort the brands.
   * @param {string} search - The search query to filter brands.
   * @param {number} pageId - The ID of the page to retrieve.
   * @param {number} limit - The number of brands to retrieve per page.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A response object containing the page ID, total count of brands, and an array of brand objects.
   */
  @Get('/list')
  @UseGuards(AuthorizationGuard)
  async getAllBrands(
    @Query('order') order: BrandOrderType,
    @Query('search') search: string,
    @Query('pageId') pageId: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    const [brands, count] = await this.brandService.getAll(
      [
        'id',
        'name',
        'url',
        'imageUrl',
        'profile',
        'channel',
        'stateScore',
        'score',
        'ranking',
      ],
      [],
      order,
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

  /**
   * Records votes for multiple brands.
   *
   * @param {CurrentUser} user - The current user session.
   * @param {{ ids: string[] }} ids - An object containing an array of brand IDs to vote for.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A response object indicating the result of the vote operation.
   */
  @Post('/vote')
  @UseGuards(AuthorizationGuard)
  async voteBrands(
    @Session() user: CurrentUser,
    @Body() { ids }: { ids: number[] },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const votes = await this.brandService.voteForBrands(user.id, ids);
      return hasResponse(res, votes);
    } catch (error) {
      return hasError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'voteBrands',
        error.toString(),
      );
    }
  }

  /**
   * Handles the request to create a new brand.
   *
   * @param {CurrentUser} user - The current user session.
   * @param {{ name: string }} body - An object containing the name of the new brand.
   */
  @Post('/request')
  @UseGuards(AuthorizationGuard)
  async requestNewBrand(
    @Session() user: CurrentUser,
    @Body() body: { name: string },
  ) {
    console.log({ user, body });
  }

  /**
   * Handles the request to follow a brand.
   *
   * @param {CurrentUser} user - The current user session.
   * @param {string} id - The ID of the brand to follow.
   */
  @Post('/:id/follow')
  @UseGuards(AuthorizationGuard)
  async followBrand(@Session() user: CurrentUser, @Param('id') id: string) {
    console.log({ user, id });
  }
}
