import { Brand } from '../../../models/Brand';

export type BrandOrderType = 'all' | 'new' | 'trending';

export type BrandCast = {
  creator: string;
  creatorPfp: string;
  creatorPowerBadge: boolean;
  text: string;
  image?: string;
};

export type BrandResponse = {
  brand: Brand;
  casts: BrandCast[];
};
