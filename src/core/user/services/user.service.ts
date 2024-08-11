// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, In } from 'typeorm';

// Models
import {
  User,
  UserBrandVotes,
  UserRoleEnum,
  UserDailyActions,
  Brand,
} from '../../../models';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserBrandVotes)
    private readonly userBrandVotesRepository: Repository<UserBrandVotes>,

    @InjectRepository(UserDailyActions)
    private readonly userDailyActionsRepository: Repository<UserDailyActions>,

    @InjectRepository(Brand)
    private readonly brandRespository: Repository<Brand>,
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

  async addPointsForShareFrame(userId: User['id']): Promise<boolean> {
    let result = false;

    // Add 3 points for sharing a frame only the first time
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    let userDailyActions = await this.userDailyActionsRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!userDailyActions) {
      user.points += 3;
      await this.userRepository.save(user);

      userDailyActions = this.userDailyActionsRepository.create({
        user: user,
        shareFirstTime: true,
      });
      await this.userDailyActionsRepository.save(userDailyActions);

      result = true;
    } else if (userDailyActions.shareFirstTime === false) {
      user.points += 3;
      await this.userRepository.save(user);

      userDailyActions.shareFirstTime = true;
      await this.userDailyActionsRepository.save(userDailyActions);

      result = true;
    }

    return result;
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
   * @returns {Promise<UserBrandVotes>} A promise that resolves to an object of the user's votes for the specified day.
   */
  async getUserVotes(
    id: User['id'],
    unixDate: number,
  ): Promise<UserBrandVotes> {
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
      relations: [
        'userBrandVotes',
        'userBrandVotes.brand1',
        'userBrandVotes.brand2',
        'userBrandVotes.brand3',
      ],
    });

    const userBrandVotes = user ? user.userBrandVotes[0] : undefined;

    return userBrandVotes;
  }

  /**
   * Retrieves the vote history of a user, grouped by day.
   *
   * @param {User['id']} userId - The ID of the user whose vote history is to be retrieved.
   * @param {number} [pageId=1] - The page number for pagination.
   * @param {number} [limit=15] - The number of records to retrieve per page.
   * @returns {Promise<{ count: number; data: Record<string, UserBrandVotes[]> }>} A promise that resolves to an object containing the total count of votes and a record where keys are dates and values are arrays of votes for that day.
   */
  async getVotesHistory(
    userId: User['id'],
    pageId: number = 1,
    limit: number = 15,
  ): Promise<{ count: number; data: Record<string, UserBrandVotes[]> }> {
    const [votes, count] = await this.userBrandVotesRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['brand1', 'brand2', 'brand3'],
      order: { date: 'DESC' },
      skip: (pageId - 1) * limit,
      take: limit,
    });

    if (count === 0) {
      throw new Error(`User with ID ${userId} not found or has no votes.`);
    }

    const groupedVotes = votes.reduce((acc, vote) => {
      const dateKey = vote.date.toISOString().split('T')[0]; // Group by date (YYYY-MM-DD)
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      acc[dateKey] = {
        id: vote.id,
        date: vote.date,
        brand1: {
          id: vote.brand1.id,
          name: vote.brand1.name,
          imageUrl: vote.brand1.imageUrl,
          score: vote.brand1.score,
          stateScore: vote.brand1.stateScore,
          ranking: vote.brand1.ranking,
        },
        brand2: {
          id: vote.brand2.id,
          name: vote.brand2.name,
          imageUrl: vote.brand2.imageUrl,
          score: vote.brand2.score,
          stateScore: vote.brand2.stateScore,
          ranking: vote.brand2.ranking,
        },
        brand3: {
          id: vote.brand3.id,
          name: vote.brand3.name,
          imageUrl: vote.brand3.imageUrl,
          score: vote.brand3.score,
          stateScore: vote.brand3.stateScore,
          ranking: vote.brand3.ranking,
        },
      };
      return acc;
    }, {});

    return {
      count,
      data: groupedVotes,
    };
  }

  async getUserBrands(id: User['id']): Promise<Brand[]> {
    const sql = `
        SELECT SUM(Points) AS Points, Brand
        FROM (
            SELECT COUNT(brand1Id) * 60 AS Points, brand1Id AS Brand
            FROM user_brand_votes
            WHERE userId = ?
            GROUP BY brand1Id
            UNION ALL
            SELECT COUNT(brand2Id) * 30 AS Points, brand2Id AS Brand
            FROM user_brand_votes
            WHERE userId = ?
            GROUP BY brand2Id
            UNION ALL
            SELECT COUNT(brand3Id) * 10 AS Points, brand3Id AS Brand
            FROM user_brand_votes
            WHERE userId = ?
            GROUP BY brand3Id
        ) AS Data
        GROUP BY Brand
        ORDER BY Points DESC
        LIMIT 10
    `;

    const pointsByBrand = await this.userBrandVotesRepository.query(sql, [
      id,
      id,
      id,
    ]);
    const brandIds = pointsByBrand.map((item) => item.Brand);
    const brands = await this.brandRespository.findBy({
      id: In(brandIds),
    });

    // Create JSON object combining points and brand details
    const brandsWithPoints = pointsByBrand.map((data) => {
      const brand = brands.find((b) => b.id === data.Brand);
      return {
        brand: brand, // Include the full brand details
        points: Number(data.Points),
      };
    });

    return brandsWithPoints;
  }
}
