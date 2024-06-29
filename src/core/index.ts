// Dependencies
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './brand/brand.module';
import { UserModule } from './user/user.module';

const CoreModules = [UserModule, BrandModule, AuthModule];

export default CoreModules;
