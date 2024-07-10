// Dependencies
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// Services
import { VoteService } from './services';

// Models
import { UserBrandVotes } from '../../models';

@ApiTags('vote-service')
@Controller('vote-service')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  /**
   * Retrieves a vote by its ID.
   *
   * @param {Vote['id']} id - The ID of the vote to retrieve.
   * @returns {Promise<Vote | undefined>} The vote entity or undefined if not found.
   */
  @Get('/:id')
  getVoteById(
    @Param('id') id: UserBrandVotes['id'],
  ): Promise<UserBrandVotes | undefined> {
    return this.voteService.getVotesById(id);
  }
}
