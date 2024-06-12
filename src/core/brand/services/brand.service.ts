// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
