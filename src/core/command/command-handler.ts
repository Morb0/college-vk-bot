import { VK } from 'vk-io';
import { CommandLoader } from './command-loader';
import { Command } from './command';

export class CommandHandler {
  private readonly commandLoader: CommandLoader;
  
  constructor(private readonly vk: VK) {
    this.commandLoader = new CommandLoader();
  }
  
  async loadAndHandle(): Promise<void> {
    await this.commandLoader.load();
    for (const cmd of this.commandLoader.getAll())
      this.hearCommand(cmd);
  }
  
  private hearCommand(cmd: Command): void {
    console.log(`Hear command: ${cmd.getName()}`);
    this.vk.updates.hear(cmd.getAliasesWithPrefix(), async ctx => {
      try {
        await cmd.execute(ctx);
      } catch (e) {
        console.error('Failed to send execute command:', e.message);
        await ctx.send('❌ При попытки выполнения команды произошла неизвестная ошибка');
      }
    });
  }
}