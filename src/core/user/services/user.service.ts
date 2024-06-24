// Dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Models
import { User, UserRoleEnum } from '../../../models';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
