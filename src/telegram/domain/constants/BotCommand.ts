export enum BotCommand {
    START = 'start',
    NEW_GAME = 'newgame',
    STATS = 'stats',
}

const DESCRIPTIONS: Record<BotCommand, string> = {
    [BotCommand.START]: 'Запустить бота',
    [BotCommand.NEW_GAME]: 'Начать или возобновить игру',
    [BotCommand.STATS]: 'Посмотреть характеристики персонажа',
};

export function botCommandDescription(command: BotCommand): string {
    return DESCRIPTIONS[command];
}
