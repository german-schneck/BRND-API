// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';

// Models
import { Brand, UserBrandVotes } from '../../../models';

// Services
import { UserService } from '../../user/services';
import { User } from '../../../security/decorators';
import { BrandOrderType } from '.';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(UserBrandVotes)
    private readonly userBrandVotesRepository: Repository<UserBrandVotes>,

    private readonly userService: UserService,
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
    order: BrandOrderType = 'all',
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

      where: {
        ...(hasSearch && {
          name: Like(`%${searchName}%`),
        }),
      },

      ...(relations.length > 0 && {
        relations,
      }),

      ...(order === 'new' && {
        order: {
          createdAt: 'DESC',
        },
      }),

      ...(order === 'trending' && {
        order: {
          followerCount: 'DESC',
        },
      }),
    });
  }

  /**
   * Checks if all brand IDs exist.
   *
   * @param {Brand['id'][]} brandIds - An array of brand IDs to check.
   * @returns {Promise<boolean>} A promise that resolves to true if all brand IDs exist, otherwise false.
   */
  async doAllBrandsExist(brandIds: Brand['id'][]): Promise<boolean> {
    const count = await this.brandRepository.count({
      where: {
        id: In(brandIds),
      },
    });
    return count === brandIds.length;
  }

  /**
   * Allows a user to vote for three brands.
   *
   * @param {User['id']} userId - The ID of the user voting.
   * @param {Brand['id'][]} brandIds - An array containing the IDs of the brands to vote for. Must contain exactly 3 IDs.
   * @throws Will throw an error if `brandIds` is not an array of length 3.
   * @throws Will throw an error if one or more of the selected brands do not exist.
   * @throws Will throw an error if the user has already voted today.
   * @returns {Promise<UserVote>} A promise that resolves to the user's vote for the current day.
   */
  async voteForBrands(
    userId: User['id'],
    brandIds: Brand['id'][],
  ): Promise<UserBrandVotes> {
    // We verify that the brandId is appropriate and meets the voting criteria.
    if (!Array.isArray(brandIds) || brandIds.length !== 3) {
      throw new Error(
        '`brandIds` must be an array with the ids of each brand to vote for.',
      );
    }

    // We verify that the brands to vote for exist in the database.
    const doAllBrandsExist = await this.doAllBrandsExist(brandIds);
    if (!doAllBrandsExist) {
      throw new Error('One or more of the selected brands do not exist.');
    }

    // We get the current date and verify that the user has not voted today.
    const currentDate = Math.floor(new Date().getTime() / 1000);
    const todayVotes = await this.userService.getUserVotes(userId, currentDate);

    if (todayVotes !== undefined) {
      throw new Error('You have already voted today.');
    }

    // If everything has gone well, proceed to vote.
    const vote = this.userBrandVotesRepository.create({
      user: {
        id: userId,
      },
      brand1: {
        id: brandIds[0],
      },
      brand2: {
        id: brandIds[1],
      },
      brand3: {
        id: brandIds[2],
      },
      date: new Date(),
    });

    const savedVote = await this.userBrandVotesRepository.save(vote);

    await this.userService.addPoints(userId, 3);

    return savedVote;
  }
}
