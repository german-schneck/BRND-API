// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

// Models
import { User, UserBrandVotes, UserRoleEnum } from '../../../models';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserBrandVotes)
    private readonly userBrandVotesRepository: Repository<UserBrandVotes>,
  ) {}

  /**
   * Retrieves a user by their ID with optional selected fields and relations.
   *
   * @param {User['id']} id - The ID of the user to retrieve.
   * @param {(keyof User)[]} [select=[]] - Optional array of fields to select.
   * @param {(keyof User)[]} [relations=[]] - Optional array of relations to include.
   * @returns {Promise<User | undefined>} The user entity or undefined if not found.
   */
  async getById(
    id: User['id'],
    select: (keyof User)[] = [],
    relations: (keyof User)[] = [],
  ): Promise<User | undefined> {
    return this.userRepository.findOne({
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
   * Retrieves a user by their Firebase ID.
   *
   * @param {User['fid']} fid - The Firebase ID of the user to retrieve.
   * @returns {Promise<User | undefined>} The user entity or undefined if not found.
   */
  async getByFid(fid: User['fid']): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        fid,
      },
    });
  }

  /**
   * Upserts a user based on the provided Firebase ID. This method checks if a user with the given Firebase ID exists. If the user exists, it updates the user with the provided data; otherwise, it creates a new user with the given data and assigns a default role of USER.
   *
   * @param {User['fid']} fid - The Firebase ID of the user to upsert.
   * @param {Partial<User>} data - An object containing the fields to update for an existing user or to set for a new user.
   * @returns {Promise<{isCreated: boolean; user: User}>} An object containing a boolean flag indicating if a new user was created and the upserted user entity.
   */
  async upsert(
    fid: User['fid'],
    data: Partial<User>,
  ): Promise<{ isCreated: boolean; user: User }> {
    let isCreated: boolean = false;
    let user = await this.userRepository.findOne({
      where: {
        fid,
      },
    });

    if (user) {
      Object.assign(user, data);
    } else {
      isCreated = true;
      user = this.userRepository.create({
        fid,
        ...data,
        role: UserRoleEnum.USER,
      });
    }

    await this.userRepository.save(user);

    return {
      isCreated,
      user,
    };
  }

  /**
   * Creates a new user with the provided Firebase ID, username, and photo URL.
   *
   * @param {User['fid']} fid - The Firebase ID of the user.
   * @param {User['username']} username - The username of the user.
   * @param {User['photoUrl']} photoUrl - The photo URL of the user.
   * @returns {Promise<User>} The newly created user entity.
   */
  async create(
    fid: User['fid'],
    username: User['username'],
    photoUrl: User['photoUrl'],
  ): Promise<User> {
    const newUser = this.userRepository.create({
      fid,
      username,
      photoUrl,
    });

    await this.userRepository.save(newUser);
    return newUser;
  }

  /**
   * Updates a user's data based on the provided user ID.
   *
   * @param {User['id']} id - The ID of the user to update.
   * @param {Partial<User>} data - An object containing the fields to update.
   * @returns {Promise<User>} The updated user entity.
   * @throws {Error} If the user with the specified ID is not found.
   */
  async update(id: User['id'], data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    Object.assign(user, data);
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Adds points to a user's account.
   *
   * @param {User['id']} userId - The ID of the user to add points to.
   * @param {number} points - The number of points to add.
   * @throws {Error} If the user with the specified ID is not found.
   */
  async addPoints(userId: User['id'], points: number) {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    user.points += points;
    await this.userRepository.save(user);
  }

  /**
   * Removes points from a user's account.
   *
   * @param {User['id']} userId - The ID of the user to remove points from.
   * @param {number} points - The number of points to remove.
   * @throws {Error} If the user with the specified ID is not found.
   */
  async removePoints(userId: User['id'], points: number) {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    user.points -= points;
    await this.userRepository.save(user);
  }

  /**
   * Deletes a user by their ID.
   *
   * @param {User['id']} id - The ID of the user to delete.
   * @returns {Promise<boolean>} Returns true if the user was successfully deleted.
   * @throws {Error} If the user with the specified ID is not found.
   */
  async delete(id: User['id']): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    await this.userRepository.remove(user);

    return true;
  }

  /**
   * Retrieves the votes of a user for a specific day.
   *
   * @param {User['id']} id - The ID of the user whose votes are to be retrieved.
   * @param {number} unixDate - The Unix timestamp representing the day for which votes are to be retrieved.
   * @returns {Promise<UserBrandVotes[]>} A promise that resolves to an array of the user's votes for the specified day.
   */
  async getUserVotes(
    id: User['id'],
    unixDate: number,
  ): Promise<UserBrandVotes[]> {
    const date = new Date(unixDate * 1000);
    const startDate = new Date(date.setHours(0, 0, 0, 0));
    const endDate = new Date(date.setHours(23, 59, 59, 999));

    const user = await this.userRepository.findOne({
      select: ['userBrandVotes'],
      where: {
        id,
        userBrandVotes: {
          date: Between(startDate, endDate),
        },
      },
      relations: ['userBrandVotes', 'userBrandVotes.brand'],
    });

    const userBrandVotes = user
      ? user.userBrandVotes.sort((a, b) => a.position - b.position)
      : [];

    return userBrandVotes;
  }
  /**
   * Retrieves the vote history of a user, grouped by day.
   *
   * @param {User['id']} userId - The ID of the user whose vote history is to be retrieved.
   * @param {number} [pageId=1] - The page number to retrieve.
   * @param {number} [limit=60] - The number of votes to retrieve per page.
   * @returns {Promise<{count: number, data: Record<string, UserBrandVotes[]>}>} A promise that resolves to an object containing the total count of votes and an object where keys are dates and values are arrays of votes for that day.
   */
  async getVotesHistory(
    userId: User['id'],
    pageId: number = 1,
    limit: number = 60,
  ): Promise<{ count: number; data: Record<string, UserBrandVotes[]> }> {
    const [votes, count] = await this.userBrandVotesRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['brand'],
      order: { date: 'DESC' },
      skip: (pageId - 1) * limit,
      take: limit,
    });

    if (count === 0) {
      throw new Error(`User with ID ${userId} not found or has no votes.`);
    }

    const data = votes.reduce((acc, vote) => {
      const dateKey = vote.date.toISOString().split('T')[0]; // Group by date (YYYY-MM-DD)
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        id: vote.id,
        date: vote.date,
        position: vote.position,
        brand: {
          id: vote.brand.id,
          name: vote.brand.name,
          imageUrl: vote.brand.imageUrl,
          score: vote.brand.score,
          stateScore: vote.brand.stateScore,
        },
      });
      return acc;
    }, {});

    return {
      count,
      data,
    };
  }
}
