import {CharacterEntity} from '../entities/CharacterEntity';
import {CharacterStatsDto} from '../dtos/CharacterStatsDto';
import {ICharacterStatUpdate} from './ICharacterStatUpdate';

export const CHARACTER_REPOSITORY = 'CHARACTER_REPOSITORY';

export interface ICharacterRepository {
    create(sessionId: number, stats: CharacterStatsDto): Promise<CharacterEntity>;
    updateHp(characterId: number, hp: number): Promise<void>;
    applyStatChange(characterId: number, change: ICharacterStatUpdate): Promise<void>;
}
