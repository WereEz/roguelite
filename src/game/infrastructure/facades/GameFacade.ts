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
import {DungeonGraphService} from '../../domain/services/DungeonGraphService';
import {IGameFacade} from '../../../base/domain/interfaces/game/IGameFacade';
import {IChooseRoomResult} from '../../../base/domain/interfaces/game/IChooseRoomResult';
import {IPathChoice} from '../../../base/domain/interfaces/game/IPathChoice';
import {IRoomInfoResult} from '../../../base/domain/interfaces/game/IRoomInfoResult';
import {ISessionWithCharacter} from '../../../base/domain/interfaces/game/ISessionWithCharacter';
import {ICombatTurnResult} from '../../../base/domain/interfaces/game/ICombatTurnResult';
import {CombatantStateDto} from '../../domain/dtos/CombatantStateDto';
import {CombatResult} from '../../domain/enums/CombatResult';
import {GameSessionStatus} from '../../domain/enums/GameSessionStatus';
import {RoomType} from '../../domain/enums/RoomType';
import {PlayerAction} from '../../domain/enums/PlayerAction';

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
        private readonly dungeonGraphService: DungeonGraphService,
    ) {}

    @Transactional()
    async initSession(userId: number): Promise<ISessionWithCharacter> {
        const session = await this.gameSessionService.createSession(userId);
        const character = await this.characterService.createCharacter(session.id);

        const enemies = await this.enemyService.findAll();

        if (enemies.length === 0) {
            throw new InternalServerErrorException('No enemies found in database');
        }

        const graph = this.dungeonGraphService.generate();
        const rooms = await this.roomService.generateGraph(session.id, graph);

        await Promise.all(
            rooms
                .filter((room) => room.type === RoomType.ENEMY || room.type === RoomType.BOSS)
                .map((room) => {
                    const enemy = this.randomService.pick(enemies);

                    return this.roomEnemyService.create(room.id, enemy.id, enemy.baseHp);
                }),
        );

        return {session, character, currentLayer: 0};
    }

    async getActiveSessionWithCharacter(userId: number): Promise<ISessionWithCharacter | null> {
        const session = await this.gameSessionService.findActiveSessionWithCharacter(userId);

        if (!session) return null;

        return {session, character: session.character, currentLayer: session.currentRoom?.layer ?? 0};
    }

    async getPathChoices(
        sessionId: number,
        currentRoomId: number | null,
    ): Promise<IPathChoice[]> {
        const rooms = currentRoomId === null
            ? await this.roomService.findFirstLayerRooms(sessionId)
            : await this.roomService.findNextRooms(currentRoomId);

        return rooms.map((r) => ({roomId: r.id, type: r.type, direction: r.direction}));
    }

    async getEnterRoomInfo(
        _sessionId: number,
        roomId: number,
        playerHp: number,
        playerMaxHp: number,
    ): Promise<IRoomInfoResult | null> {
        const room = await this.roomService.findByIdWithRoomEnemy(roomId);

        if (!room?.roomEnemy || room.isComplete) return null;

        return {
            roomNumber: room.layer,
            enemyName: room.roomEnemy.enemy.name,
            enemyHp: room.roomEnemy.currentHp,
            enemyMaxHp: room.roomEnemy.maxHp,
            playerHp,
            playerMaxHp,
        };
    }

    @Transactional()
    async chooseRoom(userId: number, roomId: number): Promise<IChooseRoomResult> {
        const session = await this.gameSessionService.findActiveSessionWithCharacterLocked(userId);

        if (!session) {
            throw new NotFoundException('No active game session');
        }

        if (session.currentRoom && !session.currentRoom.isComplete) {
            throw new BadRequestException('Finish the current room first');
        }

        const room = await this.roomService.findByIdWithRoomEnemyIfReachable(
            roomId,
            session.id,
            session.currentRoomId,
        );

        if (!room) {
            throw new BadRequestException('Room is not reachable from current position');
        }

        if (room.isComplete) {
            throw new BadRequestException('Room already completed');
        }

        const playerHp = session.character.hp;
        const playerMaxHp = session.character.maxHp;

        if (room.type === RoomType.ENEMY || room.type === RoomType.BOSS) {
            if (!room.roomEnemy) {
                throw new InternalServerErrorException(
                    `Room ${roomId} (type ${room.type}) has no enemy`,
                );
            }

            await this.gameSessionService.setCurrentRoom(session.id, roomId);

            const enemyInfo: IRoomInfoResult = {
                roomNumber: room.layer,
                enemyName: room.roomEnemy.enemy.name,
                enemyHp: room.roomEnemy.currentHp,
                enemyMaxHp: room.roomEnemy.maxHp,
                playerHp,
                playerMaxHp,
            };

            return {roomType: room.type, layer: room.layer, playerHp, playerMaxHp, enemyInfo, pathChoices: []};
        }

        await Promise.all([
            this.gameSessionService.setCurrentRoom(session.id, roomId),
            this.roomService.completeRoom(roomId),
        ]);

        const nextRooms = await this.roomService.findNextRooms(roomId);
        const pathChoices: IPathChoice[] = nextRooms.map((r) => ({roomId: r.id, type: r.type, direction: r.direction}));

        return {roomType: room.type, layer: room.layer, playerHp, playerMaxHp, pathChoices};
    }

    @Transactional()
    async processCombatTurn(userId: number, action: PlayerAction): Promise<ICombatTurnResult> {
        const session = await this.gameSessionService.findActiveSessionWithCharacterLocked(userId);

        if (!session) {
            throw new NotFoundException('No active game session');
        }

        if (!session.currentRoomId) {
            throw new BadRequestException('Not in a room');
        }

        const room = await this.roomService.findByIdWithRoomEnemy(session.currentRoomId);

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
        let pathChoices: IPathChoice[] = [];

        if (turnResult.result === CombatResult.WIN) {
            await Promise.all([
                this.characterService.updateHp(character.id, turnResult.playerHp),
                this.roomEnemyService.updateCurrentHp(room.roomEnemy.id, 0),
                this.roomService.completeRoom(room.id),
            ]);

            if (room.type === RoomType.BOSS) {
                await this.gameSessionService.finishSession(session.id, GameSessionStatus.WON);
                gameOver = true;
            } else {
                const nextRooms = await this.roomService.findNextRooms(room.id);

                pathChoices = nextRooms.map((r) => ({roomId: r.id, type: r.type, direction: r.direction}));
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
            pathChoices,
        };
    }
}