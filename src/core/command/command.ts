import { MessageContext } from 'vk-io';

export abstract class Command {
  protected constructor(
    private readonly name: string,
    private readonly aliases: string[],
  ) {}
  
  public getName(): string {
    return this.name;
  }
  
  public getAliases(): string[] {
    return this.aliases;
  }
  
  public getAliasesWithPrefix(): string[] {
    return Command.mapCommandPrefix(this.aliases);
  }

  static mapCommandPrefix(arr: string[]): string[] {
    return arr.map(a => (process.env.CMD_PREFIX || '/') + a);
  }
  
  abstract execute(ctx: MessageContext): void | Promise<void>;
}