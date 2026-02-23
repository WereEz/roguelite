import {CombatEventDto} from './CombatEventDto';

export class PlayerAttackResultDto {
    enemyDamage: number;
    events: CombatEventDto[];
}
