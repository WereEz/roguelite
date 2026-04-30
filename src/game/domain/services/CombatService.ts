import {Injectable} from '@nestjs/common';
import {RandomService} from './RandomService';
import {CombatantStateDto} from '../dtos/CombatantStateDto';
import {CombatEventDto} from '../dtos/CombatEventDto';
import {TurnResultDto} from '../dtos/TurnResultDto';
import {CombatEventType} from '../enums/CombatEventType';
import {CombatResult} from '../enums/CombatResult';
import {PlayerAction} from '../enums/PlayerAction';
import {PlayerAttackResultDto} from '../dtos/PlayerAttackResultDto';
import {EnemyAttackResultDto} from '../dtos/EnemyAttackResultDto';

const BASE_DODGE_CHANCE = 0.1;
const MAX_DODGE_CHANCE = 1;
const MIN_DODGE_CHANCE = 0.1;
const AGILITY_DODGE_FACTOR = 0.05;
const EVADE_DODGE_BONUS = 0.25;
const PRECISE_DAMAGE_MULTIPLIER = 0.9;
const ENDURANCE_REDUCTION_FACTOR = 0.5;

@Injectable()
export class CombatService {
    constructor(private readonly randomService: RandomService) {}

    processTurn(
        character: CombatantStateDto,
        enemy: CombatantStateDto,
        action: PlayerAction,
    ): TurnResultDto {
        const player = {...character};
        const enemyState = {...enemy};
        const events: CombatEventDto[] = [];

        if (player.agility >= enemyState.agility) {
            const playerAttack = this.applyPlayerAttack(player, enemyState, action);

            enemyState.hp -= playerAttack.enemyDamage;
            events.push(...playerAttack.events);

            if (enemyState.hp > 0) {
                const enemyAttack = this.applyEnemyAttack(player, enemyState, action);

                player.hp -= enemyAttack.playerDamage;
                enemyState.hp -= enemyAttack.enemyCounterDamage;
                events.push(...enemyAttack.events);
            }
        } else {
            const enemyAttack = this.applyEnemyAttack(player, enemyState, action);

            player.hp -= enemyAttack.playerDamage;
            enemyState.hp -= enemyAttack.enemyCounterDamage;
            events.push(...enemyAttack.events);

            if (player.hp > 0) {
                const playerAttack = this.applyPlayerAttack(player, enemyState, action);

                enemyState.hp -= playerAttack.enemyDamage;
                events.push(...playerAttack.events);
            }
        }

        const result =
            enemyState.hp <= 0
                ? CombatResult.WIN
                : player.hp <= 0
                  ? CombatResult.LOSE
                  : CombatResult.ONGOING;

        return {
            playerHp: Math.max(0, player.hp),
            enemyHp: Math.max(0, enemyState.hp),
            events,
            result,
        };
    }

    private applyPlayerAttack(
        character: CombatantStateDto,
        enemy: CombatantStateDto,
        action: PlayerAction,
    ): PlayerAttackResultDto {
        if (action === PlayerAction.EVADE) {
            return {enemyDamage: 0, events: []};
        }

        if (action === PlayerAction.PRECISE_STRIKE) {
            const damage = this.reduceByEndurance(this.calcPreciseDamage(character), enemy);

            return {
                enemyDamage: damage,
                events: [{type: CombatEventType.PLAYER_PRECISE_HIT, damage}],
            };
        }

        const enemyDodge = this.calcDodgeChance(enemy, character);

        if (this.randomService.roll(enemyDodge)) {
            return {enemyDamage: 0, events: [{type: CombatEventType.PLAYER_MISS}]};
        }

        const damage = this.reduceByEndurance(this.rollDamage(character), enemy);

        return {enemyDamage: damage, events: [{type: CombatEventType.PLAYER_HIT, damage}]};
    }

    private applyEnemyAttack(
        character: CombatantStateDto,
        enemy: CombatantStateDto,
        action: PlayerAction,
    ): EnemyAttackResultDto {
        const dodgeChance =
            this.calcDodgeChance(character, enemy) +
            (action === PlayerAction.EVADE ? EVADE_DODGE_BONUS : 0);

        if (this.randomService.roll(dodgeChance)) {
            const events: CombatEventDto[] = [{type: CombatEventType.PLAYER_EVADED}];

            if (action === PlayerAction.EVADE) {
                const counterDamage = this.reduceByEndurance(
                    Math.floor(this.rollDamage(character)),
                    enemy,
                );

                events.push({type: CombatEventType.PLAYER_COUNTER, damage: counterDamage});

                return {playerDamage: 0, enemyCounterDamage: counterDamage, events};
            }

            return {playerDamage: 0, enemyCounterDamage: 0, events};
        }

        const events: CombatEventDto[] = [];

        if (action === PlayerAction.EVADE) {
            events.push({type: CombatEventType.PLAYER_EVADE_FAILED});
        }

        const playerDamage = this.reduceByEndurance(this.rollDamage(enemy), character);

        events.push({type: CombatEventType.PLAYER_TOOK_DAMAGE, damage: playerDamage});

        return {playerDamage, enemyCounterDamage: 0, events};
    }

    private rollDamage(attacker: CombatantStateDto): number {
        const variance = this.randomService.intBetween(0, Math.floor(attacker.strength / 2));

        return attacker.strength + variance;
    }

    private calcDodgeChance(defender: CombatantStateDto, attacker: CombatantStateDto): number {
        const diff = (defender.agility - attacker.agility) * AGILITY_DODGE_FACTOR;

        return Math.max(MIN_DODGE_CHANCE, Math.min(MAX_DODGE_CHANCE, BASE_DODGE_CHANCE + diff));
    }

    private calcPreciseDamage(attacker: CombatantStateDto): number {
        return Math.max(1, Math.floor(this.rollDamage(attacker) * PRECISE_DAMAGE_MULTIPLIER));
    }

    private reduceByEndurance(damage: number, defender: CombatantStateDto): number {
        const reduction = Math.floor(defender.endurance * ENDURANCE_REDUCTION_FACTOR);

        return Math.max(1, damage - reduction);
    }
}
