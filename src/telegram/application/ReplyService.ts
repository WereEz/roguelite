import {Injectable, OnModuleInit} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {CharacterEntity} from '../../game/domain/entities/CharacterEntity';
import {CombatEventDto} from '../../game/domain/dtos/CombatEventDto';
import {Template} from '../domain/enums/Template';
import {TemplateVar} from '../domain/enums/TemplateVar';
import {BotMessages} from '../domain/constants/BotMessages';
import {CombatEventLabels} from '../domain/constants/CombatEventLabels';
import {IRoomInfoResult} from '../../base/domain/interfaces/game/IRoomInfoResult';
import {ICombatTurnResult} from '../../base/domain/interfaces/game/ICombatTurnResult';

type TemplateContext = Partial<Record<TemplateVar, string | number>>;

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
            [TemplateVar.HP]: character.hp,
            [TemplateVar.MAX_HP]: character.maxHp,
            [TemplateVar.STRENGTH]: character.strength,
            [TemplateVar.ENDURANCE]: character.endurance,
            [TemplateVar.AGILITY]: character.agility,
        });
    }

    private formatEvent(event: CombatEventDto): string {
        return CombatEventLabels[event.type](event);
    }

    private formatEvents(events: CombatEventDto[]): string {
        return events.map((e) => this.formatEvent(e)).join('\n');
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
            [TemplateVar.ENEMY_NAME]: room.enemyName,
            [TemplateVar.ENEMY_HP]: room.enemyHp,
            [TemplateVar.ENEMY_MAX_HP]: room.enemyMaxHp,
            [TemplateVar.HP]: room.playerHp,
            [TemplateVar.MAX_HP]: room.playerMaxHp,
        });
    }

    renderCombatTurn(result: ICombatTurnResult): string {
        return this.render(Template.COMBAT_TURN, {
            [TemplateVar.EVENTS]: this.formatEvents(result.events),
            [TemplateVar.HP]: result.playerHp,
            [TemplateVar.MAX_HP]: result.playerMaxHp,
            [TemplateVar.ENEMY_NAME]: result.enemyName,
            [TemplateVar.ENEMY_HP]: result.enemyHp,
            [TemplateVar.ENEMY_MAX_HP]: result.enemyMaxHp,
        });
    }

    renderCombatWin(result: ICombatTurnResult): string {
        return this.render(Template.COMBAT_WIN, {
            [TemplateVar.EVENTS]: this.formatEvents(result.events),
            [TemplateVar.HP]: result.playerHp,
            [TemplateVar.MAX_HP]: result.playerMaxHp,
            [TemplateVar.ENEMY_NAME]: result.enemyName,
        });
    }

    renderCombatLose(result: ICombatTurnResult): string {
        return this.render(Template.COMBAT_LOSE, {
            [TemplateVar.EVENTS]: this.formatEvents(result.events),
            [TemplateVar.ENEMY_NAME]: result.enemyName,
        });
    }

    renderGameWon(result: ICombatTurnResult): string {
        return this.render(Template.GAME_WON, {
            [TemplateVar.EVENTS]: this.formatEvents(result.events),
            [TemplateVar.HP]: result.playerHp,
            [TemplateVar.MAX_HP]: result.playerMaxHp,
            [TemplateVar.ENEMY_NAME]: result.enemyName,
        });
    }

    renderPathChoices(): string {
        return this.render(Template.PATH_CHOICES, {});
    }

    renderEmptyRoom(layer: number, playerHp: number, playerMaxHp: number): string {
        return this.render(Template.EMPTY_ROOM, {
            [TemplateVar.LAYER]: layer,
            [TemplateVar.HP]: playerHp,
            [TemplateVar.MAX_HP]: playerMaxHp,
        });
    }
}
