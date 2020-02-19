import { MessageContext } from 'vk-io';

export abstract class Command {
  constructor(
    private readonly name: string,
    private readonly aliases: string[],
  ) {
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases;
  }

  abstract execute(ctx: MessageContext): void;
}
