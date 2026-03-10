import {InlineKeyboardMarkup} from 'telegraf/types';
import {PlayerAction, playerActionLabel} from '../../../game/domain/enums/PlayerAction';
import * as CallbackData from './CallbackData';
import {MenuButton} from './MenuButton';

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
    NEXT_ROOM: {
        inline_keyboard: [[{text: MenuButton.NEXT_ROOM, callback_data: CallbackData.NEXT_ROOM}]],
    },
    NEW_GAME: {
        inline_keyboard: [[{text: MenuButton.NEW_GAME, callback_data: CallbackData.NEW_GAME}]],
    },
};
