import {Injectable} from '@nestjs/common';
import {UserService} from '../../domain/services/UserService';
import {UserEntity} from '../../domain/entities/UserEntity';
import {IUserFacade} from '../../../base/domain/interfaces/user/IUserFacade';

@Injectable()
export class UserFacade implements IUserFacade {
    constructor(private readonly userService: UserService) {}

    findOrCreate(telegramId: number, username?: string): Promise<UserEntity> {
        return this.userService.findOrCreate({telegramId, username});
    }
}
