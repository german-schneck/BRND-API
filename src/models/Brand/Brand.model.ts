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
  ManyToOne,
} from 'typeorm';

import { UserBrandVotes } from '../UserBrandVotes';
import { BrandTags } from '../BrandTags';
import { Category } from '../Category';

/**
 * @class Brand
 * @classdesc Brand class represents a brand in the system.
 */
@Entity({ name: 'brands' })
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  warpcastUrl: string;

  @Column()
  description: string;

  @ManyToOne(() => Category, (category) => category.brands)
  category: Category;

  @Column()
  followerCount: number;

  @Column()
  imageUrl: string;

  @Column()
  profile: string;

  @Column()
  channel: string;

  @Column()
  score: number;

  @Column()
  stateScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserBrandVotes, (userBrandVotes) => userBrandVotes.brand)
  userBrandVotes: UserBrandVotes[];

  @OneToMany(() => BrandTags, (brandTags) => brandTags.brand)
  brandTags: BrandTags[];
}
