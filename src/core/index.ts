// Dependencies
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './brand/brand.module';
import { UserModule } from './user/user.module';
import { VoteModule } from './vote/vote.module';

const CoreModules = [UserModule, BrandModule, AuthModule, VoteModule];

export default CoreModules;
