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
import {AltarService} from '../../domain/services/AltarService';
import {IGameFacade} from '../../../base/domain/interfaces/game/IGameFacade';
import {IChooseRoomResult} from '../../../base/domain/interfaces/game/IChooseRoomResult';
import {IInteractionResult} from '../../../base/domain/interfaces/game/IInteractionResult';
import {IPathChoice} from '../../../base/domain/interfaces/game/IPathChoice';
import {IRoomInfoResult} from '../../../base/domain/interfaces/game/IRoomInfoResult';
import {ISessionWithCharacter} from '../../../base/domain/interfaces/game/ISessionWithCharacter';
import {ICombatTurnResult} from '../../../base/domain/interfaces/game/ICombatTurnResult';
import {RoomEntity} from '../../domain/entities/RoomEntity';
import {GameSessionEntity} from '../../domain/entities/GameSessionEntity';
import {CharacterEntity} from '../../domain/entities/CharacterEntity';
import {IEnterRoomHandler} from '../../domain/interfaces/IEnterRoomHandler';
import {CombatResult} from '../../domain/enums/CombatResult';
import {GameSessionStatus} from '../../domain/enums/GameSessionStatus';
import {RoomType} from '../../domain/enums/RoomType';
import {PlayerAction} from '../../domain/enums/PlayerAction';
import {Stat} from '../../domain/enums/Stat';

@Injectable()
export class GameFacade implements IGameFacade {
    private readonly enterRoomHandlers: ReadonlyMap<RoomType, IEnterRoomHandler>;

    constructor(
        private readonly gameSessionService: GameSessionService,
        private readonly characterService: CharacterService,
        private readonly roomService: RoomService,
        private readonly enemyService: EnemyService,
        private readonly combatService: CombatService,
        private readonly roomEnemyService: RoomEnemyService,
        private readonly randomService: RandomService,
        private readonly dungeonGraphService: DungeonGraphService,
        private readonly altarService: AltarService,
    ) {
        const enterCombat: IEnterRoomHandler = (session, room, character) =>
            this.enterCombatRoom(session, room, character);

        const enterAltar: IEnterRoomHandler = (session, room, character) =>
            this.altarService.enterAltar(session, room, character);

        const enterCampfire: IEnterRoomHandler = (session, room, character) =>
            this.altarService.enterCampfire(session, room, character);

        this.enterRoomHandlers = new Map<RoomType, IEnterRoomHandler>([
            [RoomType.ENEMY, enterCombat],
            [RoomType.BOSS, enterCombat],
            [RoomType.CAMPFIRE, enterCampfire],
            [RoomType.ALTAR, enterAltar],
            [RoomType.BLOOD_ALTAR, enterAltar],
        ]);
    }

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

