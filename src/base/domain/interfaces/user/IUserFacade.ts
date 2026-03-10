import {UserEntity} from '../../../../user/domain/entities/UserEntity';

export const USER_FACADE = Symbol('USER_FACADE');

export interface IUserFacade {
    findOrCreate(telegramId: number, username?: string): Promise<UserEntity>;
}
