import {CombatEventDto} from '../../../../game/domain/dtos/CombatEventDto';
import {CombatResult} from '../../../../game/domain/enums/CombatResult';
import {IPathChoice} from './IPathChoice';

export interface ICombatTurnResult {
    events: CombatEventDto[];
    playerHp: number;
    playerMaxHp: number;
    enemyName: string;
    enemyHp: number;
    enemyMaxHp: number;
    result: CombatResult;
    gameOver: boolean;
    pathChoices: IPathChoice[];
}
