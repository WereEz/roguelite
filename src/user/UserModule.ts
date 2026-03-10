import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserEntity} from './domain/entities/UserEntity';
import {UserRepository} from './infrastructure/repositories/UserRepository';
import {UserService} from './domain/services/UserService';
import {USER_REPOSITORY} from './domain/interfaces/IUserRepository';
import {UserFacade} from './infrastructure/facades/UserFacade';
import {USER_FACADE} from '../base/domain/interfaces/user/IUserFacade';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [
        UserService,
        {
            provide: USER_FACADE,
            useClass: UserFacade,
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserRepository,
        },
    ],
    exports: [USER_FACADE],
})
export class UserModule {}
