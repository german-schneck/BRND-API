// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { VoteController } from './vote.controller';

// Services
import { VoteService } from './services';

// Models
import { UserBrandVotes } from '../../models';

@Module({
  imports: [TypeOrmModule.forFeature([UserBrandVotes])],
  controllers: [VoteController],
  providers: [VoteService],
})
export class VoteModule {}
