import {Injectable, OnModuleInit} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {CharacterEntity} from '../../game/domain/entities/CharacterEntity';
import {Template} from '../domain/enums/Template';
import {TemplateVar} from '../domain/enums/TemplateVar';
import {BotMessages} from '../domain/constants/BotMessages';
import {IRoomInfoResult} from '../../base/domain/interfaces/game/IRoomInfoResult';
import {ICombatTurnResult} from '../../base/domain/interfaces/game/ICombatTurnResult';
import {IInteractionResult} from '../../base/domain/interfaces/game/IInteractionResult';
import {formatCombatEvents} from './formatters/combatEvents';
import {
    TemplateContext,
    boostVars,
    characterStats,
    enemyState,
    playerVitals,
} from './templateContexts';

@Injectable()
export class ReplyService implements OnModuleInit {
    private static readonly TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
    private static readonly TEMPLATE_EXT = '.hbs';
    private static readonly DEFAULT_USERNAME = BotMessages.DEFAULT_USERNAME;

    private readonly templates = new Map<Template, string>();

    onModuleInit(): void {
        for (const file of fs.readdirSync(ReplyService.TEMPLATES_DIR)) {
            if (file.endsWith(ReplyService.TEMPLATE_EXT)) {
                const name = path.basename(file, ReplyService.TEMPLATE_EXT) as Template;

                const content = fs.readFileSync(
                    path.join(ReplyService.TEMPLATES_DIR, file),
                    'utf-8',
                );

                this.templates.set(name, content);
            }
        }
    }

    private render(name: Template, ctx: TemplateContext): string {
        const template = this.templates.get(name);

        if (!template) throw new Error(`Template "${name}" not found`);

        return template.replace(/{{(\w+)}}/g, (_, key: string) =>
            String(ctx[key as TemplateVar] ?? ''),
        );
    }

    private renderCharacter(character: CharacterEntity): string {
        return this.render(Template.CHARACTER, {
            ...playerVitals(character),
            ...characterStats(character),
        });
    }

    renderStart(username?: string): string {
        return this.render(Template.START, {
            [TemplateVar.USERNAME]: username ?? ReplyService.DEFAULT_USERNAME,
        });
    }

    renderNewGame(isNew: boolean, roomNumber: number, character: CharacterEntity): string {
        return this.render(isNew ? Template.NEW_GAME_NEW : Template.NEW_GAME_RESUMED, {
            [TemplateVar.ROOM_NUMBER]: roomNumber,
            [TemplateVar.CHARACTER]: this.renderCharacter(character),
        });
    }

    renderStats(roomNumber: number, character: CharacterEntity): string {
        return this.render(Template.STATS, {
            [TemplateVar.ROOM_NUMBER]: roomNumber,
            [TemplateVar.CHARACTER]: this.renderCharacter(character),
        });
    }

    renderEnterRoom(room: IRoomInfoResult): string {
        return this.render(Template.ENTER_ROOM, {
            [TemplateVar.ROOM_NUMBER]: room.roomNumber,
            ...enemyState(room),
            ...playerVitals({hp: room.playerHp, maxHp: room.playerMaxHp}),
        });
    }

    renderCombatTurn(result: ICombatTurnResult): string {
        return this.render(Template.COMBAT_TURN, {
            [TemplateVar.EVENTS]: formatCombatEvents(result.events),
            ...playerVitals({hp: result.playerHp, maxHp: result.playerMaxHp}),
            ...enemyState(result),
        });
    }

    renderCombatWin(result: ICombatTurnResult): string {
        return this.render(Template.COMBAT_WIN, {
            [TemplateVar.EVENTS]: formatCombatEvents(result.events),
            ...playerVitals({hp: result.playerHp, maxHp: result.playerMaxHp}),
            [TemplateVar.ENEMY_NAME]: result.enemyName,
        });
    }

    renderCombatLose(result: ICombatTurnResult): string {
        return this.render(Template.COMBAT_LOSE, {
            [TemplateVar.EVENTS]: formatCombatEvents(result.events),
            [TemplateVar.ENEMY_NAME]: result.enemyName,
        });
    }

    renderGameWon(result: ICombatTurnResult): string {
        return this.render(Template.GAME_WON, {
            [TemplateVar.EVENTS]: formatCombatEvents(result.events),
            ...playerVitals({hp: result.playerHp, maxHp: result.playerMaxHp}),
            [TemplateVar.ENEMY_NAME]: result.enemyName,
        });
    }

    renderPathChoices(): string {
        return this.render(Template.PATH_CHOICES, {});
    }

    renderCampfire(healed: number, hp: number, maxHp: number): string {
        return this.render(Template.CAMPFIRE, {
            [TemplateVar.HEALED]: healed,
            ...playerVitals({hp, maxHp}),
        });
    }

    renderAltarPrompt(hp: number, maxHp: number): string {
        return this.render(Template.ALTAR, playerVitals({hp, maxHp}));
    }

    renderAltarDone(result: IInteractionResult): string {
        return this.render(Template.ALTAR_DONE, {
            ...characterStats(result.character),
            ...playerVitals(result.character),
            ...boostVars(result.boost),
        });
    }

    renderBloodAltarPrompt(prompt: {
        hp: number;
        maxHp: number;
        usesRemaining: number;
        nextCost: number;
    }): string {
        return this.render(Template.BLOOD_ALTAR, {
            ...playerVitals(prompt),
            [TemplateVar.USES_REMAINING]: prompt.usesRemaining,
            [TemplateVar.NEXT_COST]: prompt.nextCost,
        });
    }

    renderBloodAltarDone(result: IInteractionResult): string {
        return this.render(Template.BLOOD_ALTAR_DONE, {
            ...characterStats(result.character),
            ...playerVitals(result.character),
            ...boostVars(result.boost),
        });
    }

    renderBloodAltarDeath(result: IInteractionResult): string {
        return this.render(Template.BLOOD_ALTAR_DEATH, characterStats(result.character));
    }
}
