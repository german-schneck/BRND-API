/**
 * @file This file defines the User entity with its properties and methods.
 */
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { Brand } from '../Brand';
import { Tag } from '../Tag';

/**
 * @class BrandTags
 * @classdesc BrandTags class represents the tags of a brand in the system.
 */
@Entity({ name: 'brand_tags' })
export class BrandTags {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tag, (tag) => tag.brandTags)
  tag: Tag;

  @ManyToOne(() => Brand, (brand) => brand.brandTags)
  brand: Brand;
}