        return {
            session,
            character: session.character,
            currentLayer: session.currentRoom?.layer ?? 0,
        };
    }

    async getPathChoices(sessionId: number, currentRoomId: number | null): Promise<IPathChoice[]> {
        const rooms =
            currentRoomId === null
                ? await this.roomService.findFirstLayerRooms(sessionId)
                : await this.roomService.findNextRooms(currentRoomId);

        return this.roomService.toPathChoices(rooms);
    }

    async getEnterRoomInfo(
        _sessionId: number,
        roomId: number,
        playerHp: number,
        playerMaxHp: number,
    ): Promise<IRoomInfoResult | null> {
        const room = await this.roomService.findByIdWithRoomEnemy(roomId);

        if (!room?.roomEnemy || room.isComplete) return null;

        return this.roomEnemyService.buildRoomInfo(room, playerHp, playerMaxHp);
    }

    @Transactional()
    async chooseRoom(userId: number, roomId: number): Promise<IChooseRoomResult> {
        const session = await this.loadActiveSession(userId);

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

        const handler = this.enterRoomHandlers.get(room.type);

        if (!handler) {
            throw new InternalServerErrorException(`Unhandled room type ${room.type}`);
        }

        return handler(session, room, session.character);
    }

    @Transactional()
    async processCombatTurn(userId: number, action: PlayerAction): Promise<ICombatTurnResult> {
        const session = await this.loadActiveSession(userId);

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
        const roomEnemy = room.roomEnemy;

        const turnResult = this.combatService.processTurn(
            this.characterService.toCombatantStats(character),
            this.roomEnemyService.toCombatantStats(roomEnemy),
            action,
        );

        const isWin = turnResult.result === CombatResult.WIN;
        const isLose = turnResult.result === CombatResult.LOSE;
        const isBossWin = isWin && room.type === RoomType.BOSS;

        const persistOps: Promise<unknown>[] = [
            this.characterService.updateHp(character.id, turnResult.playerHp),
            this.roomEnemyService.updateCurrentHp(roomEnemy.id, isWin ? 0 : turnResult.enemyHp),
        ];

        if (isWin) {
            persistOps.push(this.roomService.completeRoom(room.id));
        }

        if (isBossWin) {
            persistOps.push(
                this.gameSessionService.finishSession(session.id, GameSessionStatus.WON),
            );
        } else if (isLose) {
            persistOps.push(
                this.gameSessionService.finishSession(session.id, GameSessionStatus.LOST),
            );
        }

        await Promise.all(persistOps);

        const pathChoices =
            isWin && !isBossWin
                ? this.roomService.toPathChoices(await this.roomService.findNextRooms(room.id))
                : [];

        return {
            events: turnResult.events,
            playerHp: turnResult.playerHp,
            playerMaxHp: character.maxHp,
            enemyName: roomEnemy.enemy.name,
            enemyHp: turnResult.enemyHp,
            enemyMaxHp: roomEnemy.maxHp,
            result: turnResult.result,
            gameOver: isBossWin || isLose,
            pathChoices,
        };
    }

    @Transactional()
    async useAltar(userId: number, stat: Stat): Promise<IInteractionResult> {
        const {room, character} = await this.loadInteractionRoom(userId, RoomType.ALTAR);

        return this.altarService.useAltar(room, character, stat);
    }

    @Transactional()
    async useBloodAltar(userId: number, stat: Stat): Promise<IInteractionResult> {
        const {session, room, character} = await this.loadInteractionRoom(
            userId,
            RoomType.BLOOD_ALTAR,
        );

        return this.altarService.useBloodAltar(session, room, character, stat);
    }

    @Transactional()
    async leaveBloodAltar(userId: number): Promise<IInteractionResult> {
        const {room, character} = await this.loadInteractionRoom(userId, RoomType.BLOOD_ALTAR);

        return this.altarService.leaveBloodAltar(room, character);
    }

    private async enterCombatRoom(
        session: GameSessionEntity,
        room: RoomEntity,
        character: CharacterEntity,
    ): Promise<IChooseRoomResult> {
        const enemyInfo = this.roomEnemyService.buildRoomInfo(room, character.hp, character.maxHp);

        await this.gameSessionService.setCurrentRoom(session.id, room.id);

        return {
            roomType: room.type,
            roomId: room.id,
            hp: character.hp,
            maxHp: character.maxHp,
            enemyInfo,
            pathChoices: [],
        };
    }

    private async loadActiveSession(userId: number): Promise<GameSessionEntity> {
        const session = await this.gameSessionService.findActiveSessionWithCharacterLocked(userId);

        if (!session) {
            throw new NotFoundException('No active game session');
        }

        return session;
    }

    private async loadInteractionRoom(
        userId: number,
        expectedType: RoomType,
    ): Promise<{
        session: GameSessionEntity;
        room: RoomEntity;
        character: CharacterEntity;
    }> {
        const session = await this.loadActiveSession(userId);

        if (!session.currentRoomId) {
            throw new BadRequestException('Not in a room');
        }

        const room = await this.roomService.findByIdWithRoomEnemy(session.currentRoomId);

        if (!room) {
            throw new BadRequestException('Room not found');
        }

        if (room.type !== expectedType) {
            throw new BadRequestException(`Room is not ${expectedType}`);
        }

        if (room.isComplete) {
            throw new BadRequestException('Room already completed');
        }

        return {session, room, character: session.character};
    }
}
