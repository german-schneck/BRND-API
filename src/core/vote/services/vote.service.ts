// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Models
import { UserBrandVotes } from '../../../models';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(UserBrandVotes)
    private readonly userBrandVotesRepository: Repository<UserBrandVotes>,
  ) {}

  /**
   * Retrieves the votes by id.
   *
   * @param {User['id']} id - The ID of the user whose votes are to be retrieved.
   * @param {number} unixDate - The Unix timestamp representing the day for which votes are to be retrieved.
   * @returns {Promise<UserBrandVotes>} A promise that resolves to an object of the user's votes for the specified day.
   */
  async getVotesById(id: UserBrandVotes['id']): Promise<UserBrandVotes> {
    const userBrandVotes = await this.userBrandVotesRepository.findOne({
      select: ['id', 'brand1', 'brand2', 'brand3', 'date'],
      where: { id },
      relations: ['brand1', 'brand2', 'brand3'],
    });
    return userBrandVotes;
  }
}
