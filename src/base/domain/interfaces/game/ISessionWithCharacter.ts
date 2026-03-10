import {GameSessionEntity} from '../../../../game/domain/entities/GameSessionEntity';
import {CharacterEntity} from '../../../../game/domain/entities/CharacterEntity';

export interface ISessionWithCharacter {
    session: GameSessionEntity;
    character: CharacterEntity;
}
