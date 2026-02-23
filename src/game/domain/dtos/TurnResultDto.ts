import {CombatEventDto} from './CombatEventDto';
import {CombatResult} from '../enums/CombatResult';

export class TurnResultDto {
    playerHp: number;
    enemyHp: number;
    events: CombatEventDto[];
    result: CombatResult;
}
