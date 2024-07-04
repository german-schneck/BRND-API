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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userBrandVotes)
  user: User;

  @ManyToOne(() => Brand, (brand) => brand.userBrandVotes1)
  brand1: Brand;

  @ManyToOne(() => Brand, (brand) => brand.userBrandVotes2)
  brand2: Brand;

  @ManyToOne(() => Brand, (brand) => brand.userBrandVotes3)
  brand3: Brand;

  @Column()
  date: Date;
}
