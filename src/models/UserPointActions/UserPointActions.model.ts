/**
 * @file This file defines the User entity with its properties and methods.
 */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from '../User';

/**
 * @class UserPointActions
 * @classdesc UserPointActions class represents the actions the user perform to get points
 */
@Entity({ name: 'user_point_actions' })
export class UserPointActions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userBrandVotes)
  user: User;

  @Column()
  shareFirstTime: boolean;
}
