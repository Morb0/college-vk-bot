import { VK } from 'vk-io';
import { Command } from './command';
import { CommandLoader } from './command-loader';

export class VKBot {
  private vk: VK;
  private commandLoader: CommandLoader;

  constructor() {
    this.vk = new VK({
      token: process.env.VK_TOKEN,
    });
    this.commandLoader = new CommandLoader();
  }

  public async bootstrap() {
    await this.bootstrapCommands();
    await this.vk.updates.startPolling();
  }

  private async bootstrapCommands() {
    await this.commandLoader.load();
    this.setupCommandHandlers();
  }

  private setupCommandHandlers() {
    for (const command of this.commandLoader.get())
      this.hearCommand(command);
  }

  private hearCommand(cmd: Command) {
    this.vk.updates.hear(cmd.getAliases(), cmd.execute);
  }
}
