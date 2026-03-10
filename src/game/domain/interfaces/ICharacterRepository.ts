import {CharacterEntity} from '../entities/CharacterEntity';
import {CharacterStatsDto} from '../dtos/CharacterStatsDto';

export const CHARACTER_REPOSITORY = 'CHARACTER_REPOSITORY';

export interface ICharacterRepository {
    create(sessionId: number, stats: CharacterStatsDto): Promise<CharacterEntity>;
    updateHp(characterId: number, hp: number): Promise<void>;
}
