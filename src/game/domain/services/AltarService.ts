import {Injectable} from '@nestjs/common';
import {RoomEntity} from '../entities/RoomEntity';
import {GameSessionEntity} from '../entities/GameSessionEntity';
import {CharacterEntity} from '../entities/CharacterEntity';
import {RoomType} from '../enums/RoomType';
import {Stat} from '../enums/Stat';
import {GameSessionStatus} from '../enums/GameSessionStatus';
import {GameSessionService} from './GameSessionService';
import {CharacterService} from './CharacterService';
import {RoomService} from './RoomService';
import {IChooseRoomResult} from '../../../base/domain/interfaces/game/IChooseRoomResult';
import {IInteractionResult} from '../../../base/domain/interfaces/game/IInteractionResult';
import {IStatBoost} from '../../../base/domain/interfaces/game/IStatBoost';
import {IStatBoostResult} from '../interfaces/IStatBoostResult';

export const CAMPFIRE_HEAL_RATIO = 0.4;
export const BLOOD_ALTAR_MAX_USES = 3;
export const BLOOD_ALTAR_COST_RATIO = 1 / 3;
export const ALTAR_STAT_BOOST = 1;

@Injectable()
export class AltarService {
    constructor(
        private readonly gameSessionService: GameSessionService,
        private readonly characterService: CharacterService,
        private readonly roomService: RoomService,
    ) {}

    async enterCampfire(
        session: GameSessionEntity,
        room: RoomEntity,
        character: CharacterEntity,
    ): Promise<IChooseRoomResult> {
        const healAmount = Math.floor(character.maxHp * CAMPFIRE_HEAL_RATIO);
        const newHp = Math.min(character.maxHp, character.hp + healAmount);
        const actualHeal = newHp - character.hp;

        await Promise.all([
            this.gameSessionService.setCurrentRoom(session.id, room.id),
            this.characterService.updateHp(character.id, newHp),
            this.roomService.completeRoom(room.id),
        ]);

        const pathChoices = await this.buildPathChoices(room.id);

        return {
            roomType: room.type,
            roomId: room.id,
            hp: newHp,
            maxHp: character.maxHp,
            healedAmount: actualHeal,
            pathChoices,
        };
    }

    async enterAltar(
        session: GameSessionEntity,
        room: RoomEntity,
        character: CharacterEntity,
    ): Promise<IChooseRoomResult> {
        await this.gameSessionService.setCurrentRoom(session.id, room.id);

        const result: IChooseRoomResult = {
            roomType: room.type,
            roomId: room.id,
            hp: character.hp,
            maxHp: character.maxHp,
            pathChoices: [],
        };

        if (room.type === RoomType.BLOOD_ALTAR) {
            result.bloodAltarState = this.bloodAltarStateAfter(
                character.maxHp,
                room.interactionCount,
            );
        }

        return result;
    }

    async useAltar(
        room: RoomEntity,
        character: CharacterEntity,
        stat: Stat,
    ): Promise<IInteractionResult> {
        const boostResult = await this.characterService.boostStat(
            character,
            character.id,
            stat,
            ALTAR_STAT_BOOST,
        );

        await this.roomService.completeRoom(room.id);

        const pathChoices = await this.buildPathChoices(room.id);

        return {
            character: boostResult.stats,
            boost: toStatBoost(stat, boostResult),
            pathChoices,
            roomComplete: true,
            gameOver: false,
        };
    }

    async useBloodAltar(
        session: GameSessionEntity,
        room: RoomEntity,
        character: CharacterEntity,
        stat: Stat,
    ): Promise<IInteractionResult> {
        const cost = bloodAltarCost(character.maxHp);
        const hpAfterCost = character.hp - cost;
        const usesAfter = room.interactionCount + 1;

        if (hpAfterCost <= 0) {
            await Promise.all([
                this.characterService.updateHp(character.id, 0),
                this.roomService.incrementInteractionCount(room.id),
                this.roomService.completeRoom(room.id),
                this.gameSessionService.finishSession(session.id, GameSessionStatus.LOST),
            ]);

            return {
                character: {...character, hp: 0},
                pathChoices: [],
                roomComplete: true,
                gameOver: true,
            };
        }

        await this.characterService.updateHp(character.id, hpAfterCost);

        const boostResult = await this.characterService.boostStat(
            {...character, hp: hpAfterCost},
            character.id,
            stat,
            ALTAR_STAT_BOOST,
        );

        await this.roomService.incrementInteractionCount(room.id);

        const exhausted = usesAfter >= BLOOD_ALTAR_MAX_USES;

        if (exhausted) {
            await this.roomService.completeRoom(room.id);

            const pathChoices = await this.buildPathChoices(room.id);

            return {
                character: boostResult.stats,
                boost: toStatBoost(stat, boostResult),
                pathChoices,
                roomComplete: true,
                gameOver: false,
            };
        }

        return {
            character: boostResult.stats,
            boost: toStatBoost(stat, boostResult),
            bloodAltarState: this.bloodAltarStateAfter(boostResult.stats.maxHp, usesAfter),
            pathChoices: [],
            roomComplete: false,
            gameOver: false,
        };
    }

    async leaveBloodAltar(
        room: RoomEntity,
        character: CharacterEntity,
    ): Promise<IInteractionResult> {
        await this.roomService.completeRoom(room.id);

        const pathChoices = await this.buildPathChoices(room.id);

        return {
            character,
            pathChoices,
            roomComplete: true,
            gameOver: false,
        };
    }

    private bloodAltarStateAfter(maxHp: number, interactionCount: number) {
        return {
            usesRemaining: BLOOD_ALTAR_MAX_USES - interactionCount,
            nextCost: bloodAltarCost(maxHp),
        };
    }

    private async buildPathChoices(fromRoomId: number) {
        const next = await this.roomService.findNextRooms(fromRoomId);

        return this.roomService.toPathChoices(next);
    }
}

function bloodAltarCost(maxHp: number): number {
    return Math.ceil(maxHp * BLOOD_ALTAR_COST_RATIO);
}

function toStatBoost(stat: Stat, result: IStatBoostResult): IStatBoost {
    return {
        stat,
        statDelta: result.statDelta,
        hpDelta: result.hpDelta,
        maxHpDelta: result.maxHpDelta,
    };
}
