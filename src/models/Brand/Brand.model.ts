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
import { BrandTags } from '../BrandTags';

/**
 * @class Brand
 * @classdesc Brand class represents a brand in the system.
 */
@Entity({ name: 'brands' })
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  description: string;

  @Column()
  followerCount: number;

  @Column()
  imageUrl: string;

  @Column()
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserBrandVotes, (userBrandVotes) => userBrandVotes.brand)
  userBrandVotes: UserBrandVotes[];

  @OneToMany(() => BrandTags, (brandTags) => brandTags.brand)
  brandTags: BrandTags[];
}