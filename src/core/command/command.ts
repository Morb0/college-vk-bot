import { MessageContext } from 'vk-io';

export enum CommandHelpCategory {
  Timetable = '📅 Расписание',
  // Profile = '👤 Профиль',
  // Fun = '🌸 Развлечения',
  Other = '🛠️ Остальное',
}

export abstract class Command {
  static mapCommandPrefix(arr: string[]): string[] {
    return arr.map(a => (process.env.CMD_PREFIX || '/') + a);
  }

  protected constructor(
    private readonly name: string,
    private readonly aliases: string[],
    private readonly helpCategory: CommandHelpCategory = CommandHelpCategory.Other,
    private readonly helpDescription: string = 'NONE',
  ) {
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases;
  }

  public getAliasesWithPrefix(): string[] {
    return Command.mapCommandPrefix(this.aliases);
  }

  public getHelpCategory(): CommandHelpCategory {
    return this.helpCategory;
  }
  
  public getHelpDescription(): string {
    return this.helpDescription;
  }

  abstract execute(ctx: MessageContext): void | Promise<void>;
}