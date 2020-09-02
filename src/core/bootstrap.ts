import VK from 'vk-io';
import { CommandHandler } from './command/command-handler';

export class Bootstrap {
  private readonly vk: VK;
  private readonly commandHandler: CommandHandler;
  
  constructor() {
    this.vk = new VK({
      token: process.env.VK_TOKEN!,
      pollingGroupId: +process.env.GROUP_ID!,
    });
    this.commandHandler = new CommandHandler(this.vk);
  }
  
  async boot(): Promise<void> {
    await this.commandHandler.loadAndHandle();
    await this.vk.updates.startPolling();
    console.log('Bot started');
  }
}