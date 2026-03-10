import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {Transactional} from 'typeorm-transactional';
import {GameSessionService} from '../../domain/services/GameSessionService';
import {CharacterService} from '../../domain/services/CharacterService';
import {RoomService} from '../../domain/services/RoomService';
import {EnemyService} from '../../domain/services/EnemyService';
import {CombatService} from '../../domain/services/CombatService';
import {RoomEnemyService} from '../../domain/services/RoomEnemyService';
import {RandomService} from '../../domain/services/RandomService';
import {IGameFacade} from '../../../base/domain/interfaces/game/IGameFacade';
import {CombatantStateDto} from '../../domain/dtos/CombatantStateDto';
import {CombatResult} from '../../domain/enums/CombatResult';
import {GameSessionStatus} from '../../domain/enums/GameSessionStatus';
import {RoomType} from '../../domain/enums/RoomType';
import {PlayerAction} from '../../domain/enums/PlayerAction';
import {ROOM_LAYOUT} from '../../domain/constants/DungeonLayout';
import {IRoomInfoResult} from '../../../base/domain/interfaces/game/IRoomInfoResult';
import {ISessionWithCharacter} from '../../../base/domain/interfaces/game/ISessionWithCharacter';
import {ICombatTurnResult} from '../../../base/domain/interfaces/game/ICombatTurnResult';

@Injectable()
export class GameFacade implements IGameFacade {
    constructor(
        private readonly gameSessionService: GameSessionService,
        private readonly characterService: CharacterService,
        private readonly roomService: RoomService,
        private readonly enemyService: EnemyService,
        private readonly combatService: CombatService,
        private readonly roomEnemyService: RoomEnemyService,
        private readonly randomService: RandomService,
    ) {}

    @Transactional()
    async initSession(userId: number): Promise<ISessionWithCharacter> {
        const session = await this.gameSessionService.createSession(userId, ROOM_LAYOUT.length);
        const character = await this.characterService.createCharacter(session.id);

        const enemies = await this.enemyService.findAll();

        if (enemies.length === 0) {
            throw new InternalServerErrorException('No enemies found in database');
        }

        const rooms = await this.roomService.generateForSession(session.id, ROOM_LAYOUT);

        await Promise.all(
            rooms
                .filter((room) => room.type === RoomType.ENEMY || room.type === RoomType.BOSS)
                .map((room) => {
                    const enemy = this.randomService.pick(enemies);

                    return this.roomEnemyService.create(room.id, enemy.id, enemy.baseHp);
                }),
        );

        return {session, character};
    }

    async getActiveSessionWithCharacter(userId: number): Promise<ISessionWithCharacter | null> {
        const session = await this.gameSessionService.findActiveSessionWithCharacter(userId);

        if (!session) return null;

        return {session, character: session.character};
    }

    async getEnterRoomInfo(
        sessionId: number,
        roomIndex: number,
        playerHp: number,
        playerMaxHp: number,
    ): Promise<IRoomInfoResult | null> {
        const room = await this.roomService.getRoomByIndexWithRoomEnemy(sessionId, roomIndex);

        if (!room?.roomEnemy) return null;

        return {
            roomNumber: roomIndex,
            enemyName: room.roomEnemy.enemy.name,
            enemyHp: room.roomEnemy.currentHp,
            enemyMaxHp: room.roomEnemy.maxHp,
            playerHp,
            playerMaxHp,
        };
    }

    @Transactional()
    async processCombatTurn(userId: number, action: PlayerAction): Promise<ICombatTurnResult> {
        const session = await this.gameSessionService.findActiveSessionWithCharacterLocked(userId);

        if (!session) {
            throw new NotFoundException('No active game session');
        }

        const roomIndex = session.currentRoomIndex + 1;
        const room = await this.roomService.getRoomByIndexWithRoomEnemy(session.id, roomIndex);

        if (!room?.roomEnemy) {
            throw new BadRequestException('No enemy in current room');
        }

        if (room.isComplete) {
            throw new BadRequestException('Room already completed');
        }

        const character = session.character;

        const playerState: CombatantStateDto = {
            hp: character.hp,
            strength: character.strength,
            endurance: character.endurance,
            agility: character.agility,
        };

        const enemyState: CombatantStateDto = {
            hp: room.roomEnemy.currentHp,
            strength: room.roomEnemy.enemy.strength,
            endurance: room.roomEnemy.enemy.endurance,
            agility: room.roomEnemy.enemy.agility,
        };

        const turnResult = this.combatService.processTurn(playerState, enemyState, action);

        let gameOver = false;

        if (turnResult.result === CombatResult.WIN) {
            await Promise.all([
                this.characterService.updateHp(character.id, turnResult.playerHp),
                this.roomEnemyService.updateCurrentHp(room.roomEnemy.id, 0),
                this.roomService.completeRoom(session.id, roomIndex),
            ]);

            if (roomIndex >= session.totalRooms) {
                await this.gameSessionService.finishSession(session.id, GameSessionStatus.WON);
                gameOver = true;
            } else {
                await this.gameSessionService.advanceRoom(session.id);
            }
        } else if (turnResult.result === CombatResult.LOSE) {
            await Promise.all([
                this.characterService.updateHp(character.id, turnResult.playerHp),
                this.roomEnemyService.updateCurrentHp(room.roomEnemy.id, turnResult.enemyHp),
                this.gameSessionService.finishSession(session.id, GameSessionStatus.LOST),
            ]);
            gameOver = true;
        } else {
            await Promise.all([
                this.characterService.updateHp(character.id, turnResult.playerHp),
                this.roomEnemyService.updateCurrentHp(room.roomEnemy.id, turnResult.enemyHp),
            ]);
        }

        return {
            events: turnResult.events,
            playerHp: turnResult.playerHp,
            playerMaxHp: character.maxHp,
            enemyName: room.roomEnemy.enemy.name,
            enemyHp: turnResult.enemyHp,
            enemyMaxHp: room.roomEnemy.maxHp,
            result: turnResult.result,
            gameOver,
        };
    }
}
