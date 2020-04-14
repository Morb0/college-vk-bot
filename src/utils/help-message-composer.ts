import { Command, CommandHelpCategory } from '../core/command/command';

export class HelpMessageComposer {
  private message = '';
  
  constructor(private readonly commands: Command[]) {}
  
  public composeMessage(): string {
    this.composeByCategories();
    return this.message;
  }
  
  private composeByCategories(): void {
    for (const category of Object.values(CommandHelpCategory))
      this.composeByCategory(category);
  }
  
  private composeByCategory(category: string): void {
    this.message += category+'\n';
    const categoryCommands = this.getCommandsByCategory(category);
    for (const command of categoryCommands)
      this.addCommandToCategory(command);
  }
  
  private getCommandsByCategory(category: string): Command[] {
    return this.commands.filter(cmd => cmd.getHelpCategory() === category);
  }
  
  private addCommandToCategory(command: Command): void {
    const alias = command.getAliasesWithPrefix()[0];
    const description = command.getHelpDescription();
    this.message += `${alias} - ${description}\n`;
  }
}