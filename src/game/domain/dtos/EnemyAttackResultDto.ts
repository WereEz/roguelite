import {CombatEventDto} from './CombatEventDto';

export class EnemyAttackResultDto {
    playerDamage: number;
    enemyCounterDamage: number;
    events: CombatEventDto[];
}
