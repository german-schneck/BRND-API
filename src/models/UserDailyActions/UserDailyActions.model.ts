/**
 * @file This file defines the User entity with its properties and methods.
 */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from '../User';

/**
 * @class UserDailyActions
 * @classdesc UserDailyActions class represents the actions the user perform to get points
 */
@Entity({ name: 'user_daily_actions' })
export class UserDailyActions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userBrandVotes)
  user: User;

  @Column()
  shareFirstTime: boolean;
}
