import {InlineKeyboardMarkup} from 'telegraf/types';
import {IPathChoice} from '../../../base/domain/interfaces/game/IPathChoice';
import {RoomType} from '../../../game/domain/enums/RoomType';
import {RoomDirection} from '../../../game/domain/enums/RoomDirection';
import {PlayerAction, playerActionLabel} from '../../../game/domain/enums/PlayerAction';
import * as CallbackData from './CallbackData';
import {MenuButton} from './MenuButton';

const DIRECTION_ICONS: Record<RoomDirection, string> = {
    [RoomDirection.LEFT]: '↖️',
    [RoomDirection.CENTER]: '⬆️',
    [RoomDirection.RIGHT]: '↗️',
};

const ROOM_TYPE_LABEL: Record<RoomType, string> = {
    [RoomType.ENEMY]: 'Враг',
    [RoomType.TREASURE]: 'Клад',
    [RoomType.EMPTY]: 'Пустая',
    [RoomType.BOSS]: 'Босс',
};

export const MenuKeyboards = {
    DEFAULT: {
        keyboard: [[{text: MenuButton.NEW_GAME}, {text: MenuButton.STATS}]],
        resize_keyboard: true,
    },
    IN_GAME: {
        keyboard: [[{text: MenuButton.STATS}]],
        resize_keyboard: true,
    },
};

export const Keyboards: Record<string, InlineKeyboardMarkup> = {
    ATTACK: {
        inline_keyboard: [
            [
                {
                    text: playerActionLabel(PlayerAction.STRIKE),
                    callback_data: CallbackData.attack(PlayerAction.STRIKE),
                },
                {
                    text: playerActionLabel(PlayerAction.PRECISE_STRIKE),
                    callback_data: CallbackData.attack(PlayerAction.PRECISE_STRIKE),
                },
                {
                    text: playerActionLabel(PlayerAction.EVADE),
                    callback_data: CallbackData.attack(PlayerAction.EVADE),
                },
            ],
        ],
    },
    NEW_GAME: {
        inline_keyboard: [[{text: MenuButton.NEW_GAME, callback_data: CallbackData.NEW_GAME}]],
    },
};

export function buildPathChoicesKeyboard(choices: IPathChoice[]): InlineKeyboardMarkup {
    if (choices.length > Object.keys(DIRECTION_ICONS).length) {
        throw new Error(`Too many path choices (${choices.length}) for available direction icons`);
    }

    const buttons = choices.map((choice) => ({
        text: `${DIRECTION_ICONS[choice.direction]} ${ROOM_TYPE_LABEL[choice.type]}`,
        callback_data: CallbackData.choosePath(choice.roomId),
    }));

    return {inline_keyboard: [buttons]};
}
