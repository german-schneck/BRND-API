// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

// Models
import { Brand } from '../../../models';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  /**
   * Retrieves a brand by its ID with optional selected fields and relations.
   *
   * @param {Brand['id']} id - The ID of the brand to retrieve.
   * @param {(keyof Brand)[]} [select=[]] - Optional array of fields to select.
   * @param {(keyof Brand)[]} [relations=[]] - Optional array of relations to include.
   * @returns {Promise<Brand | undefined>} The brand entity or undefined if not found.
   */
  async getById(
    id: Brand['id'],
    select: (keyof Brand)[] = [],
    relations: (keyof Brand)[] = [],
  ): Promise<Brand | undefined> {
    return this.brandRepository.findOne({
      ...(select.length > 0 && {
        select,
      }),
      where: {
        id,
      },
      ...(relations.length > 0 && {
        relations,
      }),
    });
  }

  /**
   * Retrieves all brands with pagination.
   *
   * @param {number} [pageId=1] - The page number to retrieve.
   * @param {number} [limit=15] - The number of brands to retrieve per page.
   * @returns {Promise<[Brand[], number]>} A promise that resolves to an array containing the list of brands and the total count.
   */
  async getAll(
    select: (keyof Brand)[] = [],
    relations: (keyof Brand)[] = [],
    searchName: string = '',
    pageId: number = 1,
    limit: number = 15,
  ): Promise<[Brand[], number]> {
    const hasSearch = searchName !== '';

    const skip = (pageId - 1) * limit;
    return this.brandRepository.findAndCount({
      ...(select.length > 0 && {
        select,
      }),

      skip,
      take: limit,

      ...(hasSearch && {
        where: {
          name: Like(`%${searchName}%`),
        },
      }),

      ...(relations.length > 0 && {
        relations,
      }),
    });
  }
}
