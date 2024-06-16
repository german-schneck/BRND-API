/**
 * @file This file defines the User entity with its properties and methods.
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { UserBrandVotes } from '../UserBrandVotes';

// Types
import { UserRoleEnum } from './';

/**
 * @class User
 * @classdesc User class represents a user in the system.
 */
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fid: number;

  @Column()
  username: string;

  @Column()
  photoUrl: string;

  @Column()
  role: UserRoleEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserBrandVotes, (userBrandVotes) => userBrandVotes.user)
  userBrandVotes: UserBrandVotes[];
}
