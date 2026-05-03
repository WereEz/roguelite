import {ICharacterStats} from '../../../../game/domain/interfaces/ICharacterStats';
import {IBloodAltarState} from './IBloodAltarState';
import {IPathChoice} from './IPathChoice';
import {IStatBoost} from './IStatBoost';

export interface IInteractionResult {
    character: ICharacterStats;
    boost?: IStatBoost;
    bloodAltarState?: IBloodAltarState;
    pathChoices: IPathChoice[];
    roomComplete: boolean;
    gameOver: boolean;
}
