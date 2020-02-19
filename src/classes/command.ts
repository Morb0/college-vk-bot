import MessageContext from 'vk-io/lib/structures/contexts/message';

class CommandUtilities {
  static mapCommandPrefix(arr: string[]): string[] {
    return arr.map(a => (process.env.CMD_PREFIX || '/') + a);
  }
}

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
    return CommandUtilities.mapCommandPrefix(this.aliases);
  }
  
  abstract execute(ctx: MessageContext): void | Promise<void>;
}