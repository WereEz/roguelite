import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserEntity} from './domain/entities/UserEntity';
import {UserRepository} from './infrastructure/repositories/UserRepository';
import {UserService} from './domain/services/UserService';
import {USER_REPOSITORY} from './domain/interfaces/IUserRepository';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [
        UserService,
        {
            provide: USER_REPOSITORY,
            useClass: UserRepository,
        },
    ],
    exports: [UserService],
})
export class UserModule {}
