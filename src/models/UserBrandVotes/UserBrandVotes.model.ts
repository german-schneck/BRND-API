/**
 * @file This file defines the User entity with its properties and methods.
 */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from '../User';
import { Brand } from '../Brand';

/**
 * @class UserBrandVotes
 * @classdesc UserBrandVotes class represents the votes of the users for each brands in the system.
 */
@Entity({ name: 'user_brand_votes' })
export class UserBrandVotes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userBrandVotes)
  user: User;

  @ManyToOne(() => Brand, (brand) => brand.userBrandVotes)
  brand: Brand;

  @Column()
  date: Date;

  @Column()
  position: number;
}
