import VK from 'vk-io';
import { CommandHandler } from './command/command-handler';

export class Bootstrap {
  private readonly vk: VK;
  private readonly commandHandler: CommandHandler;
  
  constructor() {
    if (!process.env.VK_TOKEN)
      throw new Error('Not found mandatory "VK_TOKEN" environment variable');
    if (!process.env.GROUP_ID)
      throw new Error('Not found mandatory "GROUP_ID" environment variable');
    
    this.vk = new VK({
      token: process.env.VK_TOKEN,
      pollingGroupId: +process.env.GROUP_ID,
    });
    this.commandHandler = new CommandHandler(this.vk);
  }
  
  public boot(): void {
    this.commandHandler.loadAndHandle();
    this.vk.updates.startPolling();
    console.log('Bot started');
  }
}